import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
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

  const [usuariosOcultos, setUsuariosOcultos] = useState<string[]>([]);

  const { tema, tipoTema, carregando: carregandoTema } = useTheme();
  const { escalaFonte } = useFontSize();

  const fonte = (tamanho: number) =>
    Math.round(tamanho * escalaFonte);

  const tipoBarraStatus =
    tipoTema === 'escuro' || tipoTema === 'forte'
      ? 'light-content'
      : 'dark-content';

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const [tipoLogado, setTipoLogado] =
    useState<Usuario['tipo']>('estudante');

  const [abaAtiva, setAbaAtiva] =
    useState<string>('professor');

  const [modalFiltroVisible, setModalFiltroVisible] =
    useState(false);

  const [campusLogado, setCampusLogado] =
    useState<string | null>(null);

  const [idsSelecionados, setIdsSelecionados] =
    useState<string[]>([]);

  const [usuarioLogadoId, setUsuarioLogadoId] =
    useState<string | null>(null);

  // ============================================================
  // CARREGAR USUÁRIOS AO ENTRAR/RETORNAR PARA A TELA
  // ============================================================

  useFocusEffect(
    useCallback(() => {
      carregarUsuarios();
    }, [])
  );

  // ============================================================
  // REALTIME - NOVAS MENSAGENS
  // ============================================================

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
                      ultimaMensagemData:
                        novaMensagem.data_envio,
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

  // ============================================================
  // ALTERA A ABA PADRÃO DE ACORDO COM O TIPO DO USUÁRIO
  // ============================================================

  useEffect(() => {
    if (tipoLogado === 'professor') {
      setAbaAtiva('estudante');
    } else {
      setAbaAtiva('professor');
    }
  }, [tipoLogado]);

  const carregarUsuariosOcultos = async (usuarioId: string) => {
    const { data, error } = await supabase
      .from('usuarios_filtros')
      .select('usuario_oculto_id')
      .eq('usuario_id', usuarioId);

    if (error) {
      console.error(
        'Erro ao carregar usuários ocultos:',
        error
      );
      return [];
    }

    const ocultos = (data || []).map(
      (item) => item.usuario_oculto_id
    );
    setUsuariosOcultos(ocultos);
    return ocultos;
  };

  // ============================================================
  // CARREGAR USUÁRIOS
  // ============================================================

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

      // --------------------------------------------------------
      // USUÁRIOS FIXADOS
      // --------------------------------------------------------

      const { data: fixados, error: fixadosError } =
        await supabase
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
        (fixados || []).map(
          (item) => item.usuario_fixado_id
        )
      );

      // --------------------------------------------------------
      // MENSAGENS NÃO LIDAS
      // --------------------------------------------------------

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

      const naoLidasPorRemetente = new Map<
        string,
        string
      >();

      (mensagensNaoLidas || []).forEach((mensagem) => {
        if (
          !naoLidasPorRemetente.has(
            mensagem.remetente
          )
        ) {
          naoLidasPorRemetente.set(
            mensagem.remetente,
            mensagem.data_envio
          );
        }
      });

      // --------------------------------------------------------
      // DADOS DO USUÁRIO LOGADO
      // --------------------------------------------------------

      const { data: dadosUsuarioLogado } =
        await supabase
          .from('usuarios')
          .select('campus, tipo')
          .eq('id', user.id)
          .single();

      const meuCampus =
        dadosUsuarioLogado?.campus || null;

      const meuTipo =
        (dadosUsuarioLogado?.tipo ||
          'estudante') as Usuario['tipo'];

      setCampusLogado(meuCampus);
      setTipoLogado(meuTipo);

      // --------------------------------------------------------
      // BUSCAR OUTROS USUÁRIOS DO MESMO CAMPUS
      // --------------------------------------------------------

      let query = supabase
        .from('usuarios')
        .select(
          'id, nome, email, campus, tipo, avatar'
        )
        .neq('id', user.id);

      if (meuCampus) {
        query = query.eq('campus', meuCampus);
      }

      const { data, error } =
        await query.order('nome', {
          ascending: true,
        });

      if (error) {
        console.error(
          'Erro ao carregar usuários:',
          error
        );
        return;
      }

      const listaUsuarios = (data || []).map(
        (usuario) => ({
          ...usuario,
          fixado: idsFixados.has(usuario.id),
          mensagemNaoLida:
            naoLidasPorRemetente.has(usuario.id),
          ultimaMensagemData:
            naoLidasPorRemetente.get(
              usuario.id
            ) || null,
        })
      ) as Usuario[];

      setUsuarios(listaUsuarios);

      const idsVisiveis = listaUsuarios
        .filter((u) => !ocultos.includes(u.id))
        .map((u) => u.id);

      setIdsSelecionados(idsVisiveis);
    } catch (error) {
      console.error(
        'Erro inesperado:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ABAS PERMITIDAS
  // ============================================================

  const getAbasPermitidas = () => {
    switch (tipoLogado) {
      case 'estudante':
        return [
          {
            key: 'professor',
            label: 'Professores',
          },
          {
            key: 'tutor',
            label: 'Tutores',
          },
        ];

      case 'tutor':
        return [
          {
            key: 'professor',
            label: 'Professores',
          },
          {
            key: 'estudante',
            label: 'Alunos',
          },
        ];

      case 'professor':
        return [
          {
            key: 'estudante',
            label: 'Alunos',
          },
          {
            key: 'tutor',
            label: 'Tutores',
          },
        ];

      default:
        return [
          {
            key: 'professor',
            label: 'Professores',
          },
          {
            key: 'tutor',
            label: 'Tutores',
          },
        ];
    }
  };

  const abasPermitidas = getAbasPermitidas();

  // ============================================================
  // ABRIR CONVERSA
  // ============================================================

  const abrirConversa = (usuario: Usuario) => {
    // Remove imediatamente a bolinha
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

  // ============================================================
  // FIXAR / DESFIXAR
  // ============================================================

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

      const usuario = usuarios.find(
        (u) => u.id === id
      );

      if (!usuario) {
        return;
      }

      if (usuario.fixado) {
        // DESFIXAR USUÁRIO
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
            u.id === id
              ? {
                  ...u,
                  fixado: false,
                }
              : u
          )
        );
      } else {
        // FIXAR USUÁRIO
        const { error } = await supabase
          .from('usuarios_fixados')
          .upsert(
            {
              usuario_id: user.id,
              usuario_fixado_id: id,
            },
            {
              onConflict:
                'usuario_id,usuario_fixado_id',
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
            u.id === id
              ? {
                  ...u,
                  fixado: true,
                }
              : u
          )
        );
      }
    } catch (error) {
      console.error(
        'Erro ao alterar usuário fixado:',
        error
      );

      Alert.alert(
        'Erro',
        'Ocorreu um erro ao alterar a fixação do usuário.'
      );
    }
  };

  // ============================================================
  // FILTRO
  // ============================================================

  const toggleSelecionFiltro = async (id: string) => {
    if (!usuarioLogadoId) return;

    const estaSelecionado = idsSelecionados.includes(id);

    if (estaSelecionado) {
      // Desmarcar: salvar no banco em usuarios_filtros
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

      setIdsSelecionados((prev) => prev.filter((i) => i !== id));
      setUsuariosOcultos((prev) => [...prev, id]);
    } else {
      // Marcar novamente: remover registro do banco
      const { error } = await supabase
        .from('usuarios_filtros')
        .delete()
        .eq('usuario_id', usuarioLogadoId)
        .eq('usuario_oculto_id', id);

      if (error) {
        console.error('Erro ao remover filtro do banco:', error);
      }

      setIdsSelecionados((prev) => [...prev, id]);
      setUsuariosOcultos((prev) => prev.filter((i) => i !== id));
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
      // Desmarcar todos da aba: adicionar todos ao banco de ocultos
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
      // Selecionar todos da aba: remover todos do banco de ocultos
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

  // ============================================================
  // CORES POR TIPO
  // ============================================================

  const getCorTipo = (
    tipo: Usuario['tipo']
  ) => {
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

  // ============================================================
  // FORMATAÇÃO DO NOME
  // ============================================================

  const formatarNome = (
    nome: string | null,
    email: string,
    tipo: string
  ) => {
    const nomeExibicao =
      nome || email;

    if (
      tipo === 'professor' &&
      !nomeExibicao.startsWith('Prof.')
    ) {
      return `Prof. ${nomeExibicao}`;
    }

    return nomeExibicao;
  };

  // ============================================================
  // USUÁRIOS FILTRADOS
  // FIXADOS > NÃO LIDOS > DEMAIS
  // ============================================================

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

      if (
        a.mensagemNaoLida !==
        b.mensagemNaoLida
      ) {
        return a.mensagemNaoLida
          ? -1
          : 1;
      }

      if (
        a.mensagemNaoLida &&
        b.mensagemNaoLida
      ) {
        const dataA =
          a.ultimaMensagemData
            ? new Date(
                a.ultimaMensagemData
              ).getTime()
            : 0;

        const dataB =
          b.ultimaMensagemData
            ? new Date(
                b.ultimaMensagemData
              ).getTime()
            : 0;

        return dataB - dataA;
      }

      return 0;
    });

  const usuariosParaFiltrarNaAba =
    usuarios.filter(
      (u) => u.tipo === abaAtiva
    );

  // ============================================================
  // ITEM DO USUÁRIO
  // ============================================================

  const renderUsuario = ({
    item,
  }: {
    item: Usuario;
  }) => {
    const cor = getCorTipo(item.tipo);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.chatUserItem,

          {
            backgroundColor: tema.card,
            borderColor: tema.border,
          },

          pressed && {
            opacity: 0.75,
          },
        ]}
        onPress={() =>
          abrirConversa(item)
        }
      >
        {/* AVATAR */}
        <View
          style={[
            styles.chatUserAvatar,
            {
              backgroundColor: cor,
              overflow: 'hidden',
            },
          ]}
        >
          {buscarAvatar(item.avatar) ? (
            <AvatarImagem
              uri={
                buscarAvatar(item.avatar)!.url
              }
              tamanho={50}
            />
          ) : (
            <Ionicons
              name={
                item.tipo === 'professor'
                  ? 'person'
                  : 'people'
              }
              size={25 * escalaFonte}
              color={tema.textoBotao}
            />
          )}
        </View>

        {/* INFORMAÇÕES */}
        <View
          style={[
            styles.chatUserInfo,
            {
              flex: 1,
            },
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
                  flex: 1,
                  color: tema.text,
                  fontSize: fonte(16),
                },
              ]}
              numberOfLines={1}
            >
              {formatarNome(
                item.nome,
                item.email,
                item.tipo
              )}
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
                }}
              />
            )}
          </View>

          <Text
            style={[
              styles.chatUserType,
              {
                color: tema.secondaryText,
                fontSize: fonte(13),
              },
            ]}
          >
            {item.mensagemNaoLida
              ? 'Nova mensagem'
              : 'Última mensagem...'}
          </Text>
        </View>

        {/* FIXAR */}
        <Pressable
          style={{
            padding: 8,
          }}
          onPress={(e) =>
            toggleFixar(item.id)
          }
        >
          <Ionicons
            name={
              item.fixado
                ? 'bookmark'
                : 'bookmark-outline'
            }
            size={21 * escalaFonte}
            color={
              item.fixado
                ? '#FFAA56'
                : tema.secondaryText
            }
          />
        </Pressable>
      </Pressable>
    );
  };

  // ============================================================
  // TELA
  // ============================================================

  return (
    <SafeAreaView
      edges={[
        'left',
        'right',
        'bottom',
      ]}
      style={[
        styles.chatContainer,
        {
          flex: 1,
          backgroundColor:
            tema.background,
        },
      ]}
    >
      <StatusBar
        barStyle={tipoBarraStatus}
        backgroundColor={
          tema.background
        }
      />

      {/* ======================================================
          CABEÇALHO
      ====================================================== */}

      <View
        style={[
          styles.chatHeader,
          {
            paddingTop:
              Platform.OS === 'android'
                ? (StatusBar.currentHeight ||
                    24) +
                  4
                : 8,

            minHeight:
              Platform.OS === 'android'
                ? 72 +
                  (StatusBar.currentHeight ||
                    24)
                : 64,

            flexDirection: 'row',
            alignItems: 'center',
            justifyContent:
              'space-between',

            paddingHorizontal: 16,

            backgroundColor:
              tema.background,

            borderBottomWidth: 0,
          },
        ]}
      >
        <View
          style={
            styles.chatHeaderTitleContainer
          }
        >
          <Text
            style={[
              styles.chatHeaderTitle,
              {
                color: tema.text,
                fontSize: fonte(25),
              },
            ]}
          >
            Conversas (
            {campusLogado || 'Geral'})
          </Text>
        </View>

        {/* ALERTA */}
        <BotaoAlerta />
      
      </View>

      {/* ======================================================
          ABAS
      ====================================================== */}

      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingTop: 2,
          paddingBottom: 2,
          gap: 12,
          backgroundColor:
            tema.background,
        }}
      >
        {abasPermitidas.map((aba) => {
          const selecionada =
            abaAtiva === aba.key;

          return (
            <Pressable
              key={aba.key}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 14,

                backgroundColor:
                  selecionada
                    ? getCorTipo(aba.key as Usuario['tipo'])
                    : tema.card,

                alignItems: 'center',

                elevation:
                  Platform.OS === 'android'
                    ? 2
                    : 0,

                borderWidth:
                  selecionada ? 0 : 1,

                borderColor:
                  tema.border,
              }}
              onPress={() =>
                setAbaAtiva(aba.key)
              }
            >
              <Text
                style={{
                  fontSize: fonte(15),
                  fontWeight: '600',

                  color: selecionada
                    ? tema.textoBotao
                    : tema.text,
                }}
              >
                {aba.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ======================================================
          FILTRO
      ====================================================== */}

      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12,
          alignItems: 'flex-end',
          backgroundColor:
            tema.background,
        }}
      >
        <Pressable
          style={{
            flexDirection: 'row',
            alignItems: 'center',

            backgroundColor:
              tema.border + '50',

            paddingHorizontal: 12,
            paddingVertical: 6,

            borderRadius: 12,
            gap: 6,
          }}
          onPress={() =>
            setModalFiltroVisible(true)
          }
        >
          <Ionicons
            name="filter"
            size={16 * escalaFonte}
            color={
              tema.secondaryText
            }
          />

          <Text
            style={{
              fontSize: fonte(13),
              fontWeight: '600',
              color:
                tema.secondaryText,
            }}
          >
            Filtrar
          </Text>
        </Pressable>
      </View>

      {/* ======================================================
          CONTEÚDO
      ====================================================== */}

      {loading || carregandoTema ? (
        <View
          style={
            styles.chatLoadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color={tema.primary}
          />

          <Text
            style={[
              styles.chatLoadingText,
              {
                color: tema.text,
                fontSize: fonte(15),
              },
            ]}
          >
            Carregando usuários...
          </Text>
        </View>
      ) : usuariosFiltrados.length ===
        0 ? (
        <View
          style={
            styles.chatEmptyContainer
          }
        >
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
                fontSize: fonte(18),
              },
            ]}
          >
            Nenhum usuário disponível
          </Text>

          <Text
            style={[
              styles.chatEmptyText,
              {
                color:
                  tema.secondaryText,
                fontSize: fonte(14),
              },
            ]}
          >
            Ajuste os filtros para
            exibir conversas.
          </Text>
        </View>
      ) : (
        <FlatList
          data={usuariosFiltrados}
          keyExtractor={(item) =>
            item.id
          }
          renderItem={renderUsuario}
          contentContainerStyle={
            styles.chatUsersList
          }
          showsVerticalScrollIndicator={
            false
          }
        />
      )}

      {/* ======================================================
          MODAL DE FILTRO
      ====================================================== */}

      <Modal
        visible={modalFiltroVisible}
        animationType="slide"
        transparent
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',

            backgroundColor:
              'rgba(0,0,0,0.55)',
          }}
        >
          <View
            style={{
              backgroundColor:
                tema.modal,

              padding: 20,

              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,

              maxHeight: '70%',
            }}
          >
            {/* CABEÇALHO DO MODAL */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  fontSize: fonte(18),
                  fontWeight: 'bold',
                  color: tema.text,
                }}
              >
                Filtrar{' '}
                {abasPermitidas.find(
                  (a) =>
                    a.key === abaAtiva
                )?.label || ''}
              </Text>

              {/* SELECIONAR TODOS */}
              <Pressable
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
                onPress={
                  selecionarTodosNaAba
                }
              >
                <Ionicons
                  name={
                    usuariosParaFiltrarNaAba.length >
                      0 &&
                    usuariosParaFiltrarNaAba.every(
                      (usuario) =>
                        idsSelecionados.includes(
                          usuario.id
                        )
                    )
                      ? 'checkbox'
                      : 'square-outline'
                  }
                  size={
                    20 * escalaFonte
                  }
                  color={
                    usuariosParaFiltrarNaAba.length >
                      0 &&
                    usuariosParaFiltrarNaAba.every(
                      (usuario) =>
                        idsSelecionados.includes(
                          usuario.id
                        )
                    )
                      ? getCorTipo(abaAtiva as Usuario['tipo'])
                      : tema.placeholder
                  }
                />

                <Text
                  style={{
                    fontSize: fonte(13),
                    fontWeight: '600',
                    color: tema.text,
                  }}
                >
                  Selecionar todos
                </Text>
              </Pressable>
            </View>

            <Text
              style={{
                fontSize: fonte(13),
                color:
                  tema.secondaryText,
                marginBottom: 15,
              }}
            >
              Selecione quais{' '}
              {abasPermitidas
                .find(
                  (a) =>
                    a.key === abaAtiva
                )
                ?.label.toLowerCase() ||
                ''}{' '}
              deseja exibir:
            </Text>

            {/* LISTA DE USUÁRIOS */}
            <FlatList
              data={
                usuariosParaFiltrarNaAba
              }
              keyExtractor={(item) =>
                item.id
              }
              renderItem={({
                item,
              }) => {
                const selecionado =
                  idsSelecionados.includes(
                    item.id
                  );

                return (
                  <Pressable
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 10,

                      borderBottomWidth: 1,
                      borderBottomColor:
                        tema.border,
                    }}
                    onPress={() =>
                      toggleSelecionFiltro(
                        item.id
                      )
                    }
                  >
                    <Ionicons
                      name={
                        selecionado
                          ? 'checkbox'
                          : 'square-outline'
                      }
                      size={
                        22 *
                        escalaFonte
                      }
                      color={
                        selecionado
                          ? getCorTipo(item.tipo)
                          : tema.placeholder
                      }
                      style={{
                        marginRight: 10,
                      }}
                    />

                    <View
                      style={{
                        flex: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize:
                            fonte(15),
                          fontWeight: '500',
                          color:
                            tema.text,
                        }}
                      >
                        {formatarNome(
                          item.nome,
                          item.email,
                          item.tipo
                        )}
                      </Text>

                      <Text
                        style={{
                          fontSize:
                            fonte(12),
                          color:
                            tema.secondaryText,
                        }}
                      >
                        {item.email}
                      </Text>
                    </View>
                  </Pressable>
                );
              }}
            />

            {/* APLICAR */}
            <Pressable
              style={{
                marginTop: 15,

                backgroundColor:
                  '#FFAA56',

                padding: 12,

                borderRadius: 12,

                alignItems: 'center',
              }}
              onPress={() =>
                setModalFiltroVisible(
                  false
                )
              }
            >
              <Text
                style={{
                  color:
                    tema.textoBotao,
                  fontWeight: 'bold',
                  fontSize:
                    fonte(16),
                }}
              >
                Aplicar Filtro
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}