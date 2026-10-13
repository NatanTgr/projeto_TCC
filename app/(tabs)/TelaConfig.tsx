import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Switch,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";

import { useTheme } from "../../context/ThemeContext";
import { useFontSize } from "../../context/FontSizeContext";
import criarEstilos from "../../Estilos/TelaConfigEstilo";

import { testarSupabase } from "../../bd/testeSupabase";
import { supabase } from "../../bd/supabase";

import AvatarImagem from "../../components/AvatarImagem";
import SeletorAvatar from "../../components/SeletorAvatar";
import { AVATARES, buscarAvatar } from "../../components/avatares";
import BotaoAlerta from "../../components/BotaoAlerta";
import { removerPushChatDesteAparelho } from "../../components/notificacoesChat";

type PrazoLimpeza = 3 | 6 | 12;

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

const OPCOES_LIMPEZA: {
  meses: PrazoLimpeza;
  label: string;
}[] = [
  { meses: 3, label: "3 meses" },
  { meses: 6, label: "6 meses" },
  { meses: 12, label: "1 ano" },
];

const OPCOES_TAMANHO = [
  { valor: "pequeno", label: "A — Pequeno" },
  { valor: "normal", label: "A — Normal" },
  { valor: "grande", label: "A — Grande" },
  { valor: "muitoGrande", label: "A — Muito grande" },
] as const;

export default function TelaConfig() {
  const { tipoTema, selecionarTema, tema } = useTheme();
  const {
    tamanhoFonte,
    escalaFonte,
    selecionarTamanhoFonte,
  } = useFontSize();

  const { width, fontScale } = useWindowDimensions();

  const Estilos = criarEstilos(tema, escalaFonte);
  const perfilEmColuna =
    width < 380 || escalaFonte * fontScale >= 1.2;

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [dadosAluno, setDadosAluno] = useState<DadosAluno | null>(null);
  const [dadosProfessor, setDadosProfessor] =
    useState<DadosProfessor | null>(null);
  const [dadosTutor, setDadosTutor] = useState<DadosTutor | null>(null);

  const [carregandoPerfil, setCarregandoPerfil] = useState(true);

  const [chatAtivo, setChatAtivo] = useState(true);
  const [tarefasAtivas, setTarefasAtivas] = useState(true);
  const [salvandoNotificacao, setSalvandoNotificacao] = useState(false);

  const [prazoLimpeza, setPrazoLimpeza] =
    useState<PrazoLimpeza | null>(null);
  const [modalLimpeza, setModalLimpeza] = useState(false);
  const [salvandoLimpeza, setSalvandoLimpeza] = useState(false);
  const [carregandoLimpeza, setCarregandoLimpeza] = useState(true);
  const [erroLimpeza, setErroLimpeza] = useState(false);

  const [modalTamanhoFonte, setModalTamanhoFonte] = useState(false);
  const [modalAlterarSenha, setModalAlterarSenha] = useState(false);
  const [modalAvatar, setModalAvatar] = useState(false);

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [alterandoSenha, setAlterandoSenha] = useState(false);

  const avatarPerfil = buscarAvatar(usuario?.avatar);

  const labelPrazoLimpeza =
    OPCOES_LIMPEZA.find(
      (opcao) => opcao.meses === prazoLimpeza,
    )?.label ?? "Não configurada";

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
    if (usuario?.tipo !== "estudante" || salvandoLimpeza) {
      return;
    }

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
      Alert.alert(
        "Erro",
        "Não foi possível salvar o prazo de limpeza.",
      );
    } finally {
      setSalvandoLimpeza(false);
    }
  }

  async function alterarNotificacao(
    tipo: "chat" | "tarefas",
    ativa: boolean,
  ) {
    if (!usuario || salvandoNotificacao) return;

    try {
      setSalvandoNotificacao(true);

      const { data, error } = await supabase
        .from("preferencias_notificacoes")
        .upsert(
          {
            usuario_id: usuario.id,
            chat_ativo: tipo === "chat" ? ativa : chatAtivo,
            tarefas_ativas:
              tipo === "tarefas" ? ativa : tarefasAtivas,
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
      Alert.alert(
        "Erro",
        "Não foi possível salvar esta configuração.",
      );
    } finally {
      setSalvandoNotificacao(false);
    }
  }

  const sairDaConta = async () => {
    try {
      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario || !user) {
        throw erroUsuario ?? new Error("Usuário não autenticado.");
      }

      // Mantém a sessão ativa durante a exclusão do token
      // para que a política RLS permita a operação.
      await removerPushChatDesteAparelho(user.id);

      const { error: erroSaida } = await supabase.auth.signOut({
        scope: "local",
      });

      if (erroSaida) throw erroSaida;

      router.replace("/login");
    } catch (erro) {
      console.error("Erro ao sair da conta:", erro);

      const detalhe =
        typeof erro === "object" &&
        erro !== null &&
        "message" in erro
          ? String(erro.message)
          : "Erro sem detalhes disponíveis.";

      Alert.alert(
        "Não foi possível sair",
        `Tente novamente.\n\nDetalhe: ${detalhe}`,
      );
    }
  };

  async function salvarAvatar(url: string | null) {
    if (!usuario) {
      throw new Error("Perfil inválido.");
    }

    if (
      url !== null &&
      !AVATARES.some((avatar) => avatar.url === url)
    ) {
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
      .update({ avatar: url })
      .eq("id", user.id)
      .select("id, avatar")
      .single();

    if (
      error ||
      !data ||
      data.id !== user.id ||
      data.avatar !== url
    ) {
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

      const { data: dadosUsuario, error: erroUsuario } =
        await supabase
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

      const {
        data: preferencias,
        error: erroPreferencias,
      } = await supabase
        .from("preferencias_notificacoes")
        .select("chat_ativo, tarefas_ativas")
        .eq("usuario_id", user.id)
        .maybeSingle();

      if (erroPreferencias) throw erroPreferencias;

      setChatAtivo(preferencias?.chat_ativo ?? true);
      setTarefasAtivas(preferencias?.tarefas_ativas ?? true);

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
      Alert.alert(
        "Atenção",
        "A senha deve ter pelo menos 6 caracteres.",
      );
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
      style={Estilos.container}
    >
      <View style={Estilos.header}>
        <View style={Estilos.topRow}>
          <Text style={Estilos.headerTitle}>
            Configurações
          </Text>

          {usuario?.tipo === "estudante" && <BotaoAlerta />}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={Estilos.tela}>
          <View style={Estilos.cardPerfil}>
            <View
              style={[
                Estilos.perfilTopo,
                perfilEmColuna && Estilos.perfilTopoEmColuna,
              ]}
            >
              <View style={Estilos.avatarContainer}>
                {avatarPerfil ? (
                  <AvatarImagem
                    uri={avatarPerfil.url}
                    tamanho={90}
                  />
                ) : (
                  <Text style={Estilos.avatarTexto}>👤</Text>
                )}
              </View>

              <View
                style={[
                  Estilos.informacoesPerfil,
                  perfilEmColuna &&
                    Estilos.informacoesPerfilEmColuna,
                ]}
              >
                <Text style={Estilos.nomePerfil}>
                  {carregandoPerfil
                    ? "Carregando..."
                    : usuario?.nome}
                </Text>

                <Text style={Estilos.tipoPerfil}>
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
                    <Text style={Estilos.detalhesPerfil}>
                      {dadosAluno.curso} • {dadosAluno.turno}
                    </Text>

                    <Text style={Estilos.detalhesPerfil}>
                      Turma: {dadosAluno.turma}
                    </Text>
                  </>
                )}

                {usuario?.tipo === "professor" &&
                  dadosProfessor && (
                    <Text style={Estilos.detalhesPerfil}>
                      Área:{" "}
                      {dadosProfessor.area_atuacao ||
                        "Não informada"}
                    </Text>
                  )}

                {usuario?.tipo === "tutor" && dadosTutor && (
                  <Text style={Estilos.detalhesPerfil}>
                    Departamento:{" "}
                    {dadosTutor.departamento ||
                      "Não informado"}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setModalAvatar(true)}
              disabled={carregandoPerfil || !usuario}
              accessibilityRole="button"
              accessibilityState={{
                disabled: carregandoPerfil || !usuario,
              }}
              style={[
                Estilos.botaoAvatar,
                (carregandoPerfil || !usuario) &&
                  Estilos.desabilitado,
              ]}
            >
              <Feather
                name="edit-2"
                size={18}
                color={tema.text}
              />

              <Text style={Estilos.textoBotaoAvatar}>
                Alterar avatar
              </Text>
            </TouchableOpacity>
          </View>

          <View style={Estilos.cardConta}>
            <Text style={Estilos.tituloConta}>Conta</Text>

            <View style={Estilos.informacaoConta}>
              <View style={Estilos.iconeConta}>
                <Feather
                  name="mail"
                  size={21}
                  color={tema.text}
                />
              </View>

              <View style={Estilos.conteudoConta}>
                <Text style={Estilos.labelConta}>E-mail</Text>

                <Text style={Estilos.valorConta}>
                  {usuario?.email || "Carregando..."}
                </Text>
              </View>
            </View>

            <View style={Estilos.informacaoConta}>
              <View style={Estilos.iconeConta}>
                <Feather
                  name="lock"
                  size={21}
                  color={tema.text}
                />
              </View>

              <View style={Estilos.conteudoConta}>
                <Text style={Estilos.labelConta}>Senha</Text>
                <Text style={Estilos.valorConta}>
                  ••••••••
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={Estilos.botaoAlterarSenha}
              onPress={() => setModalAlterarSenha(true)}
            >
              <Feather
                name="edit-2"
                size={18}
                color={tema.text}
              />

              <Text style={Estilos.textoAlterarSenha}>
                Alterar senha
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={Estilos.cardTutorial}>
            <View style={Estilos.conteudoTutorial}>
              <Feather
                name="play-circle"
                size={26}
                color="#4CAF50"
              />

              <Text style={Estilos.textoTutorial}>
                Vídeo Tutorial
              </Text>
            </View>
          </TouchableOpacity>

          <View style={Estilos.cardConfig}>
            <View style={Estilos.secaoTema}>
              <Text style={Estilos.tituloTema}>
                Tema do aplicativo
              </Text>

              <View style={Estilos.botoesTema}>
                <TouchableOpacity
                  onPress={() => selecionarTema("claro")}
                  style={[
                    Estilos.botaoTema,
                    tipoTema === "claro" &&
                      Estilos.botaoTemaSelecionado,
                  ]}
                >
                  <Text style={Estilos.textoBotaoTema}>
                    ☀️ Claro
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => selecionarTema("escuro")}
                  style={[
                    Estilos.botaoTema,
                    tipoTema === "escuro" &&
                      Estilos.botaoTemaSelecionado,
                  ]}
                >
                  <Text style={Estilos.textoBotaoTema}>
                    🌙 Escuro
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => selecionarTema("forte")}
                  style={[
                    Estilos.botaoTema,
                    tipoTema === "forte" &&
                      Estilos.botaoTemaForteSelecionado,
                  ]}
                >
                  <Text style={Estilos.textoBotaoTema}>
                    🌈 Forte
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={Estilos.cardOpcoes}
              onPress={() => setModalTamanhoFonte(true)}
            >
              <View style={Estilos.conteudoOpcao}>
                <Text style={Estilos.tituloOpcao}>
                  🔤 Tamanho da letra
                </Text>

                <Text style={Estilos.textoTamanhoAtual}>
                  Atual: {tamanhoFonte}
                </Text>
              </View>

              <Feather
                name="chevron-right"
                size={24}
                color={tema.text}
              />
            </TouchableOpacity>

            {usuario?.tipo === "estudante" && (
              <TouchableOpacity
                style={[
                  Estilos.cardOpcoes,
                  (carregandoLimpeza || salvandoLimpeza) &&
                    Estilos.desabilitado,
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
                <View style={Estilos.conteudoOpcao}>
                  <Text style={Estilos.tituloOpcao}>
                    Limpeza de tarefas concluídas
                  </Text>

                  <Text style={Estilos.textoResumoLimpeza}>
                    {carregandoLimpeza
                      ? "Carregando..."
                      : erroLimpeza
                        ? "Não foi possível carregar. Toque para tentar novamente."
                        : prazoLimpeza
                          ? `Excluir após ${labelPrazoLimpeza} da conclusão`
                          : "Escolha quando excluir automaticamente"}
                  </Text>
                </View>

                <Feather
                  name="chevron-right"
                  size={24}
                  color={tema.text}
                />
              </TouchableOpacity>
            )}

            <View style={Estilos.cardNotiChat}>
              <Text style={Estilos.textoNotificacao}>
                Notificações de Chat
              </Text>

              <Switch
                value={chatAtivo}
                onValueChange={(valor) =>
                  alterarNotificacao("chat", valor)
                }
                disabled={!usuario || salvandoNotificacao}
                accessibilityLabel="Notificações de Chat"
              />
            </View>

            <View style={Estilos.cardLembrete}>
              <Text style={Estilos.textoNotificacao}>
                Lembretes de Tarefas
              </Text>

              <Switch
                value={tarefasAtivas}
                onValueChange={(valor) =>
                  alterarNotificacao("tarefas", valor)
                }
                disabled={!usuario || salvandoNotificacao}
                accessibilityLabel="Lembretes de Tarefas"
              />
            </View>
          </View>

          <TouchableOpacity
            style={Estilos.botaoSair}
            onPress={sairDaConta}
          >
            <Text style={Estilos.textoBotaoSair}>
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
        <View style={Estilos.fundoModal}>
          <View style={Estilos.modalTamanhoFonte}>
            <Text style={Estilos.tituloModalFonte}>
              Tamanho da letra
            </Text>

            {OPCOES_TAMANHO.map((opcao) => (
              <TouchableOpacity
                key={opcao.valor}
                onPress={() => {
                  selecionarTamanhoFonte(opcao.valor);
                  setModalTamanhoFonte(false);
                }}
                style={[
                  Estilos.opcaoTamanhoFonte,
                  tamanhoFonte === opcao.valor &&
                    Estilos.opcaoTamanhoSelecionada,
                ]}
              >
                <Text
                  style={[
                    Estilos.textoOpcaoTamanho,
                    Estilos[opcao.valor],
                  ]}
                >
                  {opcao.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setModalTamanhoFonte(false)}
              style={Estilos.botaoFecharFonte}
            >
              <Text style={Estilos.textoFechar}>
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
            style={Estilos.modalSenha}
            contentContainerStyle={Estilos.conteudoModal}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={Estilos.tituloModalSenha}>
              Alterar senha
            </Text>

            <Text style={Estilos.textoModalSenha}>
              Digite e confirme sua nova senha.
            </Text>

            <TextInput
              placeholder="Nova senha"
              placeholderTextColor="#888"
              secureTextEntry
              value={novaSenha}
              onChangeText={setNovaSenha}
              style={Estilos.inputSenha}
            />

            <TextInput
              placeholder="Confirmar nova senha"
              placeholderTextColor="#888"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              style={Estilos.inputSenha}
            />

            <TouchableOpacity
              style={Estilos.botaoConfirmarSenha}
              onPress={alterarSenha}
              disabled={alterandoSenha}
            >
              <Text style={Estilos.textoConfirmarSenha}>
                {alterandoSenha
                  ? "Alterando..."
                  : "Salvar nova senha"}
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
              <Text style={Estilos.textoCancelarSenha}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={
          modalLimpeza && usuario?.tipo === "estudante"
        }
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!salvandoLimpeza) {
            setModalLimpeza(false);
          }
        }}
      >
        <View style={Estilos.fundoModal}>
          <ScrollView
            style={Estilos.modalLimpeza}
            contentContainerStyle={Estilos.conteudoModal}
            showsVerticalScrollIndicator={false}
          >
            <Text style={Estilos.tituloModalLimpeza}>
              Limpeza de tarefas concluídas
            </Text>

            <Text style={Estilos.textoModalLimpeza}>
              Cada tarefa será excluída automaticamente após o
              prazo escolhido, contado a partir da sua conclusão.
              A exclusão é permanente. Ao mudar o prazo, ele também
              será aplicado às tarefas já concluídas.
            </Text>

            {OPCOES_LIMPEZA.map((opcao) => {
              const selecionada =
                prazoLimpeza === opcao.meses;

              return (
                <TouchableOpacity
                  key={opcao.meses}
                  disabled={salvandoLimpeza}
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected: selecionada,
                    disabled: salvandoLimpeza,
                  }}
                  onPress={() =>
                    salvarPrazoLimpeza(opcao.meses)
                  }
                  style={[
                    Estilos.opcaoLimpeza,
                    selecionada &&
                      Estilos.opcaoLimpezaSelecionada,
                    salvandoLimpeza && Estilos.desabilitado,
                  ]}
                >
                  <Text style={Estilos.textoOpcaoLimpeza}>
                    Após {opcao.label}
                  </Text>

                  {selecionada && (
                    <Feather
                      name="check"
                      size={22}
                      color={tema.text}
                    />
                  )}
                </TouchableOpacity>
              );
            })}

            {salvandoLimpeza && (
              <Text
                accessibilityLiveRegion="polite"
                style={Estilos.textoSalvando}
              >
                Salvando...
              </Text>
            )}

            <TouchableOpacity
              disabled={salvandoLimpeza}
              onPress={() => setModalLimpeza(false)}
              style={Estilos.botaoCancelarSenha}
            >
              <Text style={Estilos.textoFechar}>
                Fechar
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}