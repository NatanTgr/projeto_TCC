import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, Switch, useWindowDimensions, KeyboardAvoidingView, Platform,} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import Estilos from "../../Estilos/TelaConfigEstilo";
import { testarSupabase } from "../../bd/testeSupabase";
import { useFontSize } from "../../context/FontSizeContext";
import { supabase } from "../../bd/supabase";
import AvatarImagem from "../../components/AvatarImagem";
import SeletorAvatar from "../../components/SeletorAvatar";
import { AVATARES, buscarAvatar, } from "../../components/avatares";
import BotaoAlerta from "../../components/BotaoAlerta";
import { removerPushChatDesteAparelho } from "../../components/notificacoesChat";

type PrazoLimpeza = 3 | 6 | 12;

const OPCOES_LIMPEZA: { meses: PrazoLimpeza; label: string }[] = [
  { meses: 3, label: "3 meses" },
  { meses: 6, label: "6 meses" },
  { meses: 12, label: "1 ano" },
];

export default function TelaConfig() {

  type Usuario = {
    id: string;
    nome: string;
    email: string;
    campus: string;
    tipo: "estudante" | "professor" | "tutor";
    estado: string | null;
    avatar: string | null;
  };

  type DadosAluno = {
    curso: string;
    turno: string;
    turma: string;
  };

  type DadosProfessor = {
    area_atuacao: string | null;
  };

  type DadosTutor = {
    departamento: string | null;
  };

  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const [dadosAluno, setDadosAluno] = useState<DadosAluno | null>(null);

  const [dadosProfessor, setDadosProfessor] = useState<DadosProfessor | null>(
    null,
  );

  const [dadosTutor, setDadosTutor] = useState<DadosTutor | null>(null);

  const [carregandoPerfil, setCarregandoPerfil] = useState(true);

  const [chatAtivo, setChatAtivo] = useState(true);
  const [tarefasAtivas, setTarefasAtivas] = useState(true);

  const [prazoLimpeza, setPrazoLimpeza] = useState<PrazoLimpeza | null>(null);

  const [modalLimpeza, setModalLimpeza] = useState(false);
  const [salvandoLimpeza, setSalvandoLimpeza] = useState(false);
  const [carregandoLimpeza, setCarregandoLimpeza] = useState(true);
  const [erroLimpeza, setErroLimpeza] = useState(false);

  const labelPrazoLimpeza =
    OPCOES_LIMPEZA.find((opcao) => opcao.meses === prazoLimpeza)?.label ??
    "Não configurada";

  async function carregarPreferenciaLimpeza(usuarioId: string) {
    setCarregandoLimpeza(true);
    setErroLimpeza(false);
    setPrazoLimpeza(null);

    try {
      const { data, error } = await supabase
        .from("preferencias_limpeza_tarefas")
        .select("meses")
        .eq("usuario_id", usuarioId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        if (![3, 6, 12].includes(data.meses)) {
          throw new Error("Prazo de limpeza inválido.");
        }

        setPrazoLimpeza(data.meses as PrazoLimpeza);
      }
    } catch (erro) {
      console.error("Erro ao carregar limpeza de tarefas:", erro);
      setErroLimpeza(true);
    } finally {
      setCarregandoLimpeza(false);
    }
  }

  async function salvarPrazoLimpeza(meses: PrazoLimpeza) {
    if (usuario?.tipo !== "estudante" || salvandoLimpeza) return;

    try {
      setSalvandoLimpeza(true);

      const { data, error } = await supabase
        .from("preferencias_limpeza_tarefas")
        .upsert(
          {
            usuario_id: usuario.id,
            meses,
          },
          { onConflict: "usuario_id" },
        )
        .select("meses")
        .single();

      if (error) throw error;
      if (data?.meses !== meses) {
        throw new Error("O banco não confirmou a configuração.");
      }

      setPrazoLimpeza(meses);
      setModalLimpeza(false);
    } catch (erro) {
      console.error("Erro ao salvar limpeza de tarefas:", erro);
      Alert.alert("Erro", "Não foi possível salvar o prazo de limpeza.");
    } finally {
      setSalvandoLimpeza(false);
    }
  }

  const [salvandoNotificacao, setSalvandoNotificacao] = useState(false);

  async function alterarNotificacao(tipo: "chat" | "tarefas", ativa: boolean) {
    if (!usuario || salvandoNotificacao) return;

    try {
      setSalvandoNotificacao(true);

      const { data, error } = await supabase
        .from("preferencias_notificacoes")
        .upsert(
          {
            usuario_id: usuario.id,
            chat_ativo: tipo === "chat" ? ativa : chatAtivo,
            tarefas_ativas: tipo === "tarefas" ? ativa : tarefasAtivas,
          },
          { onConflict: "usuario_id" },
        )
        .select("chat_ativo, tarefas_ativas")
        .single();

      if (error) throw error;

      setChatAtivo(data.chat_ativo);
      setTarefasAtivas(data.tarefas_ativas);
    } catch (erro) {
      console.error("Erro ao alterar notificações:", erro);
      Alert.alert("Erro", "Não foi possível salvar esta configuração.");
    } finally {
      setSalvandoNotificacao(false);
    }
  }

  const [modalTamanhoFonte, setModalTamanhoFonte] = useState(false);
  const sairDaConta = async () => {
  try {
    const {
      data: { user },
      error: erroUsuario,
    } = await supabase.auth.getUser();

    if (erroUsuario || !user) {
      throw erroUsuario ?? new Error("Usuário não autenticado.");
    }

    // A sessão precisa continuar ativa para a política RLS
    // permitir a exclusão do token deste aparelho.
    await removerPushChatDesteAparelho(user.id);

    const { error: erroSaida } = await supabase.auth.signOut({
      scope: "local",
    });

    if (erroSaida) throw erroSaida;

    router.replace("/login");
  } catch (erro) {
    console.error("Erro ao sair da conta:", erro);

    const detalhe =
      typeof erro === "object" && erro !== null && "message" in erro
        ? String(erro.message)
        : "Erro sem detalhes disponíveis.";

    Alert.alert(
      "Não foi possível sair",
      `Tente novamente.\n\nDetalhe: ${detalhe}`,
    );
  }
};


  const { tipoTema, selecionarTema, tema } = useTheme();

  const { tamanhoFonte, escalaFonte, selecionarTamanhoFonte } = useFontSize();

  const { width, fontScale } = useWindowDimensions();

  const perfilEmColuna = width < 380 || escalaFonte * fontScale >= 1.2;

  const [modalAlterarSenha, setModalAlterarSenha] = useState(false);

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [alterandoSenha, setAlterandoSenha] = useState(false);

  const [modalAvatar, setModalAvatar] = useState(false);

  const avatarPerfil = buscarAvatar(usuario?.avatar);

  async function salvarAvatar(url: string | null) {
    if (!usuario) {
      throw new Error("Perfil inválido.");
    }

    if (url !== null && !AVATARES.some((avatar) => avatar.url === url)) {
      throw new Error("Avatar inválido.");
    }

    const {
      data: { user },
      error: erroAuth,
    } = await supabase.auth.getUser();

    if (erroAuth || !user || user.id !== usuario.id) {
      throw new Error("Sessão inválida. Entre novamente.");
    }

    const { data, error } = await supabase
      .from("usuarios")
      .update({
        avatar: url,
      })
      .eq("id", user.id)
      .select("id, avatar")
      .single();

    if (error || !data || data.id !== user.id || data.avatar !== url) {
      console.log("Erro ao salvar avatar:", error);

      throw error ?? new Error("O banco não confirmou a alteração.");
    }

    setUsuario((usuarioAtual) =>
      usuarioAtual?.id === user.id
        ? {
            ...usuarioAtual,
            avatar: data.avatar,
          }
        : usuarioAtual,
    );
  }

  async function carregarPerfil() {
    try {
      setCarregandoPerfil(true);

      // Pega o usuário autenticado
      const {
        data: { user },
        error: erroAuth,
      } = await supabase.auth.getUser();

      if (erroAuth) {
        console.log("Erro ao pegar usuário:", erroAuth);
        return;
      }

      if (!user) {
        console.log("Nenhum usuário autenticado.");
        return;
      }

      // Busca os dados gerais na tabela usuarios
      const { data: dadosUsuario, error: erroUsuario } = await supabase
        .from("usuarios")
        .select("id, nome, email, campus, tipo, estado, avatar")
        .eq("id", user.id)
        .single();

      if (erroUsuario) {
        console.log("Erro ao buscar usuário:", erroUsuario);
        return;
      }

      setUsuario(dadosUsuario);

      if (dadosUsuario.tipo === "estudante") {
        await carregarPreferenciaLimpeza(user.id);
      }

      const { data: preferencias, error: erroPreferencias } = await supabase
        .from("preferencias_notificacoes")
        .select("chat_ativo, tarefas_ativas")
        .eq("usuario_id", user.id)
        .maybeSingle();

      if (erroPreferencias) throw erroPreferencias;

      setChatAtivo(preferencias?.chat_ativo ?? true);
      setTarefasAtivas(preferencias?.tarefas_ativas ?? true);

      // Busca os dados específicos dependendo do tipo
      if (dadosUsuario.tipo === "estudante") {
        const { data, error } = await supabase
          .from("alunos")
          .select("curso, turno, turma")
          .eq("id", user.id)
          .single();

        if (error) {
          console.log("Erro ao buscar aluno:", error);
          return;
        }

        setDadosAluno(data);
      }

      if (dadosUsuario.tipo === "professor") {
        const { data, error } = await supabase
          .from("professores")
          .select("area_atuacao")
          .eq("id", user.id)
          .single();

        if (error) {
          console.log("Erro ao buscar professor:", error);
          return;
        }

        setDadosProfessor(data);
      }

      if (dadosUsuario.tipo === "tutor") {
        const { data, error } = await supabase
          .from("tutores")
          .select("departamento")
          .eq("id", user.id)
          .single();

        if (error) {
          console.log("Erro ao buscar tutor:", error);
          return;
        }

        setDadosTutor(data);
      }
    } catch (erro) {
      console.log("Erro ao carregar perfil:", erro);
    } finally {
      setCarregandoPerfil(false);
    }
  }

  async function alterarSenha() {
    if (!novaSenha || !confirmarSenha) {
      Alert.alert("Atenção", "Preencha os dois campos.");
      return;
    }

    if (novaSenha.length < 6) {
      Alert.alert("Atenção", "A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert("Atenção", "As senhas não coincidem.");
      return;
    }

    try {
      setAlterandoSenha(true);

      const { error } = await supabase.auth.updateUser({
        password: novaSenha,
      });

      if (error) {
        console.log("Erro ao alterar senha:", error);
        Alert.alert("Erro", "Não foi possível alterar a senha.");
        return;
      }

      Alert.alert("Sucesso", "Senha alterada com sucesso.");

      setNovaSenha("");
      setConfirmarSenha("");
      setModalAlterarSenha(false);
    } catch (erro) {
      console.log("Erro ao alterar senha:", erro);
      Alert.alert("Erro", "Ocorreu um erro ao alterar a senha.");
    } finally {
      setAlterandoSenha(false);
    }
  }

  useEffect(() => {
    async function iniciarTela() {
      await testarSupabase();
      await carregarPerfil();
    }

    iniciarTela();
  }, []);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[Estilos.container, { backgroundColor: tema.background }]}
    >
      {/* Cabeçalho */}
      <View style={Estilos.header}>
        <View style={Estilos.topRow}>
          <Text
            style={[
              Estilos.headerTitle,
              {
                color: tema.text,
                fontSize: 30 * escalaFonte,
              },
            ]}
          >
            Configurações
          </Text>

          {usuario?.tipo === "estudante" && <BotaoAlerta />}
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={Estilos.tela}>
          <View style={[Estilos.cardPerfil, { backgroundColor: tema.modal }]}>
            {/* Avatar + informações */}
            <View
              style={[
                Estilos.perfilTopo,
                perfilEmColuna && {
                  flexDirection: "column",
                  alignItems: "flex-start",
                },
              ]}
            >
              {/* Avatar */}
              <View style={Estilos.avatarContainer}>
                {avatarPerfil ? (
                  <AvatarImagem uri={avatarPerfil.url} tamanho={90} />
                ) : (
                  <Text style={Estilos.avatarTexto}>👤</Text>
                )}
              </View>

              {/* Informações do usuário */}
              <View
                style={[
                  Estilos.informacoesPerfil,
                  perfilEmColuna && {
                    flex: 0,
                    width: "100%",
                  },
                ]}
              >
                <Text
                  style={[
                    Estilos.nomePerfil,
                    {
                      color: tema.text,
                      fontSize: 21 * escalaFonte,
                    },
                  ]}
                >
                  {carregandoPerfil ? "Carregando..." : usuario?.nome}
                </Text>

                <Text
                  style={[
                    Estilos.tipoPerfil,
                    {
                      color: tema.text,
                      fontSize: 16 * escalaFonte,
                    },
                  ]}
                >
                  {usuario?.tipo === "estudante"
                    ? "Estudante"
                    : usuario?.tipo === "professor"
                      ? "Professor"
                      : usuario?.tipo === "tutor"
                        ? "Tutor"
                        : ""}
                </Text>

                {usuario?.tipo === "estudante" && dadosAluno && (
                  <>
                    <Text
                      style={[
                        Estilos.detalhesPerfil,
                        {
                          color: tema.text,
                          fontSize: 14 * escalaFonte,
                        },
                      ]}
                    >
                      {dadosAluno.curso} • {dadosAluno.turno}
                    </Text>

                    <Text
                      style={[
                        Estilos.detalhesPerfil,
                        {
                          color: tema.text,
                          fontSize: 14 * escalaFonte,
                        },
                      ]}
                    >
                      Turma: {dadosAluno.turma}
                    </Text>
                  </>
                )}

                {usuario?.tipo === "professor" && dadosProfessor && (
                  <Text
                    style={[
                      Estilos.detalhesPerfil,
                      {
                        color: tema.text,
                        fontSize: 14 * escalaFonte,
                      },
                    ]}
                  >
                    Área: {dadosProfessor.area_atuacao || "Não informada"}
                  </Text>
                )}

                {usuario?.tipo === "tutor" && dadosTutor && (
                  <Text
                    style={[
                      Estilos.detalhesPerfil,
                      {
                        color: tema.text,
                        fontSize: 14 * escalaFonte,
                      },
                    ]}
                  >
                    Departamento: {dadosTutor.departamento || "Não informado"}
                  </Text>
                )}
              </View>
            </View>

            {/* Botão para trocar avatar */}
            <TouchableOpacity
              onPress={() => setModalAvatar(true)}
              disabled={carregandoPerfil || !usuario}
              accessibilityRole="button"
              accessibilityState={{
                disabled: carregandoPerfil || !usuario,
              }}
              style={[
                Estilos.botaoAvatar,
                {
                  backgroundColor: tema.card,
                  borderColor: tema.border,
                  opacity: carregandoPerfil || !usuario ? 0.5 : 1,
                },
              ]}
            >
              <Feather name="edit-2" size={18} color={tema.text} />

              <Text
                style={[
                  Estilos.textoBotaoAvatar,
                  {
                    color: tema.text,
                    fontSize: 15 * escalaFonte,
                  },
                ]}
              >
                Alterar avatar
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[Estilos.cardConta, { backgroundColor: tema.modal }]}>
            <Text
              style={[
                Estilos.tituloConta,
                {
                  color: tema.text,
                  fontSize: 20 * escalaFonte,
                },
              ]}
            >
              Conta
            </Text>

            {/* E-mail */}
            <View style={Estilos.informacaoConta}>
              <View style={Estilos.iconeConta}>
                <Feather name="mail" size={21} color={tema.text} />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    Estilos.labelConta,
                    {
                      color: tema.text,
                      fontSize: 14 * escalaFonte,
                    },
                  ]}
                >
                  E-mail
                </Text>

                <Text
                  style={[
                    Estilos.valorConta,
                    {
                      color: tema.text,
                      fontSize: 16 * escalaFonte,
                    },
                  ]}
                >
                  {usuario?.email || "Carregando..."}
                </Text>
              </View>
            </View>

            {/* Senha */}
            <View style={Estilos.informacaoConta}>
              <View style={Estilos.iconeConta}>
                <Feather name="lock" size={21} color={tema.text} />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    Estilos.labelConta,
                    {
                      color: tema.text,
                      fontSize: 14 * escalaFonte,
                    },
                  ]}
                >
                  Senha
                </Text>

                <Text
                  style={[
                    Estilos.valorConta,
                    {
                      color: tema.text,
                      fontSize: 16 * escalaFonte,
                    },
                  ]}
                >
                  ••••••••
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                Estilos.botaoAlterarSenha,
                {
                  backgroundColor: tema.card,
                  borderColor: tema.border,
                },
              ]}
              onPress={() => setModalAlterarSenha(true)}
            >
              <Feather name="edit-2" size={18} color={tema.text} />

              <Text
                style={[
                  Estilos.textoAlterarSenha,
                  {
                    color: tema.text,
                    fontSize: 15 * escalaFonte,
                  },
                ]}
              >
                Alterar senha
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[Estilos.cardTutorial, { backgroundColor: tema.modal }]}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Feather name="play-circle" size={26} color="#4CAF50" />

              <Text
                style={[
                  Estilos.texto,
                  {
                    color: tema.text,
                    fontSize: 18 * escalaFonte,
                    flexShrink: 1,
                  },
                ]}
              >
                Vídeo Tutorial
              </Text>
            </View>
          </TouchableOpacity>

          <View style={[Estilos.cardConfig, { backgroundColor: tema.modal }]}>
            <View style={{ width: "100%" }}>
              <Text
                style={{
                  color: tema.text,
                  fontSize: 20 * escalaFonte,
                  marginBottom: 10,
                  textAlign: "center",
                }}
              >
                Tema do aplicativo
              </Text>

              <View style={Estilos.botoesTema}>
                <TouchableOpacity
                  onPress={() => selecionarTema("claro")}
                  style={[
                    Estilos.botaoTema,
                    {
                      backgroundColor:
                        tipoTema === "claro" ? "#94C0DF" : tema.card,
                      borderColor: tema.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: tema.text,
                      fontSize: 14 * escalaFonte,
                    }}
                  >
                    ☀️ Claro
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => selecionarTema("escuro")}
                  style={[
                    Estilos.botaoTema,
                    {
                      backgroundColor:
                        tipoTema === "escuro" ? "#94C0DF" : tema.card,
                      borderColor: tema.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: tema.text,
                      fontSize: 14 * escalaFonte,
                    }}
                  >
                    🌙 Escuro
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => selecionarTema("forte")}
                  style={[
                    Estilos.botaoTema,
                    {
                      backgroundColor:
                        tipoTema === "forte" ? "#FF6B00" : tema.card,
                      borderColor: tema.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: tema.text,
                      fontSize: 14 * escalaFonte,
                    }}
                  >
                    🌈 Forte
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                Estilos.cardOpcoes,
                {
                  backgroundColor: tema.card,
                },
              ]}
              onPress={() => setModalTamanhoFonte(true)}
            >
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={[
                    Estilos.texto,
                    {
                      color: tema.text,
                      fontSize: 18 * escalaFonte,
                    },
                  ]}
                >
                  🔤 Tamanho da letra
                </Text>

                <Text
                  style={{
                    color: tema.text,
                    fontSize: 14 * escalaFonte,
                    marginTop: 5,
                    textAlign: "center",
                  }}
                >
                  Atual: {tamanhoFonte}
                </Text>
              </View>

              <Feather name="chevron-right" size={24} color={tema.text} />
            </TouchableOpacity>

            {usuario?.tipo === "estudante" && (
              <TouchableOpacity
                style={[
                  Estilos.cardOpcoes,
                  {
                    backgroundColor: tema.card,
                    opacity: carregandoLimpeza || salvandoLimpeza ? 0.5 : 1,
                  },
                ]}
                disabled={carregandoLimpeza || salvandoLimpeza}
                accessibilityRole="button"
                accessibilityLabel="Configurar limpeza de tarefas concluídas"
                onPress={() => {
                  if (erroLimpeza) {
                    void carregarPreferenciaLimpeza(usuario.id);
                    return;
                  }

                  setModalLimpeza(true);
                }}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      color: tema.text,
                      fontSize: 18 * escalaFonte,
                      fontWeight: "600",
                    }}
                  >
                    Limpeza de tarefas concluídas
                  </Text>

                  <Text
                    style={{
                      color: tema.text,
                      fontSize: 14 * escalaFonte,
                      marginTop: 6,
                    }}
                  >
                    {carregandoLimpeza
                      ? "Carregando..."
                      : erroLimpeza
                        ? "Não foi possível carregar. Toque para tentar novamente."
                        : prazoLimpeza
                          ? `Excluir após ${labelPrazoLimpeza} da conclusão`
                          : "Escolha quando excluir automaticamente"}
                  </Text>
                </View>

                <Feather name="chevron-right" size={24} color={tema.text} />
              </TouchableOpacity>
            )}

            <View
              style={[Estilos.cardNotiChat, { backgroundColor: tema.card }]}
            >
              <Text
                style={[
                  Estilos.texto,
                  { color: tema.text, fontSize: 16 * escalaFonte, flex: 1 },
                ]}
              >
                Notificações de Chat
              </Text>

              <Switch
                value={chatAtivo}
                onValueChange={(valor) => alterarNotificacao("chat", valor)}
                disabled={!usuario || salvandoNotificacao}
                accessibilityLabel="Notificações de Chat"
              />
            </View>

            <View
              style={[Estilos.cardLembrete, { backgroundColor: tema.card }]}
            >
              <Text
                style={[
                  Estilos.texto,
                  { color: tema.text, fontSize: 16 * escalaFonte, flex: 1 },
                ]}
              >
                Lembretes de Tarefas
              </Text>

              <Switch
                value={tarefasAtivas}
                onValueChange={(valor) => alterarNotificacao("tarefas", valor)}
                disabled={!usuario || salvandoNotificacao}
                accessibilityLabel="Lembretes de Tarefas"
              />
            </View>
          </View>
          <TouchableOpacity style={Estilos.botaoSair} onPress={sairDaConta}>
            <Text
              style={[Estilos.textoBotaoSair, { fontSize: 16 * escalaFonte }]}
            >
              Sair da conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {usuario && (
        <SeletorAvatar
          visivel={modalAvatar}
          avatarAtual={usuario.avatar}
          aoFechar={() => setModalAvatar(false)}
          aoSalvar={salvarAvatar}
        />
      )}
      <Modal
        visible={modalTamanhoFonte}
        transparent
        animationType="fade"
        onRequestClose={() => setModalTamanhoFonte(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              width: "85%",
              padding: 20,
              borderRadius: 15,
              backgroundColor: tema.modal,
            }}
          >
            <Text
              style={{
                color: tema.text,
                fontSize: 22 * escalaFonte,
                fontWeight: "bold",
                marginBottom: 20,
              }}
            >
              Tamanho da letra
            </Text>

            <TouchableOpacity
              onPress={() => {
                selecionarTamanhoFonte("pequeno");
                setModalTamanhoFonte(false);
              }}
              style={{
                padding: 15,
                borderRadius: 10,
                marginBottom: 10,
                backgroundColor:
                  tamanhoFonte === "pequeno" ? "#94C0DF" : tema.card,
                borderWidth: 1,
                borderColor: tema.border,
              }}
            >
              <Text
                style={{
                  color: tema.text,
                  fontSize: 14 * escalaFonte,
                }}
              >
                A — Pequeno
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                selecionarTamanhoFonte("normal");
                setModalTamanhoFonte(false);
              }}
              style={{
                padding: 15,
                borderRadius: 10,
                marginBottom: 10,
                backgroundColor:
                  tamanhoFonte === "normal" ? "#94C0DF" : tema.card,
                borderWidth: 1,
                borderColor: tema.border,
              }}
            >
              <Text
                style={{
                  color: tema.text,
                  fontSize: 16 * escalaFonte,
                }}
              >
                A — Normal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                selecionarTamanhoFonte("grande");
                setModalTamanhoFonte(false);
              }}
              style={{
                padding: 15,
                borderRadius: 10,
                marginBottom: 10,
                backgroundColor:
                  tamanhoFonte === "grande" ? "#94C0DF" : tema.card,
                borderWidth: 1,
                borderColor: tema.border,
              }}
            >
              <Text
                style={{
                  color: tema.text,
                  fontSize: 18 * escalaFonte,
                }}
              >
                A — Grande
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                selecionarTamanhoFonte("muitoGrande");
                setModalTamanhoFonte(false);
              }}
              style={{
                padding: 15,
                borderRadius: 10,
                marginBottom: 10,
                backgroundColor:
                  tamanhoFonte === "muitoGrande" ? "#94C0DF" : tema.card,
                borderWidth: 1,
                borderColor: tema.border,
              }}
            >
              <Text
                style={{
                  color: tema.text,
                  fontSize: 20 * escalaFonte,
                }}
              >
                A — Muito grande
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalTamanhoFonte(false)}
              style={{
                padding: 15,
                borderRadius: 10,
                marginTop: 5,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: tema.text,
                  fontSize: 16 * escalaFonte,
                  fontWeight: "bold",
                }}
              >
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        visible={modalAlterarSenha}
        transparent
        animationType="fade"
        onRequestClose={() => setModalAlterarSenha(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={Estilos.fundoModal}
        >
          <ScrollView
            style={[
              Estilos.modalSenha,
              { backgroundColor: tema.modal, flexGrow: 0 },
            ]}
            contentContainerStyle={{ padding: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={[
                Estilos.tituloModalSenha,
                {
                  color: tema.text,
                  fontSize: 21 * escalaFonte,
                },
              ]}
            >
              Alterar senha
            </Text>

            <Text
              style={[
                Estilos.textoModalSenha,
                {
                  color: tema.text,
                  fontSize: 14 * escalaFonte,
                },
              ]}
            >
              Digite e confirme sua nova senha.
            </Text>

            <TextInput
              placeholder="Nova senha"
              placeholderTextColor="#888"
              secureTextEntry
              value={novaSenha}
              onChangeText={setNovaSenha}
              style={[
                Estilos.inputSenha,
                {
                  backgroundColor: tema.card,
                  borderColor: tema.border,
                  color: tema.text,
                  fontSize: 16 * escalaFonte,
                },
              ]}
            />

            <TextInput
              placeholder="Confirmar nova senha"
              placeholderTextColor="#888"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              style={[
                Estilos.inputSenha,
                {
                  backgroundColor: tema.card,
                  borderColor: tema.border,
                  color: tema.text,
                  fontSize: 16 * escalaFonte,
                },
              ]}
            />

            <TouchableOpacity
              style={Estilos.botaoConfirmarSenha}
              onPress={alterarSenha}
              disabled={alterandoSenha}
            >
              <Text
                style={[
                  Estilos.textoConfirmarSenha,
                  {
                    fontSize: 16 * escalaFonte,
                  },
                ]}
              >
                {alterandoSenha ? "Alterando..." : "Salvar nova senha"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={Estilos.botaoCancelarSenha}
              onPress={() => {
                setNovaSenha("");
                setConfirmarSenha("");
                setModalAlterarSenha(false);
              }}
              disabled={alterandoSenha}
            >
              <Text
                style={{
                  color: tema.text,
                  fontSize: 15 * escalaFonte,
                }}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        visible={modalLimpeza && usuario?.tipo === "estudante"}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!salvandoLimpeza) setModalLimpeza(false);
        }}
      >
        <View style={Estilos.fundoModal}>
          <ScrollView
            style={{
              width: "92%",
              maxWidth: 520,
              maxHeight: "85%",
              flexGrow: 0,
              borderRadius: 15,
              backgroundColor: tema.modal,
            }}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={{
                color: tema.text,
                fontSize: 21 * escalaFonte,
                fontWeight: "bold",
                marginBottom: 10,
              }}
            >
              Limpeza de tarefas concluídas
            </Text>

            <Text
              style={{
                color: tema.text,
                fontSize: 14 * escalaFonte,
                marginBottom: 18,
              }}
            >
              Cada tarefa será excluída automaticamente após o prazo escolhido,
              contado a partir da sua conclusão. A exclusão é permanente. Ao
              mudar o prazo, ele também será aplicado às tarefas já concluídas.
            </Text>

            {OPCOES_LIMPEZA.map((opcao) => {
              const selecionada = prazoLimpeza === opcao.meses;

              return (
                <TouchableOpacity
                  key={opcao.meses}
                  disabled={salvandoLimpeza}
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected: selecionada,
                    disabled: salvandoLimpeza,
                  }}
                  onPress={() => salvarPrazoLimpeza(opcao.meses)}
                  style={{
                    minHeight: 48,
                    padding: 15,
                    marginBottom: 10,
                    borderRadius: 10,
                    borderWidth: selecionada ? 2 : 1,
                    borderColor: tema.text,
                    backgroundColor: tema.card,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    opacity: salvandoLimpeza ? 0.5 : 1,
                  }}
                >
                  <Text
                    style={{
                      flex: 1,
                      flexShrink: 1,
                      color: tema.text,
                      fontSize: 16 * escalaFonte,
                      fontWeight: selecionada ? "bold" : "normal",
                    }}
                  >
                    Após {opcao.label}
                  </Text>

                  {selecionada && (
                    <Feather name="check" size={22} color={tema.text} />
                  )}
                </TouchableOpacity>
              );
            })}

            {salvandoLimpeza && (
              <Text
                accessibilityLiveRegion="polite"
                style={{
                  color: tema.text,
                  fontSize: 14 * escalaFonte,
                  textAlign: "center",
                  marginTop: 5,
                }}
              >
                Salvando...
              </Text>
            )}

            <TouchableOpacity
              disabled={salvandoLimpeza}
              onPress={() => setModalLimpeza(false)}
              style={Estilos.botaoCancelarSenha}
            >
              <Text
                style={{
                  color: tema.text,
                  fontSize: 16 * escalaFonte,
                  fontWeight: "bold",
                }}
              >
                Fechar
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
