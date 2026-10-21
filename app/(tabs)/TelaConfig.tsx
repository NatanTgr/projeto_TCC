
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
  Linking,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect, useState, useRef } from "react";
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
  tipo: "estudante" | "professor" | "tutor" | "napne";
  estado: string | null;
  avatar: string | null;
};

type DadosAluno = {
  curso: string;
  turno: string;
  turma: string;
  escolaridade: string;
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

// VÍDEOS TUTORIAIS POR TIPO DE USUÁRIO
// Substitua os valores null pelos links dos vídeos.

type TipoUsuario = Usuario["tipo"];

type VideoTutorial = {
  id: string;
  titulo: string;
  descricao: string;
  icone: keyof typeof Feather.glyphMap;
  url: string | null;
};

const TUTORIAIS: Record<TipoUsuario, VideoTutorial[]> = {
  estudante: [
    {
      id: "calendario",
      titulo: "Calendário",
      descricao: "Consultar datas, eventos e avaliações.",
      icone: "calendar",
      url: null,
    },
    {
      id: "tarefas",
      titulo: "Tarefas",
      descricao: "Criar, acompanhar e concluir tarefas.",
      icone: "check-square",
      url: null,
    },
    {
      id: "chat",
      titulo: "Chat",
      descricao: "Conversar com professoras/professores e tutoras/tutores.",
      icone: "message-circle",
      url: null,
    },
    {
      id: "alerta",
      titulo: "Botão de alerta",
      descricao: "Aprender a solicitar ajuda.",
      icone: "alert-circle",
      url: null,
    },
    {
      id: "configuracoes",
      titulo: "Configurações",
      descricao: "Personalizar aparência, notificações e conta.",
      icone: "settings",
      url: null,
    },
  ],

  professor: [
    {
      id: "chat-professor",
      titulo: "Chat",
      descricao: "Conversar com estudantes e tutoras/tutores.",
      icone: "message-circle",
      url: null,
    },
    {
      id: "config-professor",
      titulo: "Configurações",
      descricao: "Ajustar perfil e preferências do aplicativo.",
      icone: "settings",
      url: null,
    },
  ],

  tutor: [
    {
      id: "chat-tutor",
      titulo: "Chat",
      descricao: "Conversar com estudantes e professoras/professores.",
      icone: "message-circle",
      url: null,
    },
    {
      id: "tarefas-tutor",
      titulo: "Tarefas",
      descricao: "Cadastrar, editar e acompanhar tarefas dos estudantes.",
      icone: "clipboard",
      url: null,
    },
    {
      id: "config-tutor",
      titulo: "Configurações",
      descricao: "Ajustar perfil e preferências do aplicativo.",
      icone: "settings",
      url: null,
    },
  ],

  napne: [
    {
      id: "chat-napne",
      titulo: "Chat",
      descricao: "Aprender a usar as conversas do aplicativo.",
      icone: "message-circle",
      url: null,
    },
    {
      id: "tarefas-napne",
      titulo: "Tarefas",
      descricao: "Cadastrar, editar e acompanhar tarefas dos estudantes.",
      icone: "clipboard",
      url: null,
    },
    {
      id: "config-napne",
      titulo: "Configurações",
      descricao: "Ajustar perfil e preferências do aplicativo.",
      icone: "settings",
      url: null,
    },
  ],
};

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

  // PERFIL

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [dadosAluno, setDadosAluno] = useState<DadosAluno | null>(null);

  const [dadosProfessor, setDadosProfessor] =
    useState<DadosProfessor | null>(null);

  const [dadosTutor, setDadosTutor] =
    useState<DadosTutor | null>(null);

  const [carregandoPerfil, setCarregandoPerfil] = useState(true);

  // NOTIFICAÇÕES

  const [chatAtivo, setChatAtivo] = useState(true);
  const [tarefasAtivas, setTarefasAtivas] = useState(true);
  const [salvandoNotificacao, setSalvandoNotificacao] = useState(false);

  const preferenciasNotificacoesRef = useRef({
    chat_ativo: true,
    tarefas_ativas: true,
  });

  const salvandoNotificacaoRef = useRef(false);

  // LIMPEZA DE TAREFAS

  const [prazoLimpeza, setPrazoLimpeza] =
    useState<PrazoLimpeza | null>(null);

  const [modalLimpeza, setModalLimpeza] = useState(false);
  const [salvandoLimpeza, setSalvandoLimpeza] = useState(false);
  const [carregandoLimpeza, setCarregandoLimpeza] = useState(true);
  const [erroLimpeza, setErroLimpeza] = useState(false);

  // MODAIS

  const [modalTamanhoFonte, setModalTamanhoFonte] = useState(false);
  const [modalAlterarSenha, setModalAlterarSenha] = useState(false);
  const [modalAvatar, setModalAvatar] = useState(false);
  const [modalTutoriais, setModalTutoriais] = useState(false);

  // ALTERAR TURMA

  const [modalAlterarTurma, setModalAlterarTurma] = useState(false);
  const [novaTurma, setNovaTurma] = useState("");
  const [salvandoTurma, setSalvandoTurma] = useState(false);

  // ALTERAR ÁREA OU DEPARTAMENTO

  const [modalDadosProfissionais, setModalDadosProfissionais] =
    useState(false);

  const [novoDadoProfissional, setNovoDadoProfissional] =
    useState("");

  const [salvandoDadoProfissional, setSalvandoDadoProfissional] =
    useState(false);

  // ALTERAR SENHA

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [alterandoSenha, setAlterandoSenha] = useState(false);

  // PERFIS PROFISSIONAIS

  const eProfessor = usuario?.tipo === "professor";

  const eTutorOuNapne =
    usuario?.tipo === "tutor" || usuario?.tipo === "napne";

  const valorDadoProfissionalAtual = eProfessor
    ? dadosProfessor?.area_atuacao ?? ""
    : dadosTutor?.departamento ?? "";

  // TUTORIAIS

  const tutoriaisDoUsuario = usuario
    ? TUTORIAIS[usuario.tipo]
    : [];

  async function assistirTutorial(tutorial: VideoTutorial) {
    if (!tutorial.url) {
      Alert.alert(
        "Tutorial em preparação",
        `O vídeo de ${tutorial.titulo} ainda não está disponível.`,
      );
      return;
    }

    try {
      await Linking.openURL(tutorial.url);
    } catch (erro) {
      console.error("Erro ao abrir vídeo tutorial:", erro);

      Alert.alert(
        "Erro",
        "Não foi possível abrir o vídeo tutorial.",
      );
    }
  }

  const avatarPerfil = buscarAvatar(usuario?.avatar);

  const labelPrazoLimpeza =
    OPCOES_LIMPEZA.find(
      (opcao) => opcao.meses === prazoLimpeza,
    )?.label ?? "Não configurada";

  // =====================================================
  // CARREGAR PREFERÊNCIA DE LIMPEZA
  // =====================================================

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

  // =====================================================
  // SALVAR PREFERÊNCIA DE LIMPEZA
  // =====================================================

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

  // =====================================================
  // ALTERAR NOTIFICAÇÕES
  // =====================================================

  async function alterarNotificacao(
    tipo: "chat" | "tarefas",
    ativa: boolean,
  ) {
    if (!usuario || salvandoNotificacaoRef.current) return;

    salvandoNotificacaoRef.current = true;
    setSalvandoNotificacao(true);

    const preferenciasAnteriores = {
      ...preferenciasNotificacoesRef.current,
    };

    const novasPreferencias = {
      ...preferenciasAnteriores,
      chat_ativo:
        tipo === "chat"
          ? ativa
          : preferenciasAnteriores.chat_ativo,
      tarefas_ativas:
        tipo === "tarefas"
          ? ativa
          : preferenciasAnteriores.tarefas_ativas,
    };

    preferenciasNotificacoesRef.current = novasPreferencias;

    setChatAtivo(novasPreferencias.chat_ativo);
    setTarefasAtivas(novasPreferencias.tarefas_ativas);

    try {
      const { data, error } = await supabase
        .from("preferencias_notificacoes")
        .upsert(
          {
            usuario_id: usuario.id,
            ...novasPreferencias,
          },
          { onConflict: "usuario_id" },
        )
        .select("chat_ativo, tarefas_ativas")
        .single();

      if (error) throw error;

      const preferenciasConfirmadas = {
        chat_ativo: data.chat_ativo,
        tarefas_ativas: data.tarefas_ativas,
      };

      preferenciasNotificacoesRef.current =
        preferenciasConfirmadas;

      setChatAtivo(preferenciasConfirmadas.chat_ativo);
      setTarefasAtivas(preferenciasConfirmadas.tarefas_ativas);
    } catch (erro) {
      console.error("Erro ao alterar notificações:", erro);

      preferenciasNotificacoesRef.current =
        preferenciasAnteriores;

      setChatAtivo(preferenciasAnteriores.chat_ativo);
      setTarefasAtivas(preferenciasAnteriores.tarefas_ativas);

      Alert.alert(
        "Erro",
        "Não foi possível salvar esta configuração.",
      );
    } finally {
      salvandoNotificacaoRef.current = false;
      setSalvandoNotificacao(false);
    }
  }

  // =====================================================
  // SAIR DA CONTA
  // =====================================================

  const sairDaConta = async () => {
    try {
      const {
        data: { user },
        error: erroUsuario,
      } = await supabase.auth.getUser();

      if (erroUsuario || !user) {
        throw erroUsuario ?? new Error("Usuário não autenticado.");
      }

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

  // =====================================================
  // SALVAR AVATAR
  // =====================================================

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

  // =====================================================
  // CARREGAR PERFIL
  // =====================================================

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

      const preferenciasCarregadas = {
        chat_ativo: preferencias?.chat_ativo ?? true,
        tarefas_ativas: preferencias?.tarefas_ativas ?? true,
      };

      preferenciasNotificacoesRef.current =
        preferenciasCarregadas;

      setChatAtivo(preferenciasCarregadas.chat_ativo);
      setTarefasAtivas(preferenciasCarregadas.tarefas_ativas);

      if (dadosUsuario.tipo === "estudante") {
        const { data, error } = await supabase
          .from("alunos")
          .select("curso, turno, turma, escolaridade")
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

      if (
        dadosUsuario.tipo === "tutor" ||
        dadosUsuario.tipo === "napne"
      ) {
        const { data, error } = await supabase
          .from("tutores")
          .select("departamento")
          .eq("id", user.id)
          .single();

        if (error) {
          console.log(
            "Erro ao buscar departamento do tutor/NAPNE:",
            error,
          );
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

  // =====================================================
  // ALTERAR TURMA
  // =====================================================

  async function alterarTurma() {
    if (
      usuario?.tipo !== "estudante" ||
      !dadosAluno ||
      salvandoTurma
    ) {
      return;
    }

    const turmaFormatada = novaTurma.trim();

    if (!turmaFormatada) {
      Alert.alert("Atenção", "Informe sua nova turma.");
      return;
    }

    if (turmaFormatada === dadosAluno.turma) {
      Alert.alert("Atenção", "Esta já é sua turma atual.");
      return;
    }

    try {
      setSalvandoTurma(true);

      const {
        data: { user },
        error: erroAuth,
      } = await supabase.auth.getUser();

      if (erroAuth || !user || user.id !== usuario.id) {
        throw new Error("Sessão inválida. Entre novamente.");
      }

      const { data, error } = await supabase
        .from("alunos")
        .update({ turma: turmaFormatada })
        .eq("id", user.id)
        .select("turma")
        .single();

      if (error) throw error;

      if (data.turma !== turmaFormatada) {
        throw new Error("O banco não confirmou a alteração.");
      }

      setDadosAluno((dadosAtuais) =>
        dadosAtuais
          ? { ...dadosAtuais, turma: data.turma }
          : dadosAtuais,
      );

      setModalAlterarTurma(false);
      setNovaTurma("");

      Alert.alert(
        "Sucesso",
        "Sua turma foi alterada com sucesso!",
      );
    } catch (erro) {
      console.error("Erro ao alterar turma:", erro);

      Alert.alert(
        "Erro",
        "Não foi possível alterar sua turma. Tente novamente.",
      );
    } finally {
      setSalvandoTurma(false);
    }
  }

  // =====================================================
  // ALTERAR ÁREA OU DEPARTAMENTO
  // =====================================================

  async function alterarDadoProfissional() {
    if (
      !usuario ||
      !(
        (eProfessor && dadosProfessor) ||
        (eTutorOuNapne && dadosTutor)
      ) ||
      salvandoDadoProfissional
    ) {
      return;
    }

    const valorNovo = novoDadoProfissional.trim();
    const valorAtual = valorDadoProfissionalAtual.trim();

    if (!valorNovo) {
      Alert.alert(
        "Campo obrigatório",
        eProfessor
          ? "Informe sua nova área."
          : "Informe seu novo departamento.",
      );
      return;
    }

    if (valorNovo === valorAtual) {
      Alert.alert(
        "Atenção",
        "O valor informado é igual ao atual.",
      );
      return;
    }

    try {
      setSalvandoDadoProfissional(true);

      const {
        data: { user },
        error: erroAuth,
      } = await supabase.auth.getUser();

      if (erroAuth || !user || user.id !== usuario.id) {
        throw new Error("Sessão inválida. Entre novamente.");
      }

      if (eProfessor) {
        const { data, error } = await supabase
          .from("professores")
          .update({ area_atuacao: valorNovo })
          .eq("id", user.id)
          .select("area_atuacao")
          .single();

        if (error) throw error;

        if (data?.area_atuacao !== valorNovo) {
          throw new Error(
            "O banco não confirmou a alteração da área.",
          );
        }

        setDadosProfessor((atual) =>
          atual
            ? {
                ...atual,
                area_atuacao: data.area_atuacao,
              }
            : atual,
        );
      } else if (eTutorOuNapne) {
        const { data, error } = await supabase
          .from("tutores")
          .update({ departamento: valorNovo })
          .eq("id", user.id)
          .select("departamento")
          .single();

        if (error) throw error;

        if (data?.departamento !== valorNovo) {
          throw new Error(
            "O banco não confirmou a alteração do departamento.",
          );
        }

        setDadosTutor((atual) =>
          atual
            ? {
                ...atual,
                departamento: data.departamento,
              }
            : atual,
        );
      } else {
        return;
      }

      setModalDadosProfissionais(false);
      setNovoDadoProfissional("");

      Alert.alert(
        "Sucesso",
        eProfessor
          ? "Sua área foi atualizada com sucesso!"
          : "Seu departamento foi atualizado com sucesso!",
      );
    } catch (erro) {
      console.error(
        "Erro ao atualizar dado profissional:",
        erro,
      );

      Alert.alert(
        "Erro ao salvar",
        erro instanceof Error
          ? erro.message
          : "Não foi possível atualizar seus dados. Tente novamente.",
      );
    } finally {
      setSalvandoDadoProfissional(false);
    }
  }

  // =====================================================
  // ALTERAR SENHA
  // =====================================================

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

  // =====================================================
  // INICIALIZAÇÃO
  // =====================================================

  useEffect(() => {
    async function iniciarTela() {
      await testarSupabase();
      await carregarPerfil();
    }

    void iniciarTela().catch((erro) => {
      console.error(
        "Erro ao iniciar a tela de configurações:",
        erro,
      );
    });
  }, []);

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={Estilos.container}
    >
      {/* CABEÇALHO */}

      <View style={Estilos.header}>
        <View style={Estilos.topRow}>
          <Text
            style={Estilos.headerTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.55}
          >
            Configurações
          </Text>

          {usuario?.tipo === "estudante" && <BotaoAlerta />}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={Estilos.tela}>
          {/* PERFIL */}

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
                      ? "Professora/Professor"
                      : usuario?.tipo === "tutor"
                        ? "Tutora/Tutor"
                        : usuario?.tipo === "napne"
                          ? "Sala de recurso (NAPNE)"
                          : ""}
                </Text>

                {usuario?.tipo === "estudante" &&
                  dadosAluno && (
                    <>
                      <Text style={Estilos.detalhesPerfil}>
                        Curso:{" "}
                        {dadosAluno.curso || "Não informado"}
                      </Text>

                      <Text style={Estilos.detalhesPerfil}>
                        Turno:{" "}
                        {dadosAluno.turno || "Não informado"}
                      </Text>

                      <Text style={Estilos.detalhesPerfil}>
                        Turma:{" "}
                        {dadosAluno.turma || "Não informada"}
                      </Text>

                      <Text style={Estilos.detalhesPerfil}>
                        Escolaridade:{" "}
                        {dadosAluno.escolaridade ||
                          "Não informada"}
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

                {(usuario?.tipo === "tutor" ||
                  usuario?.tipo === "napne") &&
                  dadosTutor && (
                    <Text style={Estilos.detalhesPerfil}>
                      Departamento:{" "}
                      {dadosTutor.departamento ||
                        "Não informado"}
                    </Text>
                  )}
              </View>
            </View>

            {/* ALTERAR AVATAR */}

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

            {/* ALTERAR TURMA - ESTUDANTES */}

            {usuario?.tipo === "estudante" &&
              dadosAluno && (
                <TouchableOpacity
                  style={Estilos.botaoAlterarTurma}
                  onPress={() => {
                    setNovaTurma(dadosAluno.turma || "");
                    setModalAlterarTurma(true);
                  }}
                  disabled={salvandoTurma}
                  accessibilityRole="button"
                  accessibilityLabel="Alterar turma"
                >
                  <Feather
                    name="edit-2"
                    size={18}
                    color={tema.text}
                  />

                  <Text style={Estilos.textoAlterarTurma}>
                    Alterar turma
                  </Text>
                </TouchableOpacity>
              )}

            {/* ALTERAR ÁREA OU DEPARTAMENTO */}

            {(
              (eProfessor && dadosProfessor) ||
              (eTutorOuNapne && dadosTutor)
            ) ? (
              <TouchableOpacity
                style={[
                  Estilos.botaoAlterarDadosProfissionais,
                  (carregandoPerfil ||
                    salvandoDadoProfissional) &&
                    Estilos.desabilitado,
                ]}
                onPress={() => {
                  setNovoDadoProfissional(
                    valorDadoProfissionalAtual,
                  );
                  setModalDadosProfissionais(true);
                }}
                disabled={
                  carregandoPerfil ||
                  salvandoDadoProfissional
                }
                accessibilityRole="button"
                accessibilityLabel={
                  eProfessor
                    ? "Alterar área"
                    : "Alterar departamento"
                }
              >
                <Feather
                  name="edit-2"
                  size={18}
                  color={tema.text}
                />

                <Text
                  style={
                    Estilos.textoAlterarDadosProfissionais
                  }
                >
                  {eProfessor
                    ? "Alterar área"
                    : "Alterar departamento"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* CONTA */}

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

          {/* VÍDEOS TUTORIAIS */}

          <TouchableOpacity
            style={[
              Estilos.cardTutorial,
              !usuario && Estilos.desabilitado,
            ]}
            onPress={() => setModalTutoriais(true)}
            disabled={!usuario}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Escolher vídeo tutorial"
          >
            <View style={Estilos.conteudoTutorial}>
              <Feather
                name="play-circle"
                size={26}
                color="#4CAF50"
              />

              <Text style={Estilos.textoTutorial}>
                Vídeos tutoriais
              </Text>
            </View>

            <Feather
              name="chevron-right"
              size={24}
              color={tema.text}
            />
          </TouchableOpacity>

          {/* CONFIGURAÇÕES */}

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

            {/* TAMANHO DA FONTE */}

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

            {/* LIMPEZA DE TAREFAS */}

            {usuario?.tipo === "estudante" && (
              <TouchableOpacity
                style={[
                  Estilos.cardOpcoes,
                  (carregandoLimpeza || salvandoLimpeza) &&
                    Estilos.desabilitado,
                ]}
                disabled={
                  carregandoLimpeza || salvandoLimpeza
                }
                accessibilityRole="button"
                accessibilityLabel="Configurar limpeza de tarefas concluídas"
                onPress={() => {
                  if (erroLimpeza) {
                    void carregarPreferenciaLimpeza(
                      usuario.id,
                    );
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

            {/* NOTIFICAÇÕES DE CHAT - TODOS OS PERFIS */}

            <View style={Estilos.cardNotiChat}>
              <Text style={Estilos.textoNotificacao}>
                Notificações de Chat
              </Text>

              <Switch
                value={chatAtivo}
                onValueChange={(valor) =>
                  alterarNotificacao("chat", valor)
                }
                disabled={!usuario}
                trackColor={{
                  false: "#B0B0B0",
                  true: "#88C688",
                }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Notificações de Chat"
              />
            </View>

            {/* LEMBRETES DE TAREFAS - APENAS ESTUDANTES */}

            {usuario?.tipo === "estudante" && (
              <View style={Estilos.cardLembrete}>
                <Text style={Estilos.textoNotificacao}>
                  Lembretes de Tarefas
                </Text>

                <Switch
                  value={tarefasAtivas}
                  onValueChange={(valor) =>
                    alterarNotificacao("tarefas", valor)
                  }
                  disabled={!usuario}
                  trackColor={{
                    false: "#B0B0B0",
                    true: "#88C688",
                  }}
                  thumbColor="#FFFFFF"
                  accessibilityLabel="Lembretes de Tarefas"
                />
              </View>
            )}
          </View>

          {/* SOBRE O PAED */}

          <TouchableOpacity
            style={Estilos.botaoSobrePaed}
            onPress={() =>
              router.push("/(tabs)/TelaSobrePaed")
            }
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Sobre o PAED"
          >
            <Feather
              name="info"
              size={24}
              color={tema.text}
            />

            <Text style={Estilos.textoSobrePaed}>
              Sobre o PAED
            </Text>
          </TouchableOpacity>

          {/* SAIR DA CONTA */}

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

      {/* MODAL DE AVATAR */}

      {usuario && (
        <SeletorAvatar
          visivel={modalAvatar}
          avatarAtual={usuario.avatar}
          aoFechar={() => setModalAvatar(false)}
          aoSalvar={salvarAvatar}
        />
      )}

      {/* MODAL DOS VÍDEOS TUTORIAIS */}

      <Modal
        visible={modalTutoriais}
        transparent
        animationType="fade"
        onRequestClose={() => setModalTutoriais(false)}
      >
        <View style={Estilos.fundoModal}>
          <View style={Estilos.modalTutoriais}>
            <View style={Estilos.cabecalhoTutoriais}>
              <View style={Estilos.tituloTutoriaisContainer}>
                <Feather
                  name="play-circle"
                  size={25}
                  color={tema.text}
                />

                <Text style={Estilos.tituloModalTutoriais}>
                  Vídeos tutoriais
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setModalTutoriais(false)}
                style={Estilos.botaoXTutoriais}
                accessibilityRole="button"
                accessibilityLabel="Fechar tutoriais"
              >
                <Feather
                  name="x"
                  size={24}
                  color={tema.text}
                />
              </TouchableOpacity>
            </View>

            <Text style={Estilos.descricaoTutoriais}>
              Selecione a tela que deseja aprender a utilizar.
            </Text>

            <ScrollView
              style={Estilos.rolagemTutoriais}
              contentContainerStyle={Estilos.listaTutoriais}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {tutoriaisDoUsuario.map((tutorial) => (
                <TouchableOpacity
                  key={tutorial.id}
                  style={Estilos.opcaoTutorial}
                  onPress={() =>
                    void assistirTutorial(tutorial)
                  }
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Assistir tutorial de ${tutorial.titulo}`}
                >
                  <View style={Estilos.iconeTutorial}>
                    <Feather
                      name={tutorial.icone}
                      size={23}
                      color={tema.text}
                    />
                  </View>

                  <View style={Estilos.informacoesTutorial}>
                    <Text style={Estilos.nomeTutorial}>
                      {tutorial.titulo}
                    </Text>

                    <Text
                      style={Estilos.descricaoOpcaoTutorial}
                    >
                      {tutorial.descricao}
                    </Text>
                  </View>

                  <Feather
                    name="chevron-right"
                    size={22}
                    color={tema.text}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={Estilos.botaoFecharTutoriais}
              onPress={() => setModalTutoriais(false)}
              accessibilityRole="button"
            >
              <Text style={Estilos.textoFecharTutoriais}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL DE TAMANHO DA FONTE */}

      <Modal
        visible={modalTamanhoFonte}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setModalTamanhoFonte(false)
        }
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
              onPress={() =>
                setModalTamanhoFonte(false)
              }
              style={Estilos.botaoFecharFonte}
            >
              <Text style={Estilos.textoFechar}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL DE ALTERAR SENHA */}

      <Modal
        visible={modalAlterarSenha}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setModalAlterarSenha(false)
        }
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS === "ios" ? "padding" : "height"
          }
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

      {/* MODAL DE LIMPEZA DAS TAREFAS */}

      <Modal
        visible={
          modalLimpeza &&
          usuario?.tipo === "estudante"
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
              Cada tarefa será excluída automaticamente após
              o prazo escolhido, contado a partir da sua
              conclusão. A exclusão é permanente. Ao mudar
              o prazo, ele também será aplicado às tarefas
              já concluídas.
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
                    salvandoLimpeza &&
                      Estilos.desabilitado,
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
              onPress={() =>
                setModalLimpeza(false)
              }
              style={Estilos.botaoCancelarSenha}
            >
              <Text style={Estilos.textoFechar}>
                Fechar
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* MODAL DE ALTERAR TURMA */}

      <Modal
        visible={
          modalAlterarTurma &&
          usuario?.tipo === "estudante"
        }
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!salvandoTurma) {
            setModalAlterarTurma(false);
          }
        }}
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS === "ios" ? "padding" : "height"
          }
          style={Estilos.fundoModal}
        >
          <ScrollView
            style={Estilos.modalTurma}
            contentContainerStyle={Estilos.conteudoModal}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={Estilos.tituloModalTurma}>
              Alterar turma
            </Text>

            <Text style={Estilos.textoModalTurma}>
              Informe sua nova turma para atualizar seus
              dados no aplicativo.
            </Text>

            <View style={Estilos.avisoAlterarTurma}>
              <Feather
                name="alert-circle"
                size={22}
                color={tema.text}
              />

              <View style={Estilos.conteudoAvisoTurma}>
                <Text style={Estilos.tituloAvisoTurma}>
                  Atenção ao alterar sua turma
                </Text>

                <Text style={Estilos.textoAvisoTurma}>
                  Mantenha sua turma sempre atualizada e
                  informe apenas dados verdadeiros. Essa
                  informação é importante para facilitar sua
                  identificação e a comunicação com
                  professoras/professores e tutoras/tutores
                  pelo PAED.
                </Text>
              </View>
            </View>

            <Text style={Estilos.labelTurma}>
              Turma atual
            </Text>

            <Text style={Estilos.valorTurmaAtual}>
              {dadosAluno?.turma || "Não informada"}
            </Text>

            <Text style={Estilos.labelTurma}>
              Nova turma
            </Text>

            <TextInput
              style={Estilos.inputTurma}
              placeholder="Digite sua nova turma"
              placeholderTextColor={tema.text}
              value={novaTurma}
              onChangeText={setNovaTurma}
              maxLength={50}
              editable={!salvandoTurma}
              autoCapitalize="sentences"
              accessibilityLabel="Nova turma"
            />

            <TouchableOpacity
              style={[
                Estilos.botaoConfirmarTurma,
                salvandoTurma &&
                  Estilos.desabilitado,
              ]}
              onPress={alterarTurma}
              disabled={salvandoTurma}
            >
              <Text style={Estilos.textoConfirmarTurma}>
                {salvandoTurma
                  ? "Salvando..."
                  : "Salvar turma"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={Estilos.botaoCancelarSenha}
              onPress={() => {
                setNovaTurma("");
                setModalAlterarTurma(false);
              }}
              disabled={salvandoTurma}
            >
              <Text style={Estilos.textoCancelarSenha}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL DE ALTERAR ÁREA OU DEPARTAMENTO */}

      <Modal
        visible={
          modalDadosProfissionais &&
          (eProfessor || eTutorOuNapne)
        }
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!salvandoDadoProfissional) {
            setModalDadosProfissionais(false);
            setNovoDadoProfissional("");
          }
        }}
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS === "ios" ? "padding" : "height"
          }
          style={Estilos.fundoModal}
        >
          <ScrollView
            style={Estilos.modalTurma}
            contentContainerStyle={Estilos.conteudoModal}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={Estilos.tituloModalTurma}>
              {eProfessor
                ? "Alterar área"
                : "Alterar departamento"}
            </Text>

            <Text style={Estilos.textoModalTurma}>
              {eProfessor
                ? "Informe sua nova área de atuação para atualizar seu perfil no PAED."
                : "Informe seu novo departamento para atualizar seu perfil no PAED."}
            </Text>

            <View style={Estilos.avisoAlterarTurma}>
              <Feather
                name="alert-circle"
                size={22}
                color={tema.text}
              />

              <View style={Estilos.conteudoAvisoTurma}>
                <Text style={Estilos.tituloAvisoTurma}>
                  Mantenha seus dados atualizados
                </Text>

                <Text style={Estilos.textoAvisoTurma}>
                  Informe dados verdadeiros. Essas informações
                  ajudam na identificação e na comunicação
                  entre as pessoas pelo PAED.
                </Text>
              </View>
            </View>

            <Text style={Estilos.labelTurma}>
              {eProfessor
                ? "Área atual"
                : "Departamento atual"}
            </Text>

            <Text style={Estilos.valorTurmaAtual}>
              {valorDadoProfissionalAtual ||
                "Não informado"}
            </Text>

            <Text style={Estilos.labelTurma}>
              {eProfessor
                ? "Nova área"
                : "Novo departamento"}
            </Text>

            <TextInput
              style={Estilos.inputTurma}
              placeholder={
                eProfessor
                  ? "Digite sua nova área"
                  : "Digite seu novo departamento"
              }
              placeholderTextColor={tema.secondaryText}
              value={novoDadoProfissional}
              onChangeText={setNovoDadoProfissional}
              maxLength={100}
              editable={!salvandoDadoProfissional}
              autoCapitalize="sentences"
              returnKeyType="done"
              accessibilityLabel={
                eProfessor
                  ? "Nova área"
                  : "Novo departamento"
              }
            />

            <TouchableOpacity
              style={[
                Estilos.botaoConfirmarTurma,
                salvandoDadoProfissional &&
                  Estilos.desabilitado,
              ]}
              onPress={() =>
                void alterarDadoProfissional()
              }
              disabled={salvandoDadoProfissional}
              accessibilityRole="button"
            >
              <Text style={Estilos.textoConfirmarTurma}>
                {salvandoDadoProfissional
                  ? "Salvando..."
                  : eProfessor
                    ? "Salvar área"
                    : "Salvar departamento"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={Estilos.botaoCancelarSenha}
              onPress={() => {
                setNovoDadoProfissional("");
                setModalDadosProfissionais(false);
              }}
              disabled={salvandoDadoProfissional}
              accessibilityRole="button"
            >
              <Text style={Estilos.textoCancelarSenha}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
