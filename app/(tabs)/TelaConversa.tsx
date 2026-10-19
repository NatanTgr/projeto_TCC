
import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import {
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  useWindowDimensions,
  AppState
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as Crypto from "expo-crypto";

import {
  definirConversaAtiva,
  limparConversaAtiva,
} from "../../components/conversaAtiva";
import AvatarImagem from "../../components/AvatarImagem";
import { buscarAvatar } from "../../components/avatares";
import { useTheme } from "../../context/ThemeContext";
import { useFontSize } from "../../context/FontSizeContext";
import { supabase } from "../../lib/supabase";
import { colors, styles } from "../../style";

type Mensagem = {
  id: number;
  data_envio: string;
  conteudo: string | null;
  remetente: string;
  destinatario: string;
  tipo?: "texto" | "imagem";
  arquivo_url?: string | null;
  editada?: boolean;
  data_edicao?: string | null;
  imagem_url?: string | null;
};

type ItemLista =
  | {
      tipoItem: "data";
      id: string;
      data: string;
    }
  | {
      tipoItem: "mensagem";
      id: string;
      mensagem: Mensagem;
    };

function obterChaveData(data: string) {
  const d = new Date(data);

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatarHorario(data: string) {
  return new Date(data).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarDataBloco(data: string) {
  const hoje = new Date();
  const ontem = new Date();

  ontem.setDate(hoje.getDate() - 1);

  const chave = obterChaveData(data);

  if (chave === obterChaveData(hoje.toISOString())) {
    return "Hoje";
  }

  if (chave === obterChaveData(ontem.toISOString())) {
    return "Ontem";
  }

  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function obterTipoBalao(tipo?: string | null) {
  switch (tipo?.toLowerCase()) {
    case "estudante":
      return "estudante";
    case "professor":
      return "professor";
    case "tutor":
      return "tutor";
    case "napne":
      return "napne";
    default:
      return "padrao";
  }
}

export default function Conversa() {
  const router = useRouter();

  const { tema, tipoTema } = useTheme();
  const { escalaFonte } = useFontSize();
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams<{
    usuarioId: string | string[];
    usuarioNome: string | string[];
    usuarioTipo: string | string[];
  }>();

  const usuarioDestinoId =
    typeof params.usuarioId === "string"
      ? params.usuarioId
      : params.usuarioId?.[0];

  // =====================================================
  // CONTROLE DE NOTIFICAÇÕES DA CONVERSA
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      if (!usuarioDestinoId) return;

      // A conversa com esta pessoa está aberta.
      definirConversaAtiva(usuarioDestinoId);

      return () => {
        // Ao sair da tela, volta a receber
        // notificações normalmente.
        limparConversaAtiva(usuarioDestinoId);
      };
    }, [usuarioDestinoId]),
  );

  const usuarioDestinoNome =
    typeof params.usuarioNome === "string"
      ? params.usuarioNome
      : params.usuarioNome?.[0] || "Usuário";

  const usuarioDestinoTipo =
    typeof params.usuarioTipo === "string"
      ? params.usuarioTipo
      : params.usuarioTipo?.[0] || "estudante";

  const nomeFormatado =
    usuarioDestinoTipo === "professor" &&
    !usuarioDestinoNome.startsWith("Prof.")
      ? `Prof. ${usuarioDestinoNome}`
      : usuarioDestinoNome;

  const cabecalhoEmColuna = width < 380 || escalaFonte * fontScale >= 1.2;

  const tamanhoImagem = Math.max(
    1,
    Math.min(230, (width - insets.left - insets.right - 24) * 0.85 - 26),
  );

  const [avatarDestino, setAvatarDestino] = useState<string | null>(null);

  const [usuarioLogadoId, setUsuarioLogadoId] = useState<string | null>(null);

  const [tipoUsuarioLogado, setTipoUsuarioLogado] = useState<string | null>(
    null,
  );

  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");

  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [textoEditado, setTextoEditado] = useState("");

  const [imagemSelecionada, setImagemSelecionada] = useState<string | null>(
    null,
  );

  const flatListRef = useRef<FlatList<ItemLista>>(null);
  const channelRef = useRef<any>(null);

  // Controle de rolagem
  const usuarioNoFinalRef = useRef(true);
  const editandoMensagemRef = useRef(false);
  const rolarAposEnvioRef = useRef(false);

  const mensagensRef = useRef<Mensagem[]>([]);

  const tipoBalaoMeu = obterTipoBalao(tipoUsuarioLogado);
  const tipoBalaoOutro = obterTipoBalao(usuarioDestinoTipo);

  const corBolhaMinha = tema.baloes[tipoBalaoMeu];
  const corBolhaOutra = tema.baloes[tipoBalaoOutro];

  const corBordaMinha = tema.baloes.bordas[tipoBalaoMeu];
  const corBordaOutra = tema.baloes.bordas[tipoBalaoOutro];

  const corTextoBalao = tema.baloes.texto;

  const corTema =
    usuarioDestinoTipo === "professor"
      ? colors.professor
      : usuarioDestinoTipo === "tutor"
        ? colors.tutor
        : colors.student;

  const avatarEncontrado = buscarAvatar(avatarDestino);

  // =====================================================
  // FUNÇÕES AUXILIARES
  // =====================================================

  const marcarMensagensComoLidas = useCallback(
    async (meuId: string) => {
      if (!usuarioDestinoId) return;

      const { error } = await supabase
        .from("mensagens")
        .update({ lida: true })
        .eq("destinatario", meuId)
        .eq("remetente", usuarioDestinoId)
        .eq("lida", false);

      if (error) {
        console.error("Erro ao marcar mensagens como lidas:", error);
      }
    },
    [usuarioDestinoId],
  );

  const prepararImagem = useCallback(
    async (mensagem: Mensagem): Promise<Mensagem> => {
      if (mensagem.tipo !== "imagem" || !mensagem.arquivo_url) {
        return mensagem;
      }

      try {
        const { data, error } = await supabase.storage
          .from("chat-imagens")
          .createSignedUrl(mensagem.arquivo_url, 60 * 60);

        if (error || !data?.signedUrl) {
          console.error("Erro ao gerar URL da imagem:", {
            mensagemId: mensagem.id,
            erro: error?.message ?? "URL não retornada",
          });

          return {
            ...mensagem,
            imagem_url: null,
          };
        }

        console.log("Imagem privada autorizada:", mensagem.id);

        return {
          ...mensagem,
          imagem_url: data.signedUrl,
        };
      } catch (erro) {
        console.error("Erro inesperado ao carregar imagem:", erro);

        return {
          ...mensagem,
          imagem_url: null,
        };
      }
    },
    [],
  );

  useEffect(() => {
    mensagensRef.current = mensagens;
  }, [mensagens]);

  useEffect(() => {
    let ativo = true;

    const renovarLinks = async () => {
      const imagens = mensagensRef.current.filter(
        (m) => m.tipo === "imagem" && !!m.arquivo_url,
      );

      if (imagens.length === 0) return;

      const atualizadas = await Promise.all(
        imagens.map((m) => prepararImagem(m)),
      );

      if (!ativo) return;

      const links = new Map(
        atualizadas.map((m) => [m.id, m.imagem_url ?? null]),
      );

      setMensagens((atual) =>
        atual.map((m) =>
          links.has(m.id)
            ? {
                ...m,
                imagem_url: links.get(m.id) ?? null,
              }
            : m,
        ),
      );
    };

    const renovarComTratamento = () => {
      void renovarLinks().catch((erro) => {
        console.error("Erro ao renovar imagens privadas:", erro);
      });
    };

    const listener = AppState.addEventListener("change", (estado) => {
      if (estado === "active") {
        renovarComTratamento();
      }
    });

    const intervalo = setInterval(
      () => {
        if (AppState.currentState === "active") {
          renovarComTratamento();
        }
      },
      45 * 60 * 1000,
    );

    return () => {
      ativo = false;
      clearInterval(intervalo);
      listener.remove();
    };
  }, [prepararImagem]);

  const rolarParaUltimaMensagem = useCallback((animated = true) => {
    if (editandoMensagemRef.current) return;

    flatListRef.current?.scrollToOffset({
      offset: 0,
      animated,
    });
  }, []);

  // =====================================================
  // INICIALIZAÇÃO E REALTIME
  // =====================================================

  useEffect(() => {
    let ativo = true;
    let canalLocal: any = null;

    const iniciar = async () => {
      if (!usuarioDestinoId) {
        router.back();
        return;
      }

      setLoading(true);
      setMensagens([]);
      setUsuarioLogadoId(null);
      setAvatarDestino(null);

      usuarioNoFinalRef.current = true;
      editandoMensagemRef.current = false;
      rolarAposEnvioRef.current = false;

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (!ativo) return;

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        setUsuarioLogadoId(user.id);

        const [perfilResult, destinoResult] = await Promise.all([
          supabase.from("usuarios").select("tipo").eq("id", user.id).single(),

          supabase
            .from("usuarios")
            .select("avatar")
            .eq("id", usuarioDestinoId)
            .single(),
        ]);

        if (!ativo) return;

        if (perfilResult.error) {
          console.error("Erro ao carregar perfil:", perfilResult.error);
        }

        if (destinoResult.error) {
          console.error("Erro ao carregar avatar:", destinoResult.error);
        }

        setTipoUsuarioLogado(perfilResult.data?.tipo ?? null);
        setAvatarDestino(destinoResult.data?.avatar ?? null);

        const { data, error } = await supabase
          .from("mensagens")
          .select("*")
          .or(
            `and(remetente.eq.${user.id},destinatario.eq.${usuarioDestinoId}),and(remetente.eq.${usuarioDestinoId},destinatario.eq.${user.id})`,
          )
          .order("data_envio", { ascending: true });

        if (!ativo) return;

        if (error) {
          console.error("Erro ao carregar mensagens:", error);
          Alert.alert("Erro", "Não foi possível carregar a conversa.");
        } else {
          const mensagensPreparadas = await Promise.all(
            ((data || []) as Mensagem[]).map((mensagem) =>
              prepararImagem(mensagem),
            ),
          );

          if (!ativo) return;

          setMensagens(mensagensPreparadas);
        }
        canalLocal = supabase
          .channel(`chat-${user.id}-${usuarioDestinoId}-${Date.now()}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "mensagens",
            },
            async (payload) => {
              if (!ativo) return;

              if (payload.eventType === "INSERT") {
                const recebida = payload.new as Mensagem;

                const pertenceAoChat =
                  (recebida.remetente === user.id &&
                    recebida.destinatario === usuarioDestinoId) ||
                  (recebida.remetente === usuarioDestinoId &&
                    recebida.destinatario === user.id);

                if (!pertenceAoChat) return;

                const nova = await prepararImagem(recebida);

                if (!ativo) return;

                setMensagens((atual) => {
                  if (atual.some((m) => m.id === nova.id)) {
                    return atual;
                  }

                  return [...atual, nova].sort(
                    (a, b) =>
                      new Date(a.data_envio).getTime() -
                      new Date(b.data_envio).getTime(),
                  );
                });

                if (nova.destinatario === user.id) {
                  void marcarMensagensComoLidas(user.id);
                }

                return;
              }

              if (payload.eventType === "UPDATE") {
                const atualizada = payload.new as Mensagem;

                const atualizadaPreparada = await prepararImagem(atualizada);

                if (!ativo) return;

                setMensagens((atual) => {
                  const indice = atual.findIndex((m) => m.id === atualizada.id);

                  if (indice === -1) return atual;

                  const anterior = atual[indice];

                  // Evita renderização desnecessária quando
                  // apenas o status de leitura muda.
                  if (
                    anterior.conteudo === atualizada.conteudo &&
                    anterior.editada === atualizada.editada &&
                    anterior.arquivo_url === atualizada.arquivo_url &&
                    anterior.data_edicao === atualizada.data_edicao
                  ) {
                    return atual;
                  }

                  return atual.map((m) =>
                    m.id === atualizada.id
                      ? {
                          ...m,
                          ...atualizadaPreparada,
                        }
                      : m,
                  );
                });

                return;
              }

              if (payload.eventType === "DELETE") {
                const apagada = payload.old as Mensagem;

                setMensagens((atual) =>
                  atual.filter((m) => m.id !== apagada.id),
                );
              }
            },
          )
          .subscribe();

        channelRef.current = canalLocal;

        await marcarMensagensComoLidas(user.id);
      } catch (error) {
        console.error("Erro inesperado ao iniciar conversa:", error);
      } finally {
        if (ativo) setLoading(false);
      }
    };

    void iniciar();

    return () => {
      ativo = false;

      if (canalLocal) {
        void supabase.removeChannel(canalLocal);
      }

      if (channelRef.current === canalLocal) {
        channelRef.current = null;
      }
    };
  }, [usuarioDestinoId, marcarMensagensComoLidas, prepararImagem, router]);

  // =====================================================
  // ENVIAR MENSAGEM
  // =====================================================

  const enviarMensagem = async (textoParam?: string) => {
    const texto = (textoParam !== undefined ? textoParam : novaMensagem).trim();

    if (!texto || !usuarioLogadoId || !usuarioDestinoId || enviando) {
      return;
    }

    try {
      setEnviando(true);

      if (!editandoMensagemRef.current) {
        rolarAposEnvioRef.current = true;
      }

      const { data, error } = await supabase
        .from("mensagens")
        .insert({
          conteudo: texto,
          remetente: usuarioLogadoId,
          destinatario: usuarioDestinoId,
          tipo: "texto",
          arquivo_url: null,
        })
        .select("*")
        .single();

      if (error) throw error;

      // Mostra imediatamente, mesmo se o evento Realtime
      // ainda não tiver chegado.
      if (data) {
        const enviada = data as Mensagem;

        setMensagens((atual) => {
          if (atual.some((m) => m.id === enviada.id)) {
            return atual;
          }

          return [...atual, enviada].sort(
            (a, b) =>
              new Date(a.data_envio).getTime() -
              new Date(b.data_envio).getTime(),
          );
        });
      }

      if (textoParam === undefined) {
        setNovaMensagem("");
      }
    } catch (error) {
      rolarAposEnvioRef.current = false;

      console.error("Erro ao enviar mensagem:", error);
      Alert.alert("Erro", "Não foi possível enviar a mensagem.");
    } finally {
      setEnviando(false);
    }
  };

  // =====================================================
  // EDIÇÃO DE MENSAGENS
  // =====================================================

  const iniciarEdicao = useCallback(
    (mensagem: Mensagem) => {
      if (mensagem.remetente !== usuarioLogadoId || mensagem.tipo !== "texto") {
        return;
      }

      editandoMensagemRef.current = true;
      usuarioNoFinalRef.current = false;
      rolarAposEnvioRef.current = false;

      setEditandoId(mensagem.id);
      setTextoEditado(mensagem.conteudo || "");
    },
    [usuarioLogadoId],
  );

  const cancelarEdicao = useCallback(() => {
    editandoMensagemRef.current = false;

    setEditandoId(null);
    setTextoEditado("");
  }, []);

  const salvarEdicao = async () => {
    const texto = textoEditado.trim();

    if (!texto || editandoId === null || !usuarioLogadoId) {
      return;
    }

    try {
      const dataEdicao = new Date().toISOString();

      const { error } = await supabase
        .from("mensagens")
        .update({
          conteudo: texto,
          editada: true,
          data_edicao: dataEdicao,
        })
        .eq("id", editandoId)
        .eq("remetente", usuarioLogadoId);

      if (error) throw error;

      setMensagens((atual) =>
        atual.map((m) =>
          m.id === editandoId
            ? {
                ...m,
                conteudo: texto,
                editada: true,
                data_edicao: dataEdicao,
              }
            : m,
        ),
      );

      cancelarEdicao();
    } catch (error) {
      console.error("Erro ao editar mensagem:", error);
      Alert.alert("Erro", "Não foi possível editar a mensagem.");
    }
  };

  // =====================================================
  // EXCLUSÃO DE MENSAGENS
  // =====================================================

  const apagarMensagem = useCallback(
    async (mensagem: Mensagem) => {
      if (!usuarioLogadoId) return;

      try {
        const { error } = await supabase
          .from("mensagens")
          .delete()
          .eq("id", mensagem.id)
          .eq("remetente", usuarioLogadoId);

        if (error) throw error;

        setMensagens((atual) => atual.filter((m) => m.id !== mensagem.id));

        if (mensagem.tipo === "imagem" && mensagem.arquivo_url) {
          const { error: storageError } = await supabase.storage
            .from("chat-imagens")
            .remove([mensagem.arquivo_url]);

          if (storageError) {
            console.error("Erro ao apagar imagem do Storage:", storageError);
          }
        }
      } catch (error) {
        console.error("Erro ao apagar mensagem:", error);
        Alert.alert("Erro", "Não foi possível apagar a mensagem.");
      }
    },
    [usuarioLogadoId],
  );

  const confirmarExclusao = useCallback(
    (mensagem: Mensagem) => {
      if (mensagem.remetente !== usuarioLogadoId) return;

      Alert.alert("Apagar mensagem", "Deseja apagar esta mensagem?", [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Apagar",
          style: "destructive",
          onPress: () => void apagarMensagem(mensagem),
        },
      ]);
    },
    [usuarioLogadoId, apagarMensagem],
  );

  // =====================================================
  // IMAGENS
  // =====================================================

  const enviarImagem = async (
    uri: string,
    mimeType: string,
    fileName: string,
  ) => {
    if (!usuarioLogadoId || !usuarioDestinoId || enviando) {
      return;
    }

    try {
      setEnviando(true);

      if (!editandoMensagemRef.current) {
        rolarAposEnvioRef.current = true;
      }

      const nomeArquivo = `${usuarioLogadoId}/${Crypto.randomUUID()}.jpg`;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const arrayBuffer = decode(base64);

      const { error: uploadError } = await supabase.storage
        .from("chat-imagens")
        .upload(nomeArquivo, arrayBuffer, {
          contentType: "image/jpeg",
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data, error: mensagemError } = await supabase
        .from("mensagens")
        .insert({
          conteudo: null,
          remetente: usuarioLogadoId,
          destinatario: usuarioDestinoId,
          tipo: "imagem",
          arquivo_url: nomeArquivo,
        })
        .select("*")
        .single();

      if (mensagemError) {
        await supabase.storage.from("chat-imagens").remove([nomeArquivo]);

        throw mensagemError;
      }

      if (data) {
        const mensagem = await prepararImagem(data as Mensagem);

        setMensagens((atual) => {
          if (atual.some((m) => m.id === mensagem.id)) {
            return atual;
          }

          return [...atual, mensagem].sort(
            (a, b) =>
              new Date(a.data_envio).getTime() -
              new Date(b.data_envio).getTime(),
          );
        });
      }
    } catch (error) {
      rolarAposEnvioRef.current = false;

      console.error("Erro ao enviar imagem:", error);
      Alert.alert("Erro", "Não foi possível enviar a imagem.");
    } finally {
      setEnviando(false);
    }
  };

  const escolherImagem = async () => {
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (resultado.canceled) return;

      const imagem = resultado.assets[0];

      if (!imagem?.uri) return;

      await enviarImagem(
        imagem.uri,
        imagem.mimeType || "image/jpeg",
        imagem.fileName || `imagem-${Date.now()}.jpg`,
      );
    } catch (error) {
      console.error("Erro ao selecionar imagem:", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
    }
  };

  const tirarFoto = async () => {
    try {
      const permissao = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissao.granted) {
        Alert.alert(
          "Permissão necessária",
          "Permita o acesso à câmera para tirar uma foto.",
        );
        return;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (resultado.canceled) return;

      const imagem = resultado.assets[0];

      if (!imagem?.uri) return;

      await enviarImagem(
        imagem.uri,
        imagem.mimeType || "image/jpeg",
        imagem.fileName || `foto-${Date.now()}.jpg`,
      );
    } catch (error) {
      console.error("Erro ao tirar foto:", error);
      Alert.alert("Erro", "Não foi possível tirar a foto.");
    }
  };

  const abrirOpcoesImagem = () => {
    Alert.alert("Enviar imagem", "Escolha uma opção", [
      { text: "Câmera", onPress: () => void tirarFoto() },
      { text: "Galeria", onPress: () => void escolherImagem() },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  // =====================================================
  // LISTA DE MENSAGENS
  // =====================================================

  // A FlatList será invertida.
  // Portanto, os itens ficam do mais novo ao mais antigo.
  const itensConversa = useMemo<ItemLista[]>(() => {
    const lista: ItemLista[] = [];
    let ultimaData = "";

    mensagens.forEach((mensagem) => {
      const chave = obterChaveData(mensagem.data_envio);

      if (chave !== ultimaData) {
        lista.push({
          tipoItem: "data",
          id: `data-${chave}`,
          data: mensagem.data_envio,
        });

        ultimaData = chave;
      }

      lista.push({
        tipoItem: "mensagem",
        id: `mensagem-${mensagem.id}`,
        mensagem,
      });
    });

    return lista.reverse();
  }, [mensagens]);

  const dadosExtrasLista = useMemo(
    () => ({
      escalaFonte,
      tipoTema,
      editandoId,
      textoEditado,
      usuarioLogadoId,
      tema,
    }),
    [escalaFonte, tipoTema, editandoId, textoEditado, usuarioLogadoId, tema],
  );

  // =====================================================
  // RENDERIZAR MENSAGENS
  // =====================================================

  const renderMensagem = ({ item }: { item: ItemLista }) => {
    if (item.tipoItem === "data") {
      return (
        <View
          style={{
            alignItems: "center",
            marginVertical: 10,
          }}
        >
          <View
            style={{
              backgroundColor: tema.card,
              paddingHorizontal: 13,
              paddingVertical: 6,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                color: tema.text,
                fontSize: 11 * escalaFonte,
                fontFamily: "FredokaMedium",
              }}
            >
              {formatarDataBloco(item.data)}
            </Text>
          </View>
        </View>
      );
    }

    const mensagem = item.mensagem;
    const minhaMensagem = mensagem.remetente === usuarioLogadoId;

    const estaEditando = editandoId === mensagem.id;

    // -------------------------------------------------
    // MENSAGEM EM EDIÇÃO
    // -------------------------------------------------

    if (estaEditando) {
      return (
        <View
          style={[styles.chatMessageContainer, styles.chatMessageContainerMine]}
        >
          <View
            style={{
              width: "85%",
              backgroundColor: tema.card,
              borderRadius: 16,
              padding: 10,
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
                width: "100%",
                color: tema.text,
                fontSize: 15 * escalaFonte,
                minHeight: 48,
                maxHeight: Math.max(100, 100 * escalaFonte * fontScale),
                paddingVertical: 8,
                textAlignVertical: "top",
                fontFamily: "FredokaLight",
              }}
            />

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                marginTop: 8,
                gap: 8,
              }}
            >
              <Pressable
                onPress={cancelarEdicao}
                style={{
                  flexGrow: 1,
                  flexBasis: 40,
                  minHeight: 44,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 15,
                  backgroundColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 12 * escalaFonte,
                    textAlign: "center",
                    fontFamily: "FredokaMedium",
                  }}
                >
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={() => void salvarEdicao()}
                disabled={!textoEditado.trim()}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 15,
                  backgroundColor: corTema,
                  opacity: textoEditado.trim() ? 1 : 0.5,
                  flexGrow: 1,
                  flexBasis: 40,
                  minHeight: 44,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 12 * escalaFonte,
                    textAlign: "center",
                    fontFamily: "FredokaMedium",
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

    // -------------------------------------------------
    // MENSAGEM NORMAL
    // -------------------------------------------------

    return (
      <Pressable
        onLongPress={() => {
          if (!minhaMensagem) return;

          if (mensagem.tipo === "texto") {
            Alert.alert("Mensagem", "O que deseja fazer?", [
              {
                text: "Editar",
                onPress: () => iniciarEdicao(mensagem),
              },
              {
                text: "Apagar",
                style: "destructive",
                onPress: () => confirmarExclusao(mensagem),
              },
              { text: "Cancelar", style: "cancel" },
            ]);
          } else {
            confirmarExclusao(mensagem);
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
            minhaMensagem ? styles.chatBubbleMine : styles.chatBubbleOther,
            {
              backgroundColor: minhaMensagem ? corBolhaMinha : corBolhaOutra,
              borderWidth: tipoTema === "forte" ? 2 : 0,
              borderColor: minhaMensagem ? corBordaMinha : corBordaOutra,
            },
          ]}
        >
          {mensagem.tipo === "imagem" && mensagem.imagem_url ? (
            <Pressable
              onPress={() => setImagemSelecionada(mensagem.imagem_url!)}
            >
              <Image
                source={{ uri: mensagem.imagem_url }}
                style={{
                  width: tamanhoImagem,
                  height: tamanhoImagem,
                  borderRadius: 12,
                  backgroundColor: colors.border,
                }}
                resizeMode="cover"
                onError={() => {
                  console.warn(
                    "Falha ao exibir imagem da mensagem:",
                    mensagem.id,
                  );
                }}
              />
            </Pressable>
          ) : (
            <Text
              style={[
                styles.chatMessageText,
                {
                  fontSize: 15 * escalaFonte,
                  color: corTextoBalao,
                },
              ]}
            >
              {mensagem.tipo === "imagem"
                ? "Imagem indisponível"
                : mensagem.conteudo}
            </Text>
          )}

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "flex-end",
              marginTop: 4,
              gap: 4,
            }}
          >
            {mensagem.editada && (
              <Text
                style={{
                  fontSize: 9 * escalaFonte,
                  color: corTextoBalao,
                  fontFamily: "FredokaLight",
                  marginRight: 5,
                  fontStyle: "italic",
                }}
              >
                editada
              </Text>
            )}

            <Text
              style={[
                styles.chatMessageTime,
                {
                  fontSize: 10 * escalaFonte,
                  color: corTextoBalao,
                },
              ]}
            >
              {formatarHorario(mensagem.data_envio)}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  // =====================================================
  // TELA
  // =====================================================

  return (
    <SafeAreaView
      style={[
        styles.conversationContainer,
        {
          flex: 1,
          backgroundColor: tema.background,
        },
      ]}
      edges={["left", "right", "bottom"]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <StatusBar
        barStyle={tipoTema === "claro" ? "dark-content" : "light-content"}
        backgroundColor={tema.background}
      />

      {/* MODAL DE VISUALIZAÇÃO DA IMAGEM */}
      <Modal
        visible={imagemSelecionada !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setImagemSelecionada(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.95)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Pressable
            onPress={() => setImagemSelecionada(null)}
            style={{
              position: "absolute",
              top:
                Platform.OS === "android"
                  ? (StatusBar.currentHeight || 24) + 10
                  : 45,
              right: 20,
              zIndex: 10,
              width: 45,
              height: 45,
              borderRadius: 25,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </Pressable>

          {imagemSelecionada && (
            <Image
              source={{ uri: imagemSelecionada }}
              style={{ width: "100%", height: "80%" }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* CABEÇALHO */}
        <View
          style={[
            styles.conversationHeader,
            {
              backgroundColor: tema.card,
              borderBottomColor: tema.border,
              paddingTop: insets.top + 8,
            },
          ]}
        >
          <Pressable
            style={styles.conversationBackButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={tema.text} />
          </Pressable>

          <View
            style={[styles.conversationAvatar, { backgroundColor: corTema }]}
          >
            {avatarEncontrado ? (
              <AvatarImagem uri={avatarEncontrado.url} tamanho={50} />
            ) : (
              <Ionicons name="person" size={23} color={colors.white} />
            )}
          </View>

          <View
            style={[
              styles.conversationHeaderInfo,
              {
                flexDirection: cabecalhoEmColuna ? "column" : "row",
                alignItems: cabecalhoEmColuna ? "flex-start" : "center",
                gap: 8,
                paddingRight: 8,
              },
            ]}
          >
            <View
              style={{
                minWidth: 0,
                ...(cabecalhoEmColuna
                  ? { width: "100%" as const }
                  : { flex: 1 }),
              }}
            >
              <Text
                style={[
                  styles.conversationHeaderName,
                  {
                    color: tema.text,
                    fontSize: 17 * escalaFonte,
                  },
                ]}
              >
                {nomeFormatado}
              </Text>

              <Text
                style={[
                  styles.conversationHeaderStatus,
                  {
                    color: tema.text,
                    fontSize: 12 * escalaFonte,
                  },
                ]}
              >
                Conversa privada
              </Text>
            </View>
          </View>
        </View>

        {/* LISTA DE MENSAGENS */}
        {loading ? (
          <View style={styles.chatLoadingContainer}>
            <ActivityIndicator size="large" color={corTema} />

            <Text
              style={[
                styles.chatLoadingText,
                {
                  color: tema.text,
                  fontSize: 14 * escalaFonte,
                },
              ]}
            >
              Carregando conversa...
            </Text>
          </View>
        ) : mensagens.length === 0 ? (
          <View style={styles.conversationEmptyContainer}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={60}
              color={colors.placeholder}
            />

            <Text
              style={[
                styles.conversationEmptyTitle,
                {
                  color: tema.text,
                  fontSize: 18 * escalaFonte,
                },
              ]}
            >
              Inicie a conversa
            </Text>

            <Text
              style={[
                styles.conversationEmptyText,
                {
                  color: tema.text,
                  fontSize: 14 * escalaFonte,
                },
              ]}
            >
              Envie uma mensagem para {nomeFormatado}.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            style={{ flex: 1 }}
            inverted
            data={itensConversa}
            keyExtractor={(item) => item.id}
            renderItem={renderMensagem}
            extraData={dadosExtrasLista}
            contentContainerStyle={styles.conversationMessagesList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={12}
            maxToRenderPerBatch={8}
            updateCellsBatchingPeriod={50}
            windowSize={7}
            removeClippedSubviews={false}
            onScroll={({ nativeEvent }) => {
              // Na lista invertida, offset 0 é a
              // posição das mensagens mais recentes.
              if (editandoMensagemRef.current) {
                return;
              }

              usuarioNoFinalRef.current = nativeEvent.contentOffset.y < 100;
            }}
            scrollEventThrottle={32}
            onContentSizeChange={() => {
              if (editandoMensagemRef.current) {
                return;
              }

              if (rolarAposEnvioRef.current) {
                rolarAposEnvioRef.current = false;

                requestAnimationFrame(() => {
                  rolarParaUltimaMensagem(true);
                });
              }
            }}
          />
        )}

        {/* SUGESTÕES RÁPIDAS */}
        <View
          style={{
            backgroundColor: tema.background,
            paddingVertical: 6,
            borderTopWidth: 1,
            borderTopColor: tema.border,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 10,
              gap: 8,
            }}
          >
            {["Ok, confirmado", "Podemos agendar um horário?", "Obrigado!"].map(
              (textoPredef, index) => (
                <Pressable
                  key={index}
                  onPress={() => void enviarMensagem(textoPredef)}
                  style={{
                    backgroundColor: tema.card,
                    borderWidth: 1.5,
                    borderColor: corTema,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 18,
                    minHeight: 44,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: tema.text,
                      fontSize: 13 * escalaFonte,
                      fontFamily: "FredokaMedium",
                    }}
                  >
                    {textoPredef}
                  </Text>
                </Pressable>
              ),
            )}
          </ScrollView>
        </View>

        {/* CAMPO DE MENSAGEM */}
        <View
          style={[
            styles.messageInputContainer,
            {
              backgroundColor: tema.background,
              borderTopColor: tema.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.messageInput,
              {
                backgroundColor: tema.input,
                color: tipoTema === "forte" ? "#000000" : tema.text,
                fontSize: 15 * escalaFonte,
                minHeight: Math.max(44, 24 * escalaFonte * fontScale + 20),
                maxHeight: Math.max(110, 72 * escalaFonte * fontScale + 20),
              },
            ]}
            value={novaMensagem}
            onChangeText={setNovaMensagem}
            placeholder="Digite sua mensagem..."
            placeholderTextColor={tema.text}
            multiline
            maxLength={1000}
            editable={!enviando}
          />

          {/* CÂMERA / GALERIA */}
          <Pressable
            onPress={abrirOpcoesImagem}
            disabled={enviando}
            style={{
              flexShrink: 0,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: tema.card,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 6,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Ionicons name="camera" size={20} color={corTema} />
          </Pressable>

          {/* ENVIAR */}
          <Pressable
            style={({ pressed }) => [
              styles.sendMessageButton,
              { backgroundColor: corTema },
              (!novaMensagem.trim() || enviando) &&
                styles.sendMessageButtonDisabled,
              pressed &&
                novaMensagem.trim() &&
                !enviando &&
                styles.sendMessageButtonPressed,
            ]}
            onPress={() => void enviarMensagem()}
            disabled={!novaMensagem.trim() || enviando}
          >
            {enviando ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={21} color={colors.white} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
