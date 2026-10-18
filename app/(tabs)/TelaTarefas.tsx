
import { useState, useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Calendar, LocaleConfig, DateData } from "react-native-calendars";
import { useTheme } from "../../context/ThemeContext";
import { useFontSize } from "../../context/FontSizeContext";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Estilos from "../../Estilos/TelaTarefasEstilo";
import { supabase } from "../../bd/supabase";
import BotaoAlerta from "../../components/BotaoAlerta";
import ModalDetalhesTarefa from "../../components/ModalDetalhesTarefa";
import { ptBR } from "../../Utils/configCal";

LocaleConfig.locales["pt-br"] = ptBR;
LocaleConfig.defaultLocale = "pt-br";

type Task = {
  id: number;
  titulo: string;
  data: string;
  disciplina: string;
  professor: string;
  tipo: string;
  plataforma: string;
  descricao: string;
  concluido: boolean;
  aluno_id: string;
  criado_por: string | null;
};

type CriadorEvento = {
  id: string;
  nome: string;
  tipo: string;
};

const TIPOS_EVENTO = ["Tarefa", "Reunião", "Avaliação"] as const;

export default function ListaTarefas() {
  const { alunoId } = useLocalSearchParams<{ alunoId?: string }>();
  const { tema } = useTheme();
  const { escalaFonte } = useFontSize();
  const { width, fontScale } = useWindowDimensions();

  const botoesEmColuna = width < 380 || escalaFonte * fontScale >= 1.2;

  const [alunoTitulo, setAlunoTitulo] = useState<{
    id: string;
    nome: string;
  } | null>(null);

  const [criadores, setCriadores] = useState<Record<string, CriadorEvento>>({});

  const [reforcoPositivo, setReforcoPositivo] = useState<{
    tarefaId: number;
    titulo: string;
  } | null>(null);

  const [tarefas, setTarefas] = useState<Task[]>([]);
  const [editando, setEditando] = useState(false);
  const [modalVisivel, setModalVisivel] = useState(false);

  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [professor, setProfessor] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [descricao, setDescricao] = useState("");

  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Task | null>(null);

  const [dataInterna, setDataInterna] = useState("");
  const [calendarioDataAberto, setCalendarioDataAberto] = useState(false);

  useEffect(() => {
    let ativo = true;

    setAlunoTitulo(null);

    if (!alunoId) return;

    const carregarNomeAluno = async () => {
      try {
        const { data: aluno, error } = await supabase
          .from("usuarios")
          .select("nome")
          .eq("id", alunoId)
          .single();

        if (!ativo) return;

        if (error) {
          console.log("Erro ao carregar nome do aluno:", error);
          return;
        }

        setAlunoTitulo({
          id: alunoId,
          nome: aluno.nome,
        });
      } catch (error) {
        if (ativo) {
          console.log("Erro ao carregar nome do aluno:", error);
        }
      }
    };

    void carregarNomeAluno();

    return () => {
      ativo = false;
    };
  }, [alunoId]);

  const tituloTela = alunoId
    ? alunoTitulo?.id === alunoId
      ? `Tarefas de ${alunoTitulo.nome}`
      : "Tarefas do aluno"
    : "Minhas Tarefas";

  const getCorTipo = (tipo: string) => {
    switch (tipo) {
      case "Tarefa":
        return "#88C688";
      case "Reunião":
        return "#94C0DF";
      case "Avaliação":
        return "#9E82C0";
      default:
        return "#94C0DF";
    }
  };

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const converterData = (data: string) => {
    const [ano, mes, dia] = data.split("-");
    return new Date(Number(ano), Number(mes) - 1, Number(dia));
  };

  const validarData = (data: string) => {
    const partes = data.split("-");

    if (partes.length !== 3) return false;

    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    const dataTeste = new Date(ano, mes - 1, dia);

    return (
      dataTeste.getFullYear() === ano &&
      dataTeste.getMonth() === mes - 1 &&
      dataTeste.getDate() === dia
    );
  };

  const limparFormulario = () => {
    setTitulo("");
    setData("");
    setDataInterna("");
    setDisciplina("");
    setProfessor("");
    setPlataforma("");
    setDescricao("");
    setTipoSelecionado("");
    setCalendarioDataAberto(false);
  };

  const fecharModal = () => {
    setModalVisivel(false);
    setEditando(false);
    limparFormulario();
  };

  const adicionarTarefa = async () => {
    if (
      !titulo.trim() ||
      !dataInterna.trim() ||
      !disciplina.trim() ||
      !professor.trim() ||
      !tipoSelecionado.trim()
    ) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha título, data, disciplina, professor e tipo do evento."
      );
      return false;
    }

    if (!validarData(dataInterna)) {
      Alert.alert(
        "Data inválida",
        "Selecione uma data válida."
      );
      return false;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataEvento = converterData(dataInterna);
    dataEvento.setHours(0, 0, 0, 0);

    if (dataEvento < hoje) {
      Alert.alert(
        "Data inválida",
        "Não é possível criar um evento em uma data que já passou."
      );
      return false;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Erro", "Nenhum usuário está logado.");
      return false;
    }

    const novaTarefa = {
      id: Date.now(),
      titulo: titulo.trim(),
      data: dataInterna,
      disciplina: disciplina.trim(),
      professor: professor.trim(),
      tipo: tipoSelecionado,
      plataforma: plataforma.trim(),
      descricao: descricao.trim(),
      concluido: false,
      aluno_id: alunoId || user.id,
      criado_por: user.id,
    };

    const { data: tarefaSalva, error } = await supabase
      .from("tarefas")
      .insert(novaTarefa)
      .select()
      .single();

    if (error) {
      console.log("Erro ao adicionar tarefa:", error);
      Alert.alert("Erro", "Não foi possível adicionar a tarefa.");
      return false;
    }

    setTarefas((tarefasAtuais) => [...tarefasAtuais, tarefaSalva]);
    await getData();

    limparFormulario();

    console.log("Tarefa adicionada");
    return true;
  };

  const identificarCriador = (tarefa: Task) => {
    if (!tarefa.criado_por) return "Não informado";

    if (tarefa.criado_por === tarefa.aluno_id) {
      return "Você";
    }

    const criador = criadores[tarefa.criado_por];

    if (!criador) return "Nome indisponível";

    const papel =
      criador.tipo === "tutor"
        ? "Tutor"
        : criador.tipo === "napne"
          ? "NAPNE"
          : criador.tipo === "estudante"
            ? "Estudante"
            : criador.tipo === "professor"
              ? "Professor"
              : "";

    return papel ? `${criador.nome} (${papel})` : criador.nome;
  };

  const renderizarTarefas = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[
        Estilos.cardEvento,
        {
          borderColor: getCorTipo(item.tipo),
          backgroundColor: tema.card,
        },
      ]}
      onPress={() => {
        setTarefaSelecionada(item);
        setModalDetalhes(true);
      }}
    >
      <View style={Estilos.topoCard}>
        <TouchableOpacity
          style={Estilos.checkbox}
          onPress={() => alterarStatusTarefa(item.id)}
        >
          {item.concluido ? (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color="#4CAF50"
            />
          ) : (
            <Ionicons
              name="ellipse-outline"
              size={24}
              color="#ccc"
            />
          )}
        </TouchableOpacity>

        <Text
          style={[
            Estilos.tituloEvento,
            item.concluido && Estilos.completedTaskText,
            {
              color: tema.text,
              fontSize: 18 * escalaFonte,
            },
          ]}
        >
          {item.titulo}
        </Text>

        <View
          style={[
            Estilos.badgeTipo,
            { backgroundColor: getCorTipo(item.tipo) },
          ]}
        >
          <Text
            style={[
              Estilos.textoTipo,
              { fontSize: 14 * escalaFonte },
            ]}
          >
            {item.tipo}
          </Text>
        </View>
      </View>

      <Text
        style={[
          Estilos.textodataEvento,
          { color: tema.text, fontSize: 14 * escalaFonte },
        ]}
      >
        📅 {formatarData(item.data)} 📚 {item.disciplina}
      </Text>

      <Text
        style={[
          Estilos.textodataEvento,
          { color: tema.text, fontSize: 14 * escalaFonte },
        ]}
      >
        👨‍🏫 Prof. {item.professor}
      </Text>

      <View style={Estilos.rodapeCriador}>
        <Ionicons
          name="person-outline"
          size={16 * escalaFonte}
          color={tema.text}
          accessible={false}
        />

        <Text
          style={[
            Estilos.textoCriador,
            {
              color: tema.text,
              fontSize: 12 * escalaFonte,
            },
          ]}
        >
          Criado por: {identificarCriador(item)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const alterarStatusTarefa = async (id: number) => {
    try {
      const tarefa = tarefas.find((task) => task.id === id);
      if (!tarefa) return;

      const novoStatus = !tarefa.concluido;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const prazo = converterData(tarefa.data);
      prazo.setHours(0, 0, 0, 0);

      const dentroDoPrazo =
        validarData(tarefa.data) &&
        prazo.getTime() >= hoje.getTime();

      const { data: tarefaAtualizada, error } = await supabase
        .from("tarefas")
        .update({ concluido: novoStatus })
        .eq("id", id)
        .select()
        .single();

      if (error || !tarefaAtualizada) {
        console.log("Erro ao alterar status da tarefa:", error);
        Alert.alert(
          "Erro",
          "Não foi possível alterar o status da tarefa."
        );
        return;
      }

      setTarefas((tarefasAtuais) =>
        tarefasAtuais.map((task) =>
          task.id === id ? tarefaAtualizada : task
        )
      );

      if (novoStatus && dentroDoPrazo) {
        setReforcoPositivo({
          tarefaId: id,
          titulo: tarefa.titulo,
        });
      } else {
        setReforcoPositivo((mensagemAtual) =>
          mensagemAtual?.tarefaId === id ? null : mensagemAtual
        );
      }
    } catch (error) {
      console.log("Erro ao alterar status da tarefa:", error);
      Alert.alert(
        "Erro",
        "Não foi possível alterar o status da tarefa."
      );
    }
  };

  const removerTarefa = (id: number) => {
    Alert.alert(
      "Remover Tarefa",
      "Tem certeza que deseja remover esta tarefa?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("tarefas")
                .delete()
                .eq("id", id);

              if (error) {
                console.log("Erro ao remover tarefa:", error);
                Alert.alert(
                  "Erro",
                  "Não foi possível remover a tarefa."
                );
                return;
              }

              setTarefas((tarefasAtuais) =>
                tarefasAtuais.filter((task) => task.id !== id)
              );

              setModalDetalhes(false);
              setTarefaSelecionada(null);
            } catch (error) {
              console.log("Erro ao remover tarefa:", error);
            }
          },
        },
      ]
    );
  };

  const totalTarefas = tarefas.length;
  const tarefasCompletas = tarefas.filter(
    (task) => task.concluido
  ).length;

  const getData = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.log("Erro ao obter usuário logado:", authError);
        setTarefas([]);
        setCriadores({});
        return;
      }

      const { data: tarefasSalvas, error } = await supabase
        .from("tarefas")
        .select("*")
        .eq("aluno_id", alunoId || user.id)
        .order("data", { ascending: true });

      if (error) {
        console.log("Erro ao carregar tarefas:", error);
        return;
      }

      const listaTarefas: Task[] = tarefasSalvas || [];

      const idsCriadores = [
        ...new Set(
          listaTarefas
            .map((tarefa) => tarefa.criado_por)
            .filter((id): id is string => Boolean(id))
        ),
      ];

      const mapaCriadores: Record<string, CriadorEvento> = {};

      if (idsCriadores.length > 0) {
        const {
          data: usuariosCriadores,
          error: erroCriadores,
        } = await supabase
          .from("usuarios")
          .select("id, nome, tipo")
          .in("id", idsCriadores);

        if (erroCriadores) {
          console.log(
            "Erro ao carregar criadores dos eventos:",
            erroCriadores
          );
        } else {
          for (const criador of usuariosCriadores || []) {
            mapaCriadores[criador.id] = criador;
          }
        }
      }

      setCriadores(mapaCriadores);
      setTarefas(listaTarefas);
    } catch (error) {
      console.log("Erro ao carregar tarefas:", error);
    }
  };

  const agora = new Date();

  const hojeCalendario = [
    agora.getFullYear(),
    String(agora.getMonth() + 1).padStart(2, "0"),
    String(agora.getDate()).padStart(2, "0"),
  ].join("-");

  const abrirCalendarioData = () => {
    Keyboard.dismiss();
    setCalendarioDataAberto((aberto) => !aberto);
  };

  const selecionarDataCalendario = (dia: DateData) => {
    if (dia.dateString < hojeCalendario) return;

    const [ano, mes, diaNumero] = dia.dateString.split("-");

    setData(`${diaNumero}/${mes}/${ano}`);
    setDataInterna(dia.dateString);
    setCalendarioDataAberto(false);
  };

  useEffect(() => {
    setCalendarioDataAberto(false);
  }, [modalVisivel]);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const atrasadas: Task[] = [];
  const hojeLista: Task[] = [];
  const semana: Task[] = [];
  const proximas: Task[] = [];
  const concluidas: Task[] = [];

  tarefas.forEach((tarefa) => {
    if (tarefa.concluido) {
      concluidas.push(tarefa);
      return;
    }

    const data = converterData(tarefa.data);
    data.setHours(0, 0, 0, 0);

    const diferencaDias =
      (data.getTime() - hoje.getTime()) /
      (1000 * 60 * 60 * 24);

    if (diferencaDias < 0) {
      atrasadas.push(tarefa);
    } else if (diferencaDias === 0) {
      hojeLista.push(tarefa);
    } else if (diferencaDias <= 7) {
      semana.push(tarefa);
    } else {
      proximas.push(tarefa);
    }
  });

  const abrirEdicao = () => {
    if (!tarefaSelecionada) return;

    setTitulo(tarefaSelecionada.titulo);
    setData(formatarData(tarefaSelecionada.data));
    setDataInterna(tarefaSelecionada.data);
    setDisciplina(tarefaSelecionada.disciplina);
    setProfessor(tarefaSelecionada.professor);
    setTipoSelecionado(tarefaSelecionada.tipo);
    setPlataforma(tarefaSelecionada.plataforma);
    setDescricao(tarefaSelecionada.descricao);

    setEditando(true);
    setModalDetalhes(false);
    setModalVisivel(true);
  };

  const editarTarefa = async () => {
    if (
      !titulo.trim() ||
      !dataInterna.trim() ||
      !disciplina.trim() ||
      !professor.trim() ||
      !tipoSelecionado.trim()
    ) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha título, data, disciplina, professor e tipo do evento."
      );
      return false;
    }

    if (!validarData(dataInterna)) {
      Alert.alert("Data inválida", "Selecione uma data válida.");
      return false;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataEvento = converterData(dataInterna);
    dataEvento.setHours(0, 0, 0, 0);

    if (dataEvento < hoje) {
      Alert.alert(
        "Data inválida",
        "Não é possível colocar o evento em uma data que já passou."
      );
      return false;
    }

    if (!tarefaSelecionada) return false;

    try {
      const { data: tarefaAtualizada, error } = await supabase
        .from("tarefas")
        .update({
          titulo: titulo.trim(),
          data: dataInterna,
          disciplina: disciplina.trim(),
          professor: professor.trim(),
          tipo: tipoSelecionado,
          plataforma: plataforma.trim(),
          descricao: descricao.trim(),
        })
        .eq("id", tarefaSelecionada.id)
        .select()
        .single();

      if (error) {
        console.log("Erro ao editar tarefa:", error);
        Alert.alert("Erro", "Não foi possível editar a tarefa.");
        return false;
      }

      setTarefas((tarefasAtuais) =>
        tarefasAtuais.map((task) =>
          task.id === tarefaSelecionada.id
            ? tarefaAtualizada
            : task
        )
      );

      setTarefaSelecionada(tarefaAtualizada);
      limparFormulario();
      setEditando(false);

      return true;
    } catch (error) {
      console.log("Erro ao editar tarefa:", error);
      Alert.alert("Erro", "Não foi possível editar a tarefa.");
      return false;
    }
  };

  const renderizarSecao = (titulo: string, dados: Task[]) => {
    if (dados.length === 0) return null;

    return (
      <View style={{ marginBottom: 20 }}>
        <Text
          style={[
            Estilos.tituloSecao,
            {
              color: tema.text,
              fontSize: 22 * escalaFonte,
            },
          ]}
        >
          {titulo}
        </Text>

        {dados.map((item) => (
          <View key={item.id}>
            {renderizarTarefas({ item })}
          </View>
        ))}
      </View>
    );
  };

  const textoBotao = editando
    ? "Salvar Alterações"
    : "Adicionar Evento";

  useFocusEffect(
    useCallback(() => {
      void getData();
    }, [alunoId])
  );

  // Mesmo estilo visual para todos os inputs do formulário
  const estiloCampo = [
    Estilos.textosInfo,
    {
      backgroundColor: tema.card,
      borderColor: tema.border,
      color: tema.text,
      fontSize: 16 * escalaFonte,
    },
  ];

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[
        Estilos.container,
        { backgroundColor: tema.background },
      ]}
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
            {tituloTela}
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 8,
              alignSelf: "flex-end",
              maxWidth: "100%",
            }}
          >
            <BotaoAlerta />

            <TouchableOpacity
              style={Estilos.addButton}
              accessibilityRole="button"
              accessibilityLabel="Adicionar evento"
              onPress={() => {
                limparFormulario();
                setEditando(false);
                setModalVisivel(true);
              }}
            >
              <Ionicons
                name="add"
                size={24 * escalaFonte}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text
          style={[
            Estilos.taskCount,
            {
              color: tema.text,
              fontSize: 14 * escalaFonte,
            },
          ]}
        >
          {tarefasCompletas} de {totalTarefas} concluídas
        </Text>
      </View>

      {/* Lista de eventos */}
      {tarefas.length > 0 ? (
        <ScrollView
          style={Estilos.taskList}
          showsVerticalScrollIndicator={false}
        >
          {renderizarSecao("⚠️ Atrasadas", atrasadas)}
          {renderizarSecao("📅 Hoje", hojeLista)}
          {renderizarSecao("🗓️ Esta Semana", semana)}
          {renderizarSecao("📌 Próximas Atividades", proximas)}
          {renderizarSecao("✅ Concluídas", concluidas)}
        </ScrollView>
      ) : (
        <View style={Estilos.emptyState}>
          <Ionicons
            name="checkmark-done-outline"
            size={64}
            color="#e0e0e0"
          />

          <Text style={Estilos.emptyStateText}>
            Nenhuma tarefa adicionada
          </Text>

          <Text style={Estilos.emptyStateSubtext}>
            Adicione uma tarefa para começar!
          </Text>
        </View>
      )}

      {/* Modal de criação e edição */}
      <Modal
        transparent
        visible={modalVisivel}
        animationType="fade"
        onRequestClose={fecharModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[
            Estilos.modalOverlay,
            { paddingVertical: 16 },
          ]}
        >
          <ScrollView
            style={[
              Estilos.cardModal,
              {
                backgroundColor: tema.modal,
                flexGrow: 0,
              },
            ]}
            contentContainerStyle={{
              padding: width < 380 ? 16 : 20,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={[
                Estilos.tituloModal,
                {
                  color: tema.text,
                  fontSize: 20 * escalaFonte,
                },
              ]}
            >
              {editando ? "Editar Evento" : "Novo Evento"}
            </Text>

            {/* Tipo do evento */}
            <Text
              style={[
                Estilos.textoTipoAdicionar,
                {
                  color: tema.text,
                  fontSize: 14 * escalaFonte,
                },
              ]}
            >
              Tipo
            </Text>

            <View style={Estilos.opcoesRow}>
              {TIPOS_EVENTO.map((tipo) => {
                const selecionado = tipoSelecionado === tipo;
                const cor = getCorTipo(tipo);

                return (
                  <TouchableOpacity
                    key={tipo}
                    style={Estilos.opcaoContainer}
                    onPress={() => setTipoSelecionado(tipo)}
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected: selecionado,
                    }}
                    accessibilityLabel={tipo}
                  >
                    <View
                      style={[
                        Estilos.radioExterno,
                        { borderColor: cor },
                      ]}
                    >
                      {selecionado && (
                        <View
                          style={[
                            Estilos.radioInterno,
                            { backgroundColor: cor },
                          ]}
                        />
                      )}
                    </View>

                    <Text
                      style={[
                        Estilos.textoOpcao,
                        {
                          color: tema.text,
                          fontSize: 16 * escalaFonte,
                        },
                      ]}
                    >
                      {tipo}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={Estilos.infoTarefa}>
              {/* Título */}
              <Text
                style={[
                  Estilos.titulosInfoTarefa,
                  {
                    color: tema.text,
                    fontSize: 14 * escalaFonte,
                  },
                ]}
              >
                Título
              </Text>

              <TextInput
                style={estiloCampo}
                placeholder="Nome do evento"
                placeholderTextColor={tema.placeholder}
                value={titulo}
                onChangeText={setTitulo}
              />

              {/* Data */}
              <Text
                style={[
                  Estilos.titulosInfoTarefa,
                  {
                    color: tema.text,
                    fontSize: 14 * escalaFonte,
                  },
                ]}
              >
                Data
              </Text>

              <TouchableOpacity
                onPress={abrirCalendarioData}
                accessibilityRole="button"
                accessibilityLabel={
                  data
                    ? `Alterar data: ${data}`
                    : "Selecionar data do evento"
                }
                accessibilityState={{
                  expanded: calendarioDataAberto,
                }}
                style={[
                  estiloCampo,
                  Estilos.campoData,
                ]}
              >
                <Text
                  style={[
                    Estilos.textoCampoData,
                    {
                      color: data ? tema.text : tema.placeholder,
                      fontSize: 16 * escalaFonte,
                    },
                  ]}
                >
                  {data || "Selecionar data"}
                </Text>

                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={tema.text}
                />
              </TouchableOpacity>

              {calendarioDataAberto && (
                <View
                  style={[
                    Estilos.seletorData,
                    {
                      backgroundColor: tema.card,
                      borderColor: tema.border,
                    },
                  ]}
                >
                  <Calendar
                    key={`seletor-data-${escalaFonte}-${tema.background}`}
                    current={
                      dataInterna &&
                      dataInterna >= hojeCalendario
                        ? dataInterna
                        : hojeCalendario
                    }
                    minDate={hojeCalendario}
                    disableAllTouchEventsForDisabledDays
                    firstDay={0}
                    hideExtraDays
                    onDayPress={selecionarDataCalendario}
                    markedDates={
                      dataInterna
                        ? {
                            [dataInterna]: {
                              selected: true,
                              selectedColor: "#94C0DF",
                              selectedTextColor: tema.text,
                            },
                          }
                        : {}
                    }
                    theme={{
                      calendarBackground: tema.card,
                      dayTextColor: tema.text,
                      monthTextColor: tema.text,
                      textSectionTitleColor: tema.text,
                      todayTextColor: tema.text,
                      todayBackgroundColor: "#c49a7e",
                      arrowColor: tema.text,
                      textDisabledColor: "#888888",
                      textDayFontSize: 14 * escalaFonte,
                      textMonthFontSize: 16 * escalaFonte,
                      textDayHeaderFontSize: 12 * escalaFonte,
                    }}
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setCalendarioDataAberto(false)
                    }
                    accessibilityRole="button"
                    style={Estilos.botaoFecharCalendario}
                  >
                    <Text
                      style={{
                        color: tema.text,
                        fontSize: 14 * escalaFonte,
                        textAlign: "center",
                        fontFamily: "FredokaLight",
                      }}
                    >
                      Fechar calendário
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Disciplina */}
              <Text
                style={[
                  Estilos.titulosInfoTarefa,
                  {
                    color: tema.text,
                    fontSize: 14 * escalaFonte,
                  },
                ]}
              >
                Disciplina
              </Text>

              <TextInput
                style={estiloCampo}
                placeholder="Ex: Matemática"
                placeholderTextColor={tema.placeholder}
                value={disciplina}
                onChangeText={setDisciplina}
              />

              {/* Professor */}
              <Text
                style={[
                  Estilos.titulosInfoTarefa,
                  {
                    color: tema.text,
                    fontSize: 14 * escalaFonte,
                  },
                ]}
              >
                Professor
              </Text>

              <TextInput
                style={estiloCampo}
                placeholder="Nome do professor"
                placeholderTextColor={tema.placeholder}
                value={professor}
                onChangeText={setProfessor}
              />

              {/* Plataforma */}
              <Text
                style={[
                  Estilos.titulosInfoTarefa,
                  {
                    color: tema.text,
                    fontSize: 14 * escalaFonte,
                  },
                ]}
              >
                Plataforma de Realização (Opcional)
              </Text>

              <TextInput
                style={estiloCampo}
                placeholder="Ex: Google Classroom, Moodle"
                placeholderTextColor={tema.placeholder}
                value={plataforma}
                onChangeText={setPlataforma}
              />

              {/* Descrição */}
              <Text
                style={[
                  Estilos.titulosInfoTarefa,
                  {
                    color: tema.text,
                    fontSize: 14 * escalaFonte,
                  },
                ]}
              >
                Descrição (Opcional)
              </Text>

              <TextInput
                style={estiloCampo}
                placeholder="Detalhes do evento"
                placeholderTextColor={tema.placeholder}
                value={descricao}
                onChangeText={setDescricao}
              />
            </View>

            {/* Botões do modal */}
            <View
              style={[
                Estilos.botoesModal,
                botoesEmColuna && {
                  flexDirection: "column",
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  Estilos.botaoCancelar,
                  botoesEmColuna && {
                    flexBasis: "auto",
                    flexGrow: 0,
                    flexShrink: 0,
                    width: "100%",
                  },
                ]}
                onPress={fecharModal}
              >
                <Text
                  style={[
                    Estilos.textoBotao,
                    {
                      color: tema.textoBotao,
                      fontSize: 16 * escalaFonte,
                    },
                  ]}
                >
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  Estilos.botaoConfirmar,
                  botoesEmColuna && {
                    flexBasis: "auto",
                    flexGrow: 0,
                    flexShrink: 0,
                    width: "100%",
                  },
                ]}
                onPress={async () => {
                  const sucesso = editando
                    ? await editarTarefa()
                    : await adicionarTarefa();

                  if (sucesso) {
                    setModalVisivel(false);
                  }
                }}
              >
                <Text
                  style={[
                    Estilos.textoBotao,
                    {
                      color: tema.textoBotao,
                      fontSize: 16 * escalaFonte,
                    },
                  ]}
                >
                  {textoBotao}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal de detalhes */}
      <ModalDetalhesTarefa
        visible={modalDetalhes}
        tarefa={tarefaSelecionada}
        onClose={() => setModalDetalhes(false)}
        onEdit={abrirEdicao}
        onDelete={() => {
          if (tarefaSelecionada) {
            removerTarefa(tarefaSelecionada.id);
          }
        }}
      />

      {/* Modal de reforço positivo */}
      <Modal
        visible={reforcoPositivo !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setReforcoPositivo(null)}
      >
        <View style={Estilos.overlayReforco}>
          <View
            style={[
              Estilos.modalReforco,
              { backgroundColor: tema.card },
            ]}
            accessibilityViewIsModal
          >
            <ScrollView
              style={{ width: "100%" }}
              contentContainerStyle={Estilos.conteudoReforco}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={56 * escalaFonte}
                color={tema.text}
                accessible={false}
              />

              <Text
                accessibilityRole="header"
                style={[
                  Estilos.tituloReforco,
                  {
                    color: tema.text,
                    fontSize: 24 * escalaFonte,
                  },
                ]}
              >
                Parabéns!
              </Text>

              <Text
                style={[
                  Estilos.textoReforco,
                  {
                    color: tema.text,
                    fontSize: 18 * escalaFonte,
                  },
                ]}
              >
                Você concluiu “{reforcoPositivo?.titulo}” dentro do prazo!
              </Text>

              <Text
                style={[
                  Estilos.textoReforco,
                  {
                    color: tema.text,
                    fontSize: 16 * escalaFonte,
                  },
                ]}
              >
                Cada passo conta. Você está avançando!
              </Text>

              <TouchableOpacity
                style={[
                  Estilos.botaoContinuarReforco,
                  { borderColor: tema.text },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Continuar e fechar mensagem de parabéns"
                onPress={() => setReforcoPositivo(null)}
              >
                <Text
                  style={[
                    Estilos.textoBotaoReforco,
                    {
                      color: tema.text,
                      fontSize: 18 * escalaFonte,
                    },
                  ]}
                >
                  Continuar
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
