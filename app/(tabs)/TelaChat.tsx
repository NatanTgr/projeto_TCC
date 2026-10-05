import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Alert,
  Pressable,
  StatusBar,
  Text,
  View,
} from 'react-native';

import BotaoAlerta from '../../components/BotaoAlerta';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';

import { supabase } from '../../lib/supabase';
import { styles, colors } from '../../style';
import { useTheme } from '../../context/ThemeContext';
import { useFontSize } from '../../context/FontSizeContext';

import AvatarImagem from '../../components/AvatarImagem';
import { buscarAvatar } from '../../components/avatares';

type Usuario = {
  id: string;
  nome: string;
  email: string;
  campus: string | null;
  tipo: 'estudante' | 'tutor' | 'professor';
  avatar: string | null;
  fixado?: boolean;
  mensagemNaoLida?: boolean;
  ultimaMensagemData?: string | null;
};

export default function Chat() {
  const router = useRouter();

  const { tema, tipoTema, carregando: carregandoTema } = useTheme();
  const { escalaFonte } = useFontSize();

  const fonte = (tamanho: number) =>
    Math.round(tamanho * escalaFonte);

  const tipoBarraStatus =
    tipoTema === 'escuro' || tipoTema === 'forte'
      ? 'light-content'
      : 'dark-content';

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosOcultos, setUsuariosOcultos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [tipoLogado, setTipoLogado] =
    useState<Usuario['tipo']>('estudante');

  const [abaAtiva, setAbaAtiva] = useState<string>('professor');
  const [modalFiltroVisible, setModalFiltroVisible] = useState(false);

  const [campusLogado, setCampusLogado] =
    useState<string | null>(null);

  const [idsSelecionados, setIdsSelecionados] = useState<string[]>([]);

  const [usuarioLogadoId, setUsuarioLogadoId] =
    useState<string | null>(null);

  // CARREGAR USUÁRIOS AO ENTRAR/RETORNAR PARA A TELA

  useFocusEffect(
    useCallback(() => {
      carregarUsuarios();
    }, [])
  );

  // REALTIME — NOVAS MENSAGENS

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let ativo = true;

    const iniciarRealtimeLista = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user || !ativo) return;

      setUsuarioLogadoId(user.id);

      channel = supabase
        .channel(`lista-chat-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mensagens',
            filter: `destinatario=eq.${user.id}`,
          },
          (payload) => {
            if (!ativo) return;

            const novaMensagem = payload.new as {
              remetente: string;
              destinatario: string;
              data_envio: string;
              lida?: boolean;
            };

            if (novaMensagem.destinatario !== user.id) return;
            if (novaMensagem.lida === true) return;

            setUsuarios((atual) =>
              atual.map((usuario) =>
                usuario.id === novaMensagem.remetente
                  ? {
                      ...usuario,
                      mensagemNaoLida: true,
                      ultimaMensagemData: novaMensagem.data_envio,
                    }
                  : usuario
              )
            );
          }
        )
        .subscribe();
    };

    iniciarRealtimeLista();

    return () => {
      ativo = false;

      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // ABA PADRÃO DE ACORDO COM O PAPEL

  useEffect(() => {
    if (tipoLogado === 'professor') {
      setAbaAtiva('estudante');
    } else {
      setAbaAtiva('professor');
    }
  }, [tipoLogado]);

  // CARREGAR USUÁRIOS OCULTOS

  const carregarUsuariosOcultos = async (usuarioId: string) => {
    const { data, error } = await supabase
      .from('usuarios_filtros')
      .select('usuario_oculto_id')
      .eq('usuario_id', usuarioId);

    if (error) {
      console.error('Erro ao carregar usuários ocultos:', error);
      return [];
    }

    const ocultos = (data || []).map(
      (item) => item.usuario_oculto_id
    );

    setUsuariosOcultos(ocultos);
    return ocultos;
  };

  // CARREGAR USUÁRIOS

  const carregarUsuarios = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace('/login');
        return;
      }

      setUsuarioLogadoId(user.id);

      const ocultos = await carregarUsuariosOcultos(user.id);

      // USUÁRIOS FIXADOS

      const { data: fixados, error: fixadosError } = await supabase
        .from('usuarios_fixados')
        .select('usuario_fixado_id')
        .eq('usuario_id', user.id);

      if (fixadosError) {
        console.error(
          'Erro ao carregar usuários fixados:',
          fixadosError
        );
      }

      const idsFixados = new Set(
        (fixados || []).map((item) => item.usuario_fixado_id)
      );

      // MENSAGENS NÃO LIDAS

      const {
        data: mensagensNaoLidas,
        error: naoLidasError,
      } = await supabase
        .from('mensagens')
        .select('remetente, data_envio')
        .eq('destinatario', user.id)
        .eq('lida', false)
        .order('data_envio', { ascending: false });

      if (naoLidasError) {
        console.error(
          'Erro ao carregar mensagens não lidas:',
          naoLidasError
        );
      }

      const naoLidasPorRemetente = new Map<string, string>();

      (mensagensNaoLidas || []).forEach((mensagem) => {
        if (!naoLidasPorRemetente.has(mensagem.remetente)) {
          naoLidasPorRemetente.set(
            mensagem.remetente,
            mensagem.data_envio
          );
        }
      });

      // DADOS DO USUÁRIO LOGADO

      const { data: dadosUsuarioLogado } = await supabase
        .from('usuarios')
        .select('campus, tipo')
        .eq('id', user.id)
        .single();

      const meuCampus = dadosUsuarioLogado?.campus || null;

      const meuTipo = (
        dadosUsuarioLogado?.tipo || 'estudante'
      ) as Usuario['tipo'];

      setCampusLogado(meuCampus);
      setTipoLogado(meuTipo);

      // OUTROS USUÁRIOS DO MESMO CAMPUS

      let query = supabase
        .from('usuarios')
        .select('id, nome, email, campus, tipo, avatar')
        .neq('id', user.id);

      if (meuCampus) {
        query = query.eq('campus', meuCampus);
      }

      const { data, error } = await query.order('nome', {
        ascending: true,
      });

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        return;
      }

      const listaUsuarios = (data || []).map((usuario) => ({
        ...usuario,
        fixado: idsFixados.has(usuario.id),
        mensagemNaoLida: naoLidasPorRemetente.has(usuario.id),
        ultimaMensagemData:
          naoLidasPorRemetente.get(usuario.id) || null,
      })) as Usuario[];

      setUsuarios(listaUsuarios);

      const idsVisiveis = listaUsuarios
        .filter((u) => !ocultos.includes(u.id))
        .map((u) => u.id);

      setIdsSelecionados(idsVisiveis);
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  // ABAS PERMITIDAS

  const getAbasPermitidas = () => {
    switch (tipoLogado) {
      case 'estudante':
        return [
          { key: 'professor', label: 'Professores' },
          { key: 'tutor', label: 'Tutores' },
        ];

      case 'tutor':
        return [
          { key: 'professor', label: 'Professores' },
          { key: 'estudante', label: 'Alunos' },
        ];

      case 'professor':
        return [
          { key: 'estudante', label: 'Alunos' },
          { key: 'tutor', label: 'Tutores' },
        ];

      default:
        return [
          { key: 'professor', label: 'Professores' },
          { key: 'tutor', label: 'Tutores' },
        ];
    }
  };

  const abasPermitidas = getAbasPermitidas();

  // ABRIR CONVERSA

  const abrirConversa = (usuario: Usuario) => {
    setUsuarios((atual) =>
      atual.map((item) =>
        item.id === usuario.id
          ? {
              ...item,
              mensagemNaoLida: false,
            }
          : item
      )
    );

    router.push({
      pathname: '/TelaConversa' as any,
      params: {
        usuarioId: usuario.id,
        usuarioNome: usuario.nome,
        usuarioTipo: usuario.tipo,
      },
    });
  };

  // FIXAR / DESFIXAR

  const toggleFixar = async (id: string) => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace('/login');
        return;
      }

      const usuario = usuarios.find((u) => u.id === id);

      if (!usuario) return;

      if (usuario.fixado) {
        const { error } = await supabase
          .from('usuarios_fixados')
          .delete()
          .eq('usuario_id', user.id)
          .eq('usuario_fixado_id', id);

        if (error) {
          console.error(
            'Erro ao remover usuário dos fixados:',
            error
          );

          Alert.alert(
            'Erro',
            'Não foi possível desfixar este usuário.'
          );
          return;
        }

        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, fixado: false } : u
          )
        );
      } else {
        const { error } = await supabase
          .from('usuarios_fixados')
          .upsert(
            {
              usuario_id: user.id,
              usuario_fixado_id: id,
            },
            {
              onConflict: 'usuario_id,usuario_fixado_id',
              ignoreDuplicates: true,
            }
          );

        if (error) {
          console.error(
            'Erro ao adicionar usuário aos fixados:',
            error
          );

          Alert.alert(
            'Erro',
            'Não foi possível fixar este usuário.'
          );
          return;
        }

        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, fixado: true } : u
          )
        );
      }
    } catch (error) {
      console.error('Erro ao alterar usuário fixado:', error);

      Alert.alert(
        'Erro',
        'Ocorreu um erro ao alterar a fixação do usuário.'
      );
    }
  };

  // FILTRO

  const toggleSelecionFiltro = async (id: string) => {
    if (!usuarioLogadoId) return;

    const estaSelecionado = idsSelecionados.includes(id);

    if (estaSelecionado) {
      const { error } = await supabase
        .from('usuarios_filtros')
        .upsert(
          {
            usuario_id: usuarioLogadoId,
            usuario_oculto_id: id,
          },
          {
            onConflict: 'usuario_id,usuario_oculto_id',
            ignoreDuplicates: true,
          }
        );

      if (error) {
        console.error('Erro ao salvar filtro no banco:', error);
      }

      setIdsSelecionados((prev) =>
        prev.filter((i) => i !== id)
      );
      setUsuariosOcultos((prev) => [...prev, id]);
    } else {
      const { error } = await supabase
        .from('usuarios_filtros')
        .delete()
        .eq('usuario_id', usuarioLogadoId)
        .eq('usuario_oculto_id', id);

      if (error) {
        console.error('Erro ao remover filtro do banco:', error);
      }

      setIdsSelecionados((prev) => [...prev, id]);
      setUsuariosOcultos((prev) =>
        prev.filter((i) => i !== id)
      );
    }
  };

  const selecionarTodosNaAba = async () => {
    if (!usuarioLogadoId) return;

    const idsDaAba = usuariosParaFiltrarNaAba.map(
      (usuario) => usuario.id
    );

    const todosSelecionados = idsDaAba.every((id) =>
      idsSelecionados.includes(id)
    );

    if (todosSelecionados) {
      const novosOcultos = Array.from(
        new Set([...usuariosOcultos, ...idsDaAba])
      );

      for (const id of idsDaAba) {
        await supabase
          .from('usuarios_filtros')
          .upsert(
            {
              usuario_id: usuarioLogadoId,
              usuario_oculto_id: id,
            },
            {
              onConflict: 'usuario_id,usuario_oculto_id',
              ignoreDuplicates: true,
            }
          );
      }

      setUsuariosOcultos(novosOcultos);
      setIdsSelecionados((prev) =>
        prev.filter((id) => !idsDaAba.includes(id))
      );
    } else {
      const novosOcultos = usuariosOcultos.filter(
        (id) => !idsDaAba.includes(id)
      );

      for (const id of idsDaAba) {
        await supabase
          .from('usuarios_filtros')
          .delete()
          .eq('usuario_id', usuarioLogadoId)
          .eq('usuario_oculto_id', id);
      }

      setUsuariosOcultos(novosOcultos);
      setIdsSelecionados((prev) =>
        Array.from(new Set([...prev, ...idsDaAba]))
      );
    }
  };

  // CORES POR TIPO

  const getCorTipo = (tipo: Usuario['tipo']) => {
    switch (tipo) {
      case 'estudante':
        return colors.student;
      case 'tutor':
        return colors.tutor;
      case 'professor':
        return colors.professor;
      default:
        return colors.primary;
    }
  };

  // FORMATAÇÃO DO NOME

  const formatarNome = (
    nome: string | null,
    email: string,
    tipo: string
  ) => {
    const nomeExibicao = nome || email;

    if (
      tipo === 'professor' &&
      !nomeExibicao.startsWith('Prof.')
    ) {
      return `Prof. ${nomeExibicao}`;
    }

    return nomeExibicao;
  };

  // FIXADOS > NÃO LIDOS > DEMAIS

  const usuariosFiltrados = usuarios
    .filter(
      (u) =>
        u.tipo === abaAtiva &&
        idsSelecionados.includes(u.id)
    )
    .sort((a, b) => {
      if (a.fixado !== b.fixado) {
        return a.fixado ? -1 : 1;
      }

      if (a.mensagemNaoLida !== b.mensagemNaoLida) {
        return a.mensagemNaoLida ? -1 : 1;
      }

      if (a.mensagemNaoLida && b.mensagemNaoLida) {
        const dataA = a.ultimaMensagemData
          ? new Date(a.ultimaMensagemData).getTime()
          : 0;

        const dataB = b.ultimaMensagemData
          ? new Date(b.ultimaMensagemData).getTime()
          : 0;

        return dataB - dataA;
      }

      return 0;
    });

  const usuariosParaFiltrarNaAba = usuarios.filter(
    (u) => u.tipo === abaAtiva
  );

  // CARTÃO DO USUÁRIO

  const renderUsuario = ({ item }: { item: Usuario }) => {
    const cor = getCorTipo(item.tipo);
    const avatarEscolhido = buscarAvatar(item.avatar);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.chatUserItem,
          { backgroundColor: tema.modal },
          pressed && styles.chatUserItemPressed,
        ]}
        onPress={() => abrirConversa(item)}
      >
        <View
          style={[
            styles.chatUserAvatar,
            {
              backgroundColor: cor,
              overflow: 'hidden',
            },
          ]}
        >
          {avatarEscolhido ? (
            <AvatarImagem
              uri={avatarEscolhido.url}
              tamanho={50}
            />
          ) : (
            <Ionicons
              name={
                item.tipo === 'professor'
                  ? 'person'
                  : 'people'
              }
              size={25}
              color={colors.white}
            />
          )}
        </View>

        <View
          style={[
            styles.chatUserInfo,
            { flex: 1, minWidth: 0 },
          ]}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text
              style={[
                styles.chatUserName,
                {
                  color: tema.text,
                  fontSize: 16 * escalaFonte,
                  flex: 1,
                  minWidth: 0,
                },
              ]}
            >
              {formatarNome(item.nome, item.email, item.tipo)}
            </Text>

            {item.mensagemNaoLida && (
              <View
                accessible
                accessibilityLabel="Mensagem não lida"
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: cor,
                  marginLeft: 8,
                  flexShrink: 0,
                }}
              />
            )}
          </View>

          <Text
            style={[
              styles.chatUserType,
              {
                color: tema.text,
                fontSize: 13 * escalaFonte,
              },
            ]}
          >
            {item.mensagemNaoLida
              ? 'Nova mensagem'
              : 'Última mensagem...'}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            item.fixado
              ? `Desfixar ${item.nome}`
              : `Fixar ${item.nome}`
          }
          style={{
            minWidth: 44,
            minHeight: 44,
            padding: 8,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          onPress={(event) => {
            event.stopPropagation();
            void toggleFixar(item.id);
          }}
        >
          <Ionicons
            name={
              item.fixado
                ? 'bookmark'
                : 'bookmark-outline'
            }
            size={25}
            color={
              item.fixado
                ? colors.primary
                : colors.placeholder
            }
          />
        </Pressable>
      </Pressable>
    );
  };

  // TELA

  return (
    <SafeAreaView
      edges={["left", "right", "top"]}
      style={[
        styles.chatContainer,
        {
          flex: 1,
          backgroundColor: tema.background,
        },
      ]}
    >
      <StatusBar barStyle={tipoBarraStatus} backgroundColor={tema.background} />

      {/* CABEÇALHO */}

      <View style={[styles.chatHeader, { flexShrink: 0 }]}>
        <View style={styles.chatTopRow}>
          <Text
            style={[
              styles.chatHeaderTitle,
              {
                color: tema.text,
                fontSize: 30 * escalaFonte,
              },
            ]}
          >
            Conversas ({campusLogado || "Geral"})
          </Text>

          <View style={{ flexShrink: 0 }}>
            <BotaoAlerta />
          </View>
        </View>
      </View>

      {/* ABAS */}

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          paddingHorizontal: 15,
          paddingVertical: 2,
          gap: 12,
          backgroundColor: tema.background,
        }}
      >
        {abasPermitidas.map((aba) => {
          const selecionada = abaAtiva === aba.key;

          return (
            <Pressable
              key={aba.key}
              style={{
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: 140,
                minHeight: 48,
                paddingHorizontal: 12,
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: selecionada
                  ? aba.key === "professor"
                    ? "#94C0DF"
                    : "#88C688"
                  : tema.modal,
                alignItems: "center",
                justifyContent: "center",
                elevation: 2,
              }}
              onPress={() => setAbaAtiva(aba.key)}
            >
              <Text
                style={{
                  fontSize: 15 * escalaFonte,
                  fontWeight: "600",
                  textAlign: "center",
                  color: tema.text,
                }}
              >
                {aba.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* FILTRO */}

      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12,
          alignItems: "flex-end",
          backgroundColor: tema.background,
        }}
      >
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.border + "50",
            minHeight: 30,
            maxWidth: "100%",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 12,
            gap: 6,
          }}
          onPress={() => setModalFiltroVisible(true)}
        >
          <Ionicons
            name="filter"
            size={16 * escalaFonte}
            color={tema.secondaryText}
          />

          <Text
            style={{
              fontSize: 13 * escalaFonte,
              fontWeight: "600",
              color: tema.text + 95,
              flexShrink: 1,
              textAlign: "center",
            }}
          >
            Filtrar
          </Text>
        </Pressable>
      </View>

      {/* CONTEÚDO */}

      {loading || carregandoTema ? (
        <View style={styles.chatLoadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />

          <Text
            style={[
              styles.chatLoadingText,
              {
                color: tema.text,
                fontSize: 14 * escalaFonte,
              },
            ]}
          >
            Carregando usuários...
          </Text>
        </View>
      ) : usuariosFiltrados.length === 0 ? (
        <View style={styles.chatEmptyContainer}>
          <Ionicons
            name="chatbubbles-outline"
            size={64 * escalaFonte}
            color={tema.placeholder}
          />

          <Text
            style={[
              styles.chatEmptyTitle,
              {
                color: tema.text,
                fontSize: 18 * escalaFonte,
              },
            ]}
          >
            Nenhum usuário disponível
          </Text>

          <Text
            style={[
              styles.chatEmptyText,
              {
                color: tema.text,
                fontSize: 14 * escalaFonte,
              },
            ]}
          >
            Ajuste os filtros para exibir conversas.
          </Text>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={usuariosFiltrados}
          extraData={escalaFonte}
          keyExtractor={(item) => item.id}
          renderItem={renderUsuario}
          contentContainerStyle={styles.chatUsersList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* MODAL DE FILTRO */}

      <Modal
        visible={modalFiltroVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalFiltroVisible(false)}
      >
        <SafeAreaView
          edges={["top", "bottom", "left", "right"]}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.55)",
          }}
        >
          <View
            accessibilityViewIsModal
            style={{
              width: "100%",
              maxWidth: 540,
              maxHeight: "85%",
              alignSelf: "center",
              backgroundColor: tema.modal,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              overflow: "hidden",
            }}
          >
            {/* CABEÇALHO FIXO */}

            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 15,
                flexShrink: 0,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  columnGap: 12,
                  rowGap: 4,
                  marginBottom: 5,
                }}
              >
                <Text
                  accessibilityRole="header"
                  style={{
                    flexGrow: 1,
                    flexShrink: 1,
                    flexBasis: 140,
                    minWidth: 0,
                    fontSize: 18 * escalaFonte,
                    fontWeight: "bold",
                    color: tema.text,
                  }}
                >
                  Filtrar{" "}
                  {abasPermitidas.find((aba) => aba.key === abaAtiva)?.label ||
                    ""}
                </Text>

                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked:
                      usuariosParaFiltrarNaAba.length > 0 &&
                      usuariosParaFiltrarNaAba.every((u) =>
                        idsSelecionados.includes(u.id),
                      ),
                  }}
                  disabled={usuariosParaFiltrarNaAba.length === 0}
                  onPress={selecionarTodosNaAba}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    minHeight: 44,
                    maxWidth: "100%",
                    marginLeft: "auto",
                    gap: 6,
                  }}
                >
                  <Ionicons
                    name={
                      usuariosParaFiltrarNaAba.length > 0 &&
                      usuariosParaFiltrarNaAba.every((u) =>
                        idsSelecionados.includes(u.id),
                      )
                        ? "checkbox"
                        : "square-outline"
                    }
                    size={22}
                    color={
                      usuariosParaFiltrarNaAba.length > 0 &&
                      usuariosParaFiltrarNaAba.every((u) =>
                        idsSelecionados.includes(u.id),
                      )
                        ? colors.primary
                        : tema.text
                    }
                    style={{ flexShrink: 0 }}
                  />

                  <Text
                    style={{
                      fontSize: 13 * escalaFonte,
                      fontWeight: "600",
                      color: tema.text,
                      flexShrink: 1,
                      textAlign: "right",
                    }}
                  >
                    {usuariosParaFiltrarNaAba.length > 0 &&
                    usuariosParaFiltrarNaAba.every((u) =>
                      idsSelecionados.includes(u.id),
                    )
                      ? "Desmarcar todos"
                      : "Selecionar todos"}
                  </Text>
                </Pressable>
              </View>

              <Text
                style={{
                  fontSize: 13 * escalaFonte,
                  color: tema.text,
                }}
              >
                Selecione quais{" "}
                {abasPermitidas
                  .find((aba) => aba.key === abaAtiva)
                  ?.label.toLowerCase() || ""}{" "}
                deseja exibir:
              </Text>
            </View>

            {/* SOMENTE A LISTA ROLA */}

            <ScrollView
              style={{
                flexGrow: 0,
                flexShrink: 1,
                minHeight: 0,
              }}
              contentContainerStyle={{
                paddingHorizontal: 20,
              }}
              showsVerticalScrollIndicator={false}
            >
              {usuariosParaFiltrarNaAba.map((item) => {
                const selecionado = idsSelecionados.includes(item.id);

                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="checkbox"
                    accessibilityState={{
                      checked: selecionado,
                    }}
                    accessibilityLabel={formatarNome(
                      item.nome,
                      item.email,
                      item.tipo,
                    )}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      minHeight: 48,
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: tema.border,
                    }}
                    onPress={() => toggleSelecionFiltro(item.id)}
                  >
                    <Ionicons
                      name={selecionado ? "checkbox" : "square-outline"}
                      size={22}
                      color={selecionado ? colors.primary : tema.text}
                      style={{
                        marginRight: 10,
                        flexShrink: 0,
                      }}
                    />

                    <View
                      style={{
                        flex: 1,
                        minWidth: 0,
                        gap: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15 * escalaFonte,
                          fontWeight: "500",
                          color: tema.text,
                        }}
                      >
                        {formatarNome(item.nome, item.email, item.tipo)}
                      </Text>

                      <Text
                        style={{
                          fontSize: 12 * escalaFonte,
                          color: tema.text,
                        }}
                      >
                        {item.email}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* BOTÃO FIXO */}

            <View
              style={{
                padding: 20,
                flexShrink: 0,
              }}
            >
              <Pressable
                accessibilityRole="button"
                style={{
                  minHeight: 48,
                  backgroundColor: colors.primary,
                  paddingHorizontal: 12,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => setModalFiltroVisible(false)}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontWeight: "bold",
                    fontSize: 16 * escalaFonte,
                    textAlign: "center",
                  }}
                >
                  Aplicar Filtro
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}