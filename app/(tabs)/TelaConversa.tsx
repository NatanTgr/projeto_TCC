import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '../../lib/supabase';
import { colors, styles } from '../../style';

type Mensagem = {
  id: number;
  data_envio: string;
  conteudo: string | null;
  remetente: string;
  destinatario: string;

  tipo?: 'texto' | 'imagem';
  arquivo_url?: string | null;

  editada?: boolean;
  data_edicao?: string | null;

  imagem_url?: string | null;
  lida?: boolean;
};

type ItemLista =
  | {
      tipoItem: 'data';
      id: string;
      data: string;
    }
  | {
      tipoItem: 'mensagem';
      id: string;
      mensagem: Mensagem;
    };

export default function Conversa() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    usuarioId: string | string[];
    usuarioNome: string | string[];
    usuarioTipo: string | string[];
  }>();

  const usuarioDestinoId =
    typeof params.usuarioId === 'string'
      ? params.usuarioId
      : params.usuarioId?.[0];

  const usuarioDestinoNome =
    typeof params.usuarioNome === 'string'
      ? params.usuarioNome
      : params.usuarioNome?.[0] || 'Usuário';

  const usuarioDestinoTipo =
    typeof params.usuarioTipo === 'string'
      ? params.usuarioTipo
      : params.usuarioTipo?.[0] || 'estudante';

  // Adiciona o prefixo "Prof." se for professor e já não o possuir
  const nomeFormatado =
    usuarioDestinoTipo === 'professor' && !usuarioDestinoNome.startsWith('Prof.')
      ? `Prof. ${usuarioDestinoNome}`
      : usuarioDestinoNome;

  const [usuarioLogadoId, setUsuarioLogadoId] = useState<string | null>(null);

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);

  const [novaMensagem, setNovaMensagem] = useState('');

  const [loading, setLoading] = useState(true);

  const [enviando, setEnviando] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [textoEditado, setTextoEditado] = useState('');

  const [imagemSelecionada, setImagemSelecionada] =
  useState<string | null>(null);

  const flatListRef = useRef<FlatList<ItemLista>>(null);

  const channelRef = useRef<any>(null);

  // =========================================================
  // INICIALIZAÇÃO
  // =========================================================

  useEffect(() => {
    iniciarConversa();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [usuarioDestinoId]);

  const iniciarConversa = async () => {
    if (!usuarioDestinoId) {
      router.back();
      return;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      router.replace('/login');
      return;
    }

    setUsuarioLogadoId(user.id);

    await carregarMensagens(user.id);

    // Marca as mensagens recebidas desta conversa como lidas
    await marcarMensagensComoLidas(user.id);

    iniciarRealtime(user.id);
  
  };

  // =========================================================
  // CARREGAR MENSAGENS
  // =========================================================

  const carregarMensagens = async (meuId: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('mensagens')
        .select('*')
        .or(
          `and(remetente.eq.${meuId},destinatario.eq.${usuarioDestinoId}),and(remetente.eq.${usuarioDestinoId},destinatario.eq.${meuId})`
        )
        .order('data_envio', { ascending: true });

      if (error) {
        console.error('Erro ao carregar mensagens:', error);
        return;
      }

      const mensagensCarregadas = (data || []) as Mensagem[];

      // Busca URLs das imagens
      const mensagensComImagens = await carregarUrlsDasImagens(
        mensagensCarregadas
      );

      setMensagens(mensagensComImagens);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 150);
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // MARCAR MENSAGENS RECEBIDAS COMO LIDAS
  // =========================================================

  const marcarMensagensComoLidas = async (meuId: string) => {
    if (!usuarioDestinoId) return;

    const { error } = await supabase
      .from('mensagens')
      .update({ lida: true })
      .eq('remetente', usuarioDestinoId)
      .eq('destinatario', meuId)
      .eq('lida', false);

    if (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  };

  // =========================================================
  // CARREGAR URL DAS IMAGENS
  // =========================================================

  const carregarUrlsDasImagens = async (
  lista: Mensagem[]
): Promise<Mensagem[]> => {
  const resultado = await Promise.all(
    lista.map(async (mensagem) => {
      if (
        mensagem.tipo !== 'imagem' ||
        !mensagem.arquivo_url
      ) {
        return mensagem;
      }

      const { data } = supabase.storage
        .from('chat-imagens')
        .getPublicUrl(mensagem.arquivo_url);

      return {
        ...mensagem,
        imagem_url: data.publicUrl,
      };
    })
  );

  return resultado;
    };

  // =========================================================
  // REALTIME
  // =========================================================

  const iniciarRealtime = (meuId: string) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`chat-${meuId}-${usuarioDestinoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mensagens',
        },
        async (payload) => {
          // -----------------------------
          // INSERT
          // -----------------------------

          if (payload.eventType === 'INSERT') {
            let nova = payload.new as Mensagem;

            const pertenceAoChat =
              (nova.remetente === meuId &&
                nova.destinatario === usuarioDestinoId) ||
              (nova.remetente === usuarioDestinoId &&
                nova.destinatario === meuId);

            if (!pertenceAoChat) return;

            if (
              nova.tipo === 'imagem' &&
              nova.arquivo_url
            ) {
              const { data } = supabase.storage
                .from('chat-imagens')
                .getPublicUrl(nova.arquivo_url);

              nova = {
                ...nova,
                imagem_url: data.publicUrl,
              };
            }

            setMensagens((atual) => {
              const jaExiste = atual.some(
                (mensagem) => mensagem.id === nova.id
              );

              if (jaExiste) return atual;

              return [...atual, nova].sort(
                (a, b) =>
                  new Date(a.data_envio).getTime() -
                  new Date(b.data_envio).getTime()
              );
            });

            setTimeout(() => {
              flatListRef.current?.scrollToEnd({
                animated: true,
              });
            }, 100);
          }

          // -----------------------------
          // UPDATE
          // -----------------------------

          if (payload.eventType === 'UPDATE') {
            const atualizada = payload.new as Mensagem;

            setMensagens((atual) =>
              atual.map((mensagem) =>
                mensagem.id === atualizada.id
                  ? {
                      ...mensagem,
                      ...atualizada,
                    }
                  : mensagem
              )
            );
          }

          // -----------------------------
          // DELETE
          // -----------------------------

          if (payload.eventType === 'DELETE') {
            const apagada = payload.old as Mensagem;

            setMensagens((atual) =>
              atual.filter(
                (mensagem) => mensagem.id !== apagada.id
              )
            );
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  };

  // =========================================================
  // ENVIAR TEXTO
  // =========================================================

  const enviarMensagem = async (textoParam?: string) => {
    const texto = (
      textoParam !== undefined ? textoParam : novaMensagem
    ).trim();

    if (
      !texto ||
      !usuarioLogadoId ||
      !usuarioDestinoId ||
      enviando
    ) {
      return;
    }

    try {
      setEnviando(true);

      const { error } = await supabase.from('mensagens').insert({
        conteudo: texto,
        remetente: usuarioLogadoId,
        destinatario: usuarioDestinoId,
        tipo: 'texto',
        arquivo_url: null,
      });

      if (error) {
        console.error('Erro ao enviar mensagem:', error);

        Alert.alert(
          'Erro',
          'Não foi possível enviar a mensagem.'
        );

        return;
      }

      if (textoParam === undefined) {
        setNovaMensagem('');
      }

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({
          animated: true,
        });
      }, 100);
    } finally {
      setEnviando(false);
    }
  };

  // =========================================================
  // EDITAR MENSAGEM
  // =========================================================

  const iniciarEdicao = (mensagem: Mensagem) => {
    if (mensagem.remetente !== usuarioLogadoId) {
      return;
    }

    if (mensagem.tipo !== 'texto') {
      return;
    }

    setEditandoId(mensagem.id);
    setTextoEditado(mensagem.conteudo || '');
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setTextoEditado('');
  };

  const salvarEdicao = async () => {
    const texto = textoEditado.trim();

    if (!texto || !editandoId || !usuarioLogadoId) {
      return;
    }

    try {
      const { error } = await supabase
        .from('mensagens')
        .update({
          conteudo: texto,
          editada: true,
          data_edicao: new Date().toISOString(),
        })
        .eq('id', editandoId)
        .eq('remetente', usuarioLogadoId);

      if (error) {
        console.error('Erro ao editar mensagem:', error);

        Alert.alert(
          'Erro',
          'Não foi possível editar a mensagem.'
        );

        return;
      }

      setMensagens((atual) =>
        atual.map((mensagem) =>
          mensagem.id === editandoId
            ? {
                ...mensagem,
                conteudo: texto,
                editada: true,
                data_edicao: new Date().toISOString(),
              }
            : mensagem
        )
      );

      cancelarEdicao();
    } catch (error) {
      console.error('Erro inesperado ao editar:', error);
    }
  };

  // =========================================================
  // APAGAR MENSAGEM
  // =========================================================

  const confirmarExclusao = (mensagem: Mensagem) => {
    if (mensagem.remetente !== usuarioLogadoId) {
      return;
    }

    Alert.alert(
      'Apagar mensagem',
      'Deseja apagar esta mensagem?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => apagarMensagem(mensagem),
        },
      ]
    );
  };

  const apagarMensagem = async (mensagem: Mensagem) => {
    if (!usuarioLogadoId) return;

    try {
      // Se for imagem, remove também do Storage
      if (
        mensagem.tipo === 'imagem' &&
        mensagem.arquivo_url
      ) {
        const { error: storageError } =
          await supabase.storage
            .from('chat-imagens')
            .remove([mensagem.arquivo_url]);

        if (storageError) {
          console.error(
            'Erro ao apagar imagem:',
            storageError
          );
        }
      }

      const { error } = await supabase
        .from('mensagens')
        .delete()
        .eq('id', mensagem.id)
        .eq('remetente', usuarioLogadoId);

      if (error) {
        console.error(
          'Erro ao apagar mensagem:',
          error
        );

        Alert.alert(
          'Erro',
          'Não foi possível apagar a mensagem.'
        );

        return;
      }

      setMensagens((atual) =>
        atual.filter(
          (item) => item.id !== mensagem.id
        )
      );
    } catch (error) {
      console.error(
        'Erro inesperado ao apagar:',
        error
      );
    }
  };

  // =========================================================
  // ESCOLHER IMAGEM
  // =========================================================

  const escolherImagem = async () => {
    try {
      const resultado =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });

      if (resultado.canceled) {
        return;
      }

      const imagem = resultado.assets[0];

      if (!imagem?.uri) {
        return;
      }
      
      await enviarImagem(
        imagem.uri,
        imagem.mimeType || 'image/jpeg',
        imagem.fileName || `imagem-${Date.now()}.jpg`
      );
    } catch (error) {
      console.error(
        'Erro ao escolher imagem:',
        error
      );
      

      Alert.alert(
        'Erro',
        'Não foi possível selecionar a imagem.'
      );
    }
  };

  // =========================================================
  // TIRAR FOTO
  // =========================================================

  const tirarFoto = async () => {
    try {
      const permissao =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert(
          'Permissão necessária',
          'Permita o acesso à câmera para tirar uma foto.'
        );

        return;
      }

      const resultado =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });

      if (resultado.canceled) {
        return;
      }

      const imagem = resultado.assets[0];

      if (!imagem?.uri) {
        return;
      }

      await enviarImagem(
        imagem.uri,
        imagem.mimeType || 'image/jpeg',
        imagem.fileName || `foto-${Date.now()}.jpg`
      );
    } catch (error) {
      console.error(
        'Erro ao tirar foto:',
        error
      );

      Alert.alert(
        'Erro',
        'Não foi possível tirar a foto.'
      );
    }
  };

  // =========================================================
  // MENU DE IMAGEM
  // =========================================================

  const abrirOpcoesImagem = () => {
    Alert.alert(
      'Enviar imagem',
      'Escolha uma opção',
      [
        {
          text: 'Câmera',
          onPress: tirarFoto,
        },
        {
          text: 'Galeria',
          onPress: escolherImagem,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  // =========================================================
  // UPLOAD DA IMAGEM
  // =========================================================

  const enviarImagem = async (
    uri: string,
    mimeType: string,
    fileName: string
  ) => {
    if (
      !usuarioLogadoId ||
      !usuarioDestinoId ||
      enviando
    ) {
      return;
    }

    try {
      setEnviando(true);

      const nomeArquivo =
        `${usuarioLogadoId}/` +
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.jpg`;

      // Converte a URI do aparelho para ArrayBuffer.
      // Essa abordagem é adequada para upload no React Native.
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const arrayBuffer = decode(base64);


      const { error: uploadError } =
      await supabase.storage
        .from('chat-imagens')
        .upload(nomeArquivo, arrayBuffer, {
      contentType: 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });

      if (uploadError) {
        console.error(
          'Erro ao enviar imagem para Storage:',
          uploadError
        );

        Alert.alert(
          'Erro',
          'Não foi possível enviar a imagem.'
        );

        return;
      }

      const { error: mensagemError } =
        await supabase.from('mensagens').insert({
          conteudo: null,
          remetente: usuarioLogadoId,
          destinatario: usuarioDestinoId,
          tipo: 'imagem',
          arquivo_url: nomeArquivo,
        });

      if (mensagemError) {
        console.error(
          'Erro ao salvar mensagem de imagem:',
          mensagemError
        );

        // Tenta apagar o arquivo caso a mensagem não tenha sido criada
        await supabase.storage
          .from('chat-imagens')
          .remove([nomeArquivo]);

        Alert.alert(
          'Erro',
          'A imagem foi enviada, mas não foi possível registrar a mensagem.'
        );

        return;
      }

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({
          animated: true,
        });
      }, 150);
    } catch (error) {
      console.error(
        'Erro inesperado ao enviar imagem:',
        error
      );

      Alert.alert(
        'Erro',
        'Não foi possível enviar a imagem.'
      );
    } finally {
      setEnviando(false);
    }
  };

  // =========================================================
  // FORMATAÇÃO DE HORÁRIO
  // =========================================================

  const formatarHorario = (data: string) => {
    return new Date(data).toLocaleTimeString(
      'pt-BR',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  // =========================================================
  // DATA DA MENSAGEM
  // =========================================================

  const obterChaveData = (data: string) => {
    const dataMensagem = new Date(data);

    return `${dataMensagem.getFullYear()}-${String(
      dataMensagem.getMonth() + 1
    ).padStart(2, '0')}-${String(
      dataMensagem.getDate()
    ).padStart(2, '0')}`;
  };

  const formatarDataBloco = (data: string) => {
    const dataMensagem = new Date(data);

    const hoje = new Date();

    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);

    const chaveMensagem = obterChaveData(data);

    const chaveHoje = obterChaveData(
      hoje.toISOString()
    );

    const chaveOntem = obterChaveData(
      ontem.toISOString()
    );

    if (chaveMensagem === chaveHoje) {
      return 'Hoje';
    }

    if (chaveMensagem === chaveOntem) {
      return 'Ontem';
    }

    return dataMensagem.toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
    );
  };

  // =========================================================
  // TRANSFORMAR MENSAGENS EM BLOCOS DE DATA
  // =========================================================

  const criarListaComDatas = (): ItemLista[] => {
    const lista: ItemLista[] = [];

    let ultimaData = '';

    mensagens.forEach((mensagem) => {
      const chaveData = obterChaveData(
        mensagem.data_envio
      );

      if (chaveData !== ultimaData) {
        lista.push({
          tipoItem: 'data',
          id: `data-${chaveData}`,
          data: mensagem.data_envio,
        });

        ultimaData = chaveData;
      }

      lista.push({
        tipoItem: 'mensagem',
        id: `mensagem-${mensagem.id}`,
        mensagem,
      });
    });

    return lista;
  };

  // =========================================================
  // COR DO TEMA
  // =========================================================

  const getCorPorTipoDestino = () => {
    switch (usuarioDestinoTipo) {
      case 'professor':
        return colors.success;

      case 'tutor':
        return colors.tutor;

      case 'estudante':
      default:
        return colors.primary;
    }
  };

  const corTema = getCorPorTipoDestino();

  // =========================================================
  // RENDERIZAR SEPARADOR DE DATA
  // =========================================================

  const renderSeparadorData = (data: string) => {
    return (
      <View
        style={{
          alignItems: 'center',
          marginVertical: 10,
        }}
      >
        <View
          style={{
            backgroundColor: '#E8E2D5',
            paddingHorizontal: 13,
            paddingVertical: 6,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 11,
              fontWeight: '600',
            }}
          >
            {formatarDataBloco(data)}
          </Text>
        </View>
      </View>
    );
  };

  // =========================================================
  // RENDERIZAR MENSAGEM
  // =========================================================

  const renderMensagem = ({
    item,
  }: {
    item: ItemLista;
  }) => {
    if (item.tipoItem === 'data') {
      return renderSeparadorData(item.data);
    }

    const mensagem = item.mensagem;

    const minhaMensagem =
      mensagem.remetente === usuarioLogadoId;

    const estaEditando =
      editandoId === mensagem.id;

    // -----------------------------------------
    // EDIÇÃO
    // -----------------------------------------

    if (estaEditando) {
      return (
        <View
          style={[
            styles.chatMessageContainer,
            styles.chatMessageContainerMine,
          ]}
        >
          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: 16,
              padding: 10,
              maxWidth: '85%',
              borderWidth: 1,
              borderColor: corTema,
            }}
          >
            <TextInput
              value={textoEditado}
              onChangeText={setTextoEditado}
              multiline
              autoFocus
              maxLength={1000}
              style={{
                color: colors.text,
                fontSize: 15,
                minWidth: 180,
                maxHeight: 100,
              }}
            />

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 8,
                gap: 8,
              }}
            >
              <Pressable
                onPress={cancelarEdicao}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 15,
                  backgroundColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={salvarEdicao}
                disabled={!textoEditado.trim()}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 15,
                  backgroundColor: corTema,
                  opacity: textoEditado.trim()
                    ? 1
                    : 0.5,
                }}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  Salvar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      );
    }

    // -----------------------------------------
    // MENSAGEM NORMAL
    // -----------------------------------------

    return (
      <Pressable
        onLongPress={() => {
          if (minhaMensagem) {
            if (mensagem.tipo === 'texto') {
              Alert.alert(
                'Mensagem',
                'O que deseja fazer?',
                [
                  {
                    text: 'Editar',
                    onPress: () =>
                      iniciarEdicao(mensagem),
                  },
                  {
                    text: 'Apagar',
                    style: 'destructive',
                    onPress: () =>
                      confirmarExclusao(
                        mensagem
                      ),
                  },
                  {
                    text: 'Cancelar',
                    style: 'cancel',
                  },
                ]
              );
            } else {
              confirmarExclusao(mensagem);
            }
          }
        }}
        style={[
          styles.chatMessageContainer,
          minhaMensagem
            ? styles.chatMessageContainerMine
            : styles.chatMessageContainerOther,
        ]}
      >
        <View
          style={[
            styles.chatBubble,
            minhaMensagem
              ? [
                  styles.chatBubbleMine,
                  {
                    backgroundColor:
                      corTema + '25',
                  },
                ]
              : styles.chatBubbleOther,
          ]}
        >
          {/* -----------------------------------
              IMAGEM
          ----------------------------------- */}

          {mensagem.tipo === 'imagem' &&
          mensagem.imagem_url ? (
            <Pressable
              onPress={() =>
              setImagemSelecionada(mensagem.imagem_url!)
              }
            >
              <Image
                source={{ uri: mensagem.imagem_url }}
                  style={{
                    width: 230,
                    height: 230,
                    borderRadius: 12,
                    backgroundColor: colors.border,
                }}
                resizeMode="cover"
              />
            </Pressable>

          ) : (
            /* ---------------------------------
               TEXTO
            --------------------------------- */

            <Text
              style={[
                styles.chatMessageText,
                minhaMensagem
                  ? styles.chatMessageTextMine
                  : styles.chatMessageTextOther,
              ]}
            >
              {mensagem.conteudo}
            </Text>
          )}

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginTop: 4,
            }}
          >
            {mensagem.editada && (
              <Text
                style={{
                  fontSize: 9,
                  color: colors.muted,
                  marginRight: 5,
                  fontStyle: 'italic',
                }}
              >
                editada
              </Text>
            )}

            <Text
              style={[
                styles.chatMessageTime,
                minhaMensagem
                  ? styles.chatMessageTimeMine
                  : styles.chatMessageTimeOther,
              ]}
            >
              {formatarHorario(
                mensagem.data_envio
              )}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  // =========================================================
  // TELA
  // =========================================================

  return (
    <SafeAreaView
      style={[
        styles.conversationContainer,
        {
          flex: 1,
          backgroundColor: colors.background,
        },
      ]}
      edges={['left', 'right', 'bottom']}
    >
      {/* Oculta qualquer dashboard ou header herdado da rota pai */}
      <Stack.Screen options={{ headerShown: false }} />

<StatusBar
  barStyle="dark-content"
  backgroundColor={colors.background}
/>

<Modal
  visible={imagemSelecionada !== null}
  transparent
  animationType="fade"
  onRequestClose={() =>
    setImagemSelecionada(null)
  }
>
  <View
    style={{
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    {/* Botão fechar */}
    <Pressable
      onPress={() =>
        setImagemSelecionada(null)
      }
      style={{
        position: 'absolute',
        top: Platform.OS === 'android'
          ? (StatusBar.currentHeight || 24) + 10
          : 45,
        right: 20,
        zIndex: 10,
        width: 45,
        height: 45,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Ionicons
        name="close"
        size={32}
        color="#FFFFFF"
      />
    </Pressable>

    {imagemSelecionada && (
      <Image
        source={{
          uri: imagemSelecionada,
        }}
        style={{
          width: '100%',
          height: '80%',
        }}
        resizeMode="contain"
      />
    )}
          </View>
        </Modal>

        <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? 0 : 0
        }
      >
        {/* =====================================
            CABEÇALHO
        ===================================== */}

        <View
          style={[
            styles.conversationHeader,
            {
              paddingTop:
                Platform.OS === 'android'
                  ? (StatusBar.currentHeight || 24) +
                    4
                  : 8,

              minHeight:
                Platform.OS === 'android'
                  ? 72 +
                    (StatusBar.currentHeight || 24)
                  : 64,
            },
          ]}
        >
          <Pressable
            style={
              styles.conversationBackButton
            }
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors.heading}
            />
          </Pressable>

          <View
            style={[
              styles.conversationAvatar,
              {
                backgroundColor: corTema,
              },
            ]}
          >
            <Ionicons
              name="person"
              size={23}
              color={colors.white}
            />
          </View>

          <View
            style={[
              styles.conversationHeaderInfo,
              {
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                paddingRight: 8,
              },
            ]}
          >
            <View
              style={{
                flex: 1,
                marginRight: 8,
              }}
            >
              <Text
                style={
                  styles.conversationHeaderName
                }
                numberOfLines={1}
              >
                {nomeFormatado}
              </Text>

              <Text
                style={
                  styles.conversationHeaderStatus
                }
              >
                Conversa privada
              </Text>
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
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 'bold',
                  letterSpacing: 0.5,
                }}
              >
                ALERTA
              </Text>
            </Pressable>
          </View>
        </View>

        {/* =====================================
            CONTEÚDO
        ===================================== */}

        {loading ? (
          <View
            style={
              styles.chatLoadingContainer
            }
          >
            <ActivityIndicator
              size="large"
              color={corTema}
            />

            <Text
              style={
                styles.chatLoadingText
              }
            >
              Carregando conversa...
            </Text>
          </View>
        ) : mensagens.length === 0 ? (
          <View
            style={
              styles.conversationEmptyContainer
            }
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={60}
              color={colors.placeholder}
            />

            <Text
              style={
                styles.conversationEmptyTitle
              }
            >
              Inicie a conversa
            </Text>

            <Text
              style={
                styles.conversationEmptyText
              }
            >
              Envie uma mensagem para{' '}
              {nomeFormatado}.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={criarListaComDatas()}
            keyExtractor={(item) => item.id}
            renderItem={renderMensagem}
            contentContainerStyle={
              styles.conversationMessagesList
            }
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({
                animated: false,
              })
            }
          />
        )}

        {/* =====================================
            SUGESTÕES RÁPIDAS
        ===================================== */}

        <View
          style={{
            backgroundColor:
              colors.background,
            paddingVertical: 6,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={{
              paddingHorizontal: 10,
              gap: 8,
            }}
          >
            {[
              'Ok, confirmado',
              'Podemos agendar um horário?',
              'Obrigado!',
            ].map((textoPredef, index) => (
              <Pressable
                key={index}
                style={{
                  backgroundColor:
                    colors.white,
                  borderWidth: 1.5,
                  borderColor: corTema,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 18,
                }}
                onPress={() =>
                  enviarMensagem(
                    textoPredef
                  )
                }
              >
                <Text
                  style={{
                    color:
                      colors.textSecondary,
                    fontSize: 13,
                    fontWeight: '500',
                  }}
                >
                  {textoPredef}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* =====================================
            INPUT
        ===================================== */}

        <View
          style={[
            styles.messageInputContainer,
            {
              backgroundColor:
                colors.background,
              paddingBottom:
                Platform.OS === 'android'
                  ? 40
                  : 8,
            },
          ]}
        >
          <TextInput
            style={[
              styles.messageInput,
              {
                backgroundColor:
                  colors.white,
              },
            ]}
            value={novaMensagem}
            onChangeText={setNovaMensagem}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={
              colors.placeholder
            }
            multiline
            maxLength={1000}
            editable={!enviando}
          />

          {/* BOTÃO CÂMERA / GALERIA */}

          <Pressable
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor:
                colors.white,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 6,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={abrirOpcoesImagem}
            disabled={enviando}
          >
            <Ionicons
              name="camera"
              size={20}
              color={corTema}
            />
          </Pressable>

          {/* BOTÃO ENVIAR */}

          <Pressable
            style={({ pressed }) => [
              styles.sendMessageButton,
              {
                backgroundColor: corTema,
              },
              (!novaMensagem.trim() ||
                enviando) &&
                styles.sendMessageButtonDisabled,
              pressed &&
                novaMensagem.trim() &&
                !enviando &&
                styles.sendMessageButtonPressed,
            ]}
            onPress={() => enviarMensagem()}
            disabled={
              !novaMensagem.trim() ||
              enviando
            }
          >
            {enviando ? (
              <ActivityIndicator
                size="small"
                color={colors.white}
              />
            ) : (
              <Ionicons
                name="send"
                size={21}
                color={colors.white}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
