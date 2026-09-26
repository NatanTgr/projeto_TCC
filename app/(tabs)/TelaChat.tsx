import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { styles, colors } from '../../style';

type Usuario = {
  id: string;
  nome: string;
  email: string;
  campus: string | null;
  tipo: 'estudante' | 'tutor' | 'professor';
  fixado?: boolean;
  mensagemNaoLida?: boolean;
  ultimaMensagemData?: string | null;
};

export default function Chat() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para armazenar o tipo do usuário logado e a aba ativa dinâmica
  const [tipoLogado, setTipoLogado] = useState<Usuario['tipo']>('estudante');
  const [abaAtiva, setAbaAtiva] = useState<string>('professor');
  
  // Estados para o Filtro por Campus/Categoria
  const [modalFiltroVisible, setModalFiltroVisible] = useState(false);
  const [campusLogado, setCampusLogado] = useState<string | null>(null);
  const [idsSelecionados, setIdsSelecionados] = useState<string[]>([]);
  const [usuarioLogadoId, setUsuarioLogadoId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      carregarUsuarios();
    }, [])
  );

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let ativo = true;

    const iniciarRealtimeLista = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

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
            const novaMensagem = payload.new as {
              remetente: string;
              destinatario: string;
              data_envio: string;
            };

            if (novaMensagem.destinatario !== user.id) return;

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

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace('/login');
        return;
      }
  // Buscar os usuários fixados pelo usuário logado
  const { data: fixados, error: fixadosError } = await supabase
    .from('usuarios_fixados')
    .select('usuario_fixado_id')
    .eq('usuario_id', user.id);

    if (fixadosError) {
      console.error('Erro ao carregar usuários fixados:', fixadosError);
    }

    const idsFixados = new Set(
      (fixados || []).map(item => item.usuario_fixado_id)
    );

    setUsuarioLogadoId(user.id);

    // Busca as mensagens recebidas que ainda não foram lidas.
    const { data: mensagensNaoLidas, error: naoLidasError } =
      await supabase
        .from('mensagens')
        .select('remetente, data_envio')
        .eq('destinatario', user.id)
        .eq('lida', false)
        .order('data_envio', { ascending: false });

    if (naoLidasError) {
      console.error('Erro ao carregar mensagens não lidas:', naoLidasError);
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

      // Buscar dados do usuário logado para descobrir o campus e o tipo dele
      const { data: dadosUsuarioLogado } = await supabase
        .from('usuarios')
        .select('campus, tipo')
        .eq('id', user.id)
        .single();

      const meuCampus = dadosUsuarioLogado?.campus || null;
      const meuTipo = (dadosUsuarioLogado?.tipo || 'estudante') as Usuario['tipo'];
      
      setCampusLogado(meuCampus);
      setTipoLogado(meuTipo);

      // Define a aba inicial padrão dependendo de quem está logado
      if (meuTipo === 'estudante') {
        setAbaAtiva('professor');
      } else if (meuTipo === 'tutor') {
        setAbaAtiva('professor');
      } else if (meuTipo === 'professor') {
        setAbaAtiva('estudante');
      }

      // Buscar todos os outros usuários do mesmo campus
      let query = supabase
        .from('usuarios')
        .select('id, nome, email, campus, tipo')
        .neq('id', user.id);

      if (meuCampus) {
        query = query.eq('campus', meuCampus);
      }

      const { data, error } = await query.order('nome', { ascending: true });

      if (error) {
        console.error('Erro ao carregar usuários:', error);
        return;
      }

      const listaUsuarios = (data || []).map(usuario => ({
  ...usuario,
  fixado: idsFixados.has(usuario.id),
  mensagemNaoLida: naoLidasPorRemetente.has(usuario.id),
  ultimaMensagemData: naoLidasPorRemetente.get(usuario.id) || null,
})) as Usuario[];

setUsuarios(listaUsuarios);
setIdsSelecionados(listaUsuarios.map(u => u.id));
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  // Define quais abas devem aparecer com base em quem está logado
  const getAbasPermitidas = () => {
    switch (tipoLogado) {
      case 'estudante':
        // Aluno vê: Professores e Tutores
        return [
          { key: 'professor', label: 'Professores' },
          { key: 'tutor', label: 'Tutores' },
        ];
      case 'tutor':
        // Tutor vê: Professores e Alunos (estudante)
        return [
          { key: 'professor', label: 'Professores' },
          { key: 'estudante', label: 'Alunos' },
        ];
      case 'professor':
        // Professor vê: Alunos (estudante) e Tutores
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

  const abrirConversa = (usuario: Usuario) => {
    // Remove imediatamente a bolinha da lista enquanto a conversa é aberta.
    setUsuarios((atual) =>
      atual.map((item) =>
        item.id === usuario.id
          ? { ...item, mensagemNaoLida: false }
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

  const toggleFixar = async (id: string, event: any) => {
  event.stopPropagation();

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.replace('/login');
      return;
    }

    const usuario = usuarios.find(u => u.id === id);

    if (!usuario) {
      return;
    }

    if (usuario.fixado) {
      // ==============================
      // DESFIXAR USUÁRIO
      // ==============================

      const { error } = await supabase
        .from('usuarios_fixados')
        .delete()
        .eq('usuario_id', user.id)
        .eq('usuario_fixado_id', id);

      if (error) {
        console.error('Erro ao remover usuário dos fixados:', error);
        return;
      }

      setUsuarios(prev =>
        prev.map(u =>
          u.id === id
            ? { ...u, fixado: false }
            : u
        )
      );

    } else {
      // ==============================
      // FIXAR USUÁRIO
      // ==============================

      const { error } = await supabase
        .from('usuarios_fixados')
        .insert({
          usuario_id: user.id,
          usuario_fixado_id: id,
        });

      if (error) {
        console.error('Erro ao adicionar usuário aos fixados:', error);
        return;
      }

      setUsuarios(prev =>
        prev.map(u =>
          u.id === id
            ? { ...u, fixado: true }
            : u
        )
      );
    }

  } catch (error) {
    console.error('Erro ao alterar usuário fixado:', error);
  }
};

  const toggleSelecionFiltro = (id: string) => {
    setIdsSelecionados(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getCorTipo = (tipo: Usuario['tipo']) => {
    switch (tipo) {
      case 'estudante': return colors.student;
      case 'tutor': return colors.tutor;
      case 'professor': return colors.professor;
      default: return colors.primary;
    }
  };

  const formatarNome = (nome: string | null, email: string, tipo: string) => {
    const nomeExibicao = nome || email;
    if (tipo === 'professor' && !nomeExibicao.startsWith('Prof.')) {
      return `Prof. ${nomeExibicao}`;
    }
    return nomeExibicao;
  };

  // Filtra por aba e mantém a ordem: fixados > não lidos > demais.
  // Dentro dos não lidos, a mensagem recebida mais recentemente fica primeiro.
  const usuariosFiltrados = usuarios
    .filter((u) => u.tipo === abaAtiva && idsSelecionados.includes(u.id))
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

  // Usuários exibidos no Modal de Filtro (somente da aba ativa atual)
  const usuariosParaFiltrarNaAba = usuarios.filter((u) => u.tipo === abaAtiva);

  const renderUsuario = ({ item }: { item: Usuario }) => {
    const cor = getCorTipo(item.tipo);
    return (
      <Pressable
        style={({ pressed }) => [
          styles.chatUserItem,
          pressed && styles.chatUserItemPressed,
        ]}
        onPress={() => abrirConversa(item)}
      >
        <View style={[styles.chatUserAvatar, { backgroundColor: cor }]}>
          <Ionicons
            name={item.tipo === 'professor' ? 'person' : 'people'}
            size={25}
            color={colors.white}
          />
        </View>
        <View style={[styles.chatUserInfo, { flex: 1 }]}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text
              style={[styles.chatUserName, { flex: 1 }]}
              numberOfLines={1}
            >
              {formatarNome(item.nome, item.email, item.tipo)}
            </Text>

            {item.mensagemNaoLida && (
              <View
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

          <Text style={styles.chatUserType}>
            {item.mensagemNaoLida
              ? 'Nova mensagem'
              : 'Última mensagem...'}
          </Text>
        </View>

        {/* Botão Fixar (Bookmark) */}
        <Pressable 
          style={{ padding: 6 }} 
          onPress={(e) => toggleFixar(item.id, e)}
        >
          <Ionicons 
            name={item.fixado ? "bookmark" : "bookmark-outline"} 
            size={20} 
            color={item.fixado ? colors.primary : colors.placeholder} 
          />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
  
  edges={['left', 'right', 'bottom']}
  style={[
    styles.chatContainer,
    {
      flex: 1,
      backgroundColor: colors.background,
    },
  ]}
>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Cabeçalho */}
      <View 
        style={[
          styles.chatHeader,
          {
            paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 4 : 8,
            minHeight: Platform.OS === 'android' ? 72 + (StatusBar.currentHeight || 24) : 64,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            backgroundColor: 'transparent',
            borderBottomWidth: 0,
          }
        ]}
      >
        <View style={styles.chatHeaderTitleContainer}>
          <Text style={styles.chatHeaderTitle}>Conversas ({campusLogado || 'Geral'})</Text>
        </View>
        
        <Pressable 
          style={{
            backgroundColor: '#FFAA56',
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 6,
            justifyContent: 'center',
            alignItems: 'center',
          }} 
          onPress={() => {}}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 }}>
            ALERTA
          </Text>
        </Pressable>
      </View>

      {/* Abas Superiores Dinâmicas baseadas no tipo de quem logou */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 2, gap: 12, backgroundColor: colors.background }}>
        {abasPermitidas.map((aba) => (
          <Pressable
            key={aba.key}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 14,
              backgroundColor: abaAtiva === aba.key ? colors.tutor : colors.white,
              alignItems: 'center',
              elevation: 2,
            }}
            onPress={() => setAbaAtiva(aba.key)}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: abaAtiva === aba.key ? colors.white : colors.textSecondary }}>
              {aba.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Botão "Filtrar" */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, alignItems: 'flex-end', backgroundColor: colors.background }}>
        <Pressable 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.border + '50',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            gap: 6
          }}
          onPress={() => setModalFiltroVisible(true)}
        >
          <Ionicons name="filter" size={16} color={colors.textSecondary} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary }}>Filtrar</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.chatLoadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.chatLoadingText}>Carregando usuários...</Text>
        </View>
      ) : usuariosFiltrados.length === 0 ? (
        <View style={styles.chatEmptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={colors.placeholder} />
          <Text style={styles.chatEmptyTitle}>Nenhum usuário disponível</Text>
          <Text style={styles.chatEmptyText}>Ajuste os filtros para exibir conversas.</Text>
        </View>
      ) : (
        <FlatList
          data={usuariosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderUsuario}
          contentContainerStyle={styles.chatUsersList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de Filtro Contextual */}
      <Modal visible={modalFiltroVisible} animationType="slide" transparent={true}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: colors.white, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: colors.heading }}>
              Filtrar {abasPermitidas.find(a => a.key === abaAtiva)?.label || ''}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 15 }}>
              Selecione quais {abasPermitidas.find(a => a.key === abaAtiva)?.label.toLowerCase() || ''} deseja exibir:
            </Text>

            <FlatList
              data={usuariosParaFiltrarNaAba}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const selecionado = idsSelecionados.includes(item.id);
                return (
                  <Pressable
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}
                    onPress={() => toggleSelecionFiltro(item.id)}
                  >
                    <Ionicons 
                      name={selecionado ? "checkbox" : "square-outline"} 
                      size={22} 
                      color={selecionado ? colors.primary : colors.placeholder} 
                      style={{ marginRight: 10 }}
                    />
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '500', color: colors.heading }}>
                        {formatarNome(item.nome, item.email, item.tipo)}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>{item.email}</Text>
                    </View>
                  </Pressable>
                );
              }}
            />

            <Pressable
              style={{ marginTop: 15, backgroundColor: colors.primary, padding: 12, borderRadius: 12, alignItems: 'center' }}
              onPress={() => setModalFiltroVisible(false)}
            >
              <Text style={{ color: colors.white, fontWeight: 'bold', fontSize: 16 }}>Aplicar Filtro</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
