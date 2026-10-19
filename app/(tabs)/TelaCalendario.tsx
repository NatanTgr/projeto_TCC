
import {
  Text,
  View,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  useWindowDimensions,
} from "react-native";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";
import { useFontSize } from "../../context/FontSizeContext";
import { useFocusEffect } from "expo-router";
import Estilos from "../../Estilos/TelaCalendarioEstilo";
import BotaoAlerta from "../../components/BotaoAlerta";
import ModalDetalhesTarefa from "../../components/ModalDetalhesTarefa";
import { ptBR } from "../../Utils/configCal";

LocaleConfig.locales["pt-br"] = ptBR;
LocaleConfig.defaultLocale = "pt-br";

const TIPOS_EVENTO = ["Tarefa", "Reunião", "Avaliação"] as const;

export default function TelaCalendario() {
  const { tema, tipoTema } = useTheme();
  const { escalaFonte } = useFontSize();

  const corHoje =
    tipoTema === "forte"
      ? "#FF477E"
      : tipoTema === "escuro"
        ? "#655854"
        : "#836F68";

  const corTextoHoje = tipoTema === "forte" ? "#FFEA00" : "#FFFFFF";
  const corBordaDias = tipoTema === "forte" ? "#FFEA00" : tema.border;

  const { width, fontScale } = useWindowDimensions();
  const botoesEmColuna = width < 380 || escalaFonte * fontScale >= 1.2;

  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [dataInterna, setDataInterna] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [professor, setProfessor] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [descricao, setDescricao] = useState("");

  const [markedDates, setMarkedDates] = useState<any>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState("");
  const [calendarioDataAberto, setCalendarioDataAberto] = useState(false);
  const [modalEscolha, setModalEscolha] = useState(false);
  const [modalListaTarefas, setModalListaTarefas] = useState(false);
  const [modalDetalhes, setModalDetalhes] = useState(false);

  const [tarefasDoDia, setTarefasDoDia] = useState<any[]>([]);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<any>(null);

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

  const validarData = (data: string) => {
    const partes = data.split("-");
    if (partes.length !== 3) return false;

    const [ano, mes, dia] = partes;

    if (ano.length !== 4 || mes.length !== 2 || dia.length !== 2) {
      return false;
    }

    const dataTeste = new Date(Number(ano), Number(mes) - 1, Number(dia));

    return (
      dataTeste.getFullYear() === Number(ano) &&
      dataTeste.getMonth() === Number(mes) - 1 &&
      dataTeste.getDate() === Number(dia)
    );
  };

  const converterData = (data: string) => {
    const [ano, mes, dia] = data.split("-");
    return new Date(Number(ano), Number(mes) - 1, Number(dia));
  };

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
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

  const fecharModalEvento = () => {
    setModalVisible(false);
    setEditando(false);
    limparFormulario();
  };

  const abrirEdicao = () => {
    if (!tarefaSelecionada) return;

    setTitulo(tarefaSelecionada.titulo);
    setData(formatarData(tarefaSelecionada.data));
    setDataInterna(tarefaSelecionada.data);
    setDisciplina(tarefaSelecionada.disciplina ?? "");
    setProfessor(tarefaSelecionada.professor ?? "");
    setTipoSelecionado(tarefaSelecionada.tipo);
    setPlataforma(tarefaSelecionada.plataforma ?? "");
    setDescricao(tarefaSelecionada.descricao ?? "");

    setCalendarioDataAberto(false);
    setEditando(true);
    setModalDetalhes(false);
    setModalVisible(true);
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
        "Preencha título, data, disciplina, professora/professor e tipo do evento."
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

      setTarefaSelecionada(tarefaAtualizada);
      await carregarEventosCalendario();
      setEditando(false);

      return true;
    } catch (error) {
      console.log("Erro ao editar tarefa:", error);
      Alert.alert("Erro", "Não foi possível editar a tarefa.");
      return false;
    }
  };

  const adicionarTarefa = async (tipo: string) => {
    if (
      !titulo.trim() ||
      !dataInterna.trim() ||
      !disciplina.trim() ||
      !professor.trim() ||
      !tipo.trim()
    ) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha título, data, disciplina, professora/professor e tipo do evento."
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
        "Não é possível criar um evento em uma data que já passou."
      );
      return false;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        Alert.alert(
          "Usuário não encontrado",
          "Não foi possível identificar o usuário logado."
        );
        return false;
      }

      const { error } = await supabase.from("tarefas").insert({
        titulo: titulo.trim(),
        data: dataInterna,
        disciplina: disciplina.trim(),
        professor: professor.trim(),
        tipo,
        plataforma: plataforma.trim(),
        descricao: descricao.trim(),
        concluido: false,
        aluno_id: user.id,
        criado_por: user.id,
      });

      if (error) {
        console.log("Erro ao adicionar tarefa:", error);
        Alert.alert("Erro", "Não foi possível adicionar o evento.");
        return false;
      }

      await carregarEventosCalendario();

      return true;
    } catch (error) {
      console.log("Erro ao adicionar tarefa:", error);
      Alert.alert("Erro", "Ocorreu um erro ao adicionar o evento.");
      return false;
    }
  };

  async function handleDayPress(day: DateData) {
    limparFormulario();
    setEditando(false);

    setData(formatarData(day.dateString));
    setDataInterna(day.dateString);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("Nenhum usuário logado.");
        return;
      }

      const { data: tarefas, error } = await supabase
        .from("tarefas")
        .select("*")
        .eq("aluno_id", user.id)
        .eq("data", day.dateString);

      if (error) {
        console.log("Erro ao carregar tarefas do dia:", error);
        return;
      }

      const tarefasDoDiaSelecionado = tarefas || [];
      setTarefasDoDia(tarefasDoDiaSelecionado);

      if (tarefasDoDiaSelecionado.length > 0) {
        setModalEscolha(true);
      } else {
        setModalVisible(true);
      }
    } catch (error) {
      console.log("Erro ao selecionar dia:", error);
    }
  }

  const removerTarefa = async (id: number) => {
    try {
      const { error } = await supabase
        .from("tarefas")
        .delete()
        .eq("id", id);

      if (error) {
        console.log("Erro ao remover tarefa:", error);
        Alert.alert("Erro", "Não foi possível excluir o evento.");
        return;
      }

      await carregarEventosCalendario();

      setTarefasDoDia((tarefasAtuais) =>
        tarefasAtuais.filter((tarefa: any) => tarefa.id !== id)
      );
    } catch (error) {
      console.log("Erro ao remover tarefa:", error);
    }
  };

  const carregarEventosCalendario = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("Nenhum usuário logado.");
        setMarkedDates({});
        return;
      }

      const { data: tarefas, error } = await supabase
        .from("tarefas")
        .select("*")
        .eq("aluno_id", user.id);

      if (error) {
        console.log("Erro ao carregar tarefas do calendário:", error);
        setMarkedDates({});
        return;
      }

      const datasMarcadas: any = {};

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, "0");
      const dia = String(hoje.getDate()).padStart(2, "0");

      const dataHoje = `${ano}-${mes}-${dia}`;

      (tarefas || []).forEach((tarefa: any) => {
        if (!tarefa.data) return;

        const cor =
          tarefa.data < dataHoje && !tarefa.concluido
            ? "#FFA64E"
            : getCorTipo(tarefa.tipo);

        const data = tarefa.data;

        if (!datasMarcadas[data]) {
          datasMarcadas[data] = { dots: [] };
        }

        datasMarcadas[data].dots.push({
          key: tarefa.id,
          color: cor,
        });
      });

      setMarkedDates(datasMarcadas);
    } catch (error) {
      console.log("Erro ao carregar eventos do calendário:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      void carregarEventosCalendario();
    }, [])
  );

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

    setData(formatarData(dia.dateString));
    setDataInterna(dia.dateString);
    setCalendarioDataAberto(false);
  };

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
      {/* CABEÇALHO */}
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
            Calendário
          </Text>

          <BotaoAlerta />
        </View>
      </View>

      {/* CALENDÁRIO PRINCIPAL */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={Estilos.legendaContainer}>
          {[
            { nome: "Atrasada", cor: "#FFA64E" },
            { nome: "Tarefa", cor: "#88C688" },
            { nome: "Reunião", cor: "#94C0DF" },
            { nome: "Avaliação", cor: "#9E82C0" },
          ].map((item) => (
            <View key={item.nome} style={Estilos.legendaItem}>
              <View
                style={[
                  Estilos.quadrado,
                  { backgroundColor: item.cor },
                ]}
              />

              <Text
                style={[
                  Estilos.legenda,
                  {
                    color: tema.text,
                    fontSize: 15 * escalaFonte,
                  },
                ]}
              >
                {item.nome}
              </Text>
            </View>
          ))}
        </View>

        <View
          style={[
            Estilos.calendarContainer,
            { backgroundColor: tema.card },
          ]}
        >
          <Calendar
            key={`calendario-${tipoTema}-${escalaFonte}`}
            style={[
              Estilos.calendar,
              { backgroundColor: tema.card },
            ]}
            renderArrow={(direction: "right" | "left") => (
              <Feather
                size={24}
                color={tema.text}
                name={`chevron-${direction}`}
              />
            )}
            headerStyle={{
              paddingBottom: 10,
              marginBottom: 10,
            }}
            theme={
              {
                backgroundColor: tema.card,
                calendarBackground: tema.card,

                dayTextColor: tema.text,
                monthTextColor: tema.text,
                textSectionTitleColor: tema.text,
                textDisabledColor:
                  tipoTema === "forte" ? "#BDBDBD" : "#888888",

                todayTextColor: corTextoHoje,
                todayBackgroundColor: corHoje,

                selectedDayBackgroundColor: corHoje,
                selectedDayTextColor: corTextoHoje,

                arrowColor: tema.text,

                textDayFontSize: 14 * escalaFonte,
                textMonthFontSize: 16 * escalaFonte,
                textDayHeaderFontSize: 12 * escalaFonte,

                textMonthFontFamily: "FredokaMedium",
                textDayFontFamily: "FredokaLight",
                textDayHeaderFontFamily: "FredokaLight",

                textMonthFontWeight: "normal",
                textDayFontWeight: "normal",
                textDayHeaderFontWeight: "normal",

                arrowStyle: {
                  margin: 0,
                  padding: 0,
                },

                "stylesheet.dot": {
                  dot: {
                    width: 7,
                    height: 7,
                    borderRadius: 4,
                    marginHorizontal: 1,
                  },
                },

                "stylesheet.day.basic": {
                  base: {
                    width: 40,
                    height: 40,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: corBordaDias,
                    borderRadius: 12,
                  },
                },
              } as any
            }
            hideExtraDays
            onDayPress={handleDayPress}
            markingType="multi-dot"
            markedDates={markedDates}
          />
        </View>
      </ScrollView>

      {/* MODAL DE ESCOLHA */}
      <Modal
        visible={modalEscolha}
        transparent
        animationType="fade"
        onRequestClose={() => setModalEscolha(false)}
      >
        <View style={Estilos.modalOverlay}>
          <View
            style={[
              Estilos.cardModalEscolha,
              { backgroundColor: tema.modal },
            ]}
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
              O que você deseja fazer?
            </Text>

            <TouchableOpacity
              style={Estilos.botaoEscolha}
              onPress={() => {
                setModalEscolha(false);
                setEditando(false);
                setCalendarioDataAberto(false);
                setModalVisible(true);
              }}
            >
              <Text
                style={[
                  Estilos.textoBotaoEscolha,
                  { fontSize: 16 * escalaFonte },
                ]}
              >
                Adicionar Evento
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={Estilos.botaoEscolha}
              onPress={() => {
                setModalEscolha(false);
                setModalListaTarefas(true);
              }}
            >
              <Text
                style={[
                  Estilos.textoBotaoEscolha,
                  { fontSize: 16 * escalaFonte },
                ]}
              >
                Detalhes da Tarefa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={Estilos.botaoCancelarEscolha}
              onPress={() => setModalEscolha(false)}
            >
              <Text
                style={[
                  Estilos.textoBotao,
                  {
                    color: "#fff",
                    fontSize: 16 * escalaFonte,
                  },
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL DA LISTA DE EVENTOS */}
      <Modal
        visible={modalListaTarefas}
        transparent
        animationType="fade"
        onRequestClose={() => setModalListaTarefas(false)}
      >
        <View style={Estilos.modalOverlay}>
          <View
            style={[
              Estilos.cardModalEscolha,
              { backgroundColor: tema.modal },
            ]}
          >
            <Text
              style={[
                Estilos.tituloModalLista,
                {
                  color: tema.text,
                  fontSize: 20 * escalaFonte,
                },
              ]}
            >
              Escolha uma tarefa
            </Text>

            <ScrollView>
              {tarefasDoDia.map((tarefa) => (
                <TouchableOpacity
                  key={tarefa.id}
                  style={[
                    Estilos.itemTarefa,
                    {
                      borderColor: getCorTipo(tarefa.tipo),
                      backgroundColor: tema.card,
                    },
                  ]}
                  onPress={() => {
                    setTarefaSelecionada(tarefa);
                    setModalListaTarefas(false);
                    setModalDetalhes(true);
                  }}
                >
                  <Text
                    style={[
                      Estilos.tituloTarefa,
                      {
                        color: tema.text,
                        fontSize: 16 * escalaFonte,
                      },
                    ]}
                  >
                    {tarefa.titulo}
                  </Text>

                  <Text
                    style={[
                      Estilos.tipoTarefa,
                      {
                        color: tema.text,
                        fontSize: 14 * escalaFonte,
                      },
                    ]}
                  >
                    {tarefa.tipo}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={Estilos.botaoCancelarEscolha}
              onPress={() => setModalListaTarefas(false)}
            >
              <Text
                style={[
                  Estilos.textoBotao,
                  {
                    color: "#fff",
                    fontSize: 16 * escalaFonte,
                  },
                ]}
              >
                Voltar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL DE DETALHES */}
      <ModalDetalhesTarefa
        visible={modalDetalhes}
        tarefa={tarefaSelecionada}
        onClose={() => setModalDetalhes(false)}
        onEdit={abrirEdicao}
        onDelete={() => {
          if (!tarefaSelecionada) return;

          Alert.alert(
            "Excluir evento",
            "Tem certeza que deseja excluir este evento?",
            [
              {
                text: "Cancelar",
                style: "cancel",
              },
              {
                text: "Excluir",
                style: "destructive",
                onPress: async () => {
                  await removerTarefa(tarefaSelecionada.id);
                  setModalDetalhes(false);
                  setTarefaSelecionada(null);
                },
              },
            ]
          );
        }}
      />

      {/* MODAL DE CRIAÇÃO E EDIÇÃO */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={fecharModalEvento}
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

            {/* TIPO DO EVENTO */}
            <Text
              style={[
                Estilos.tipoTexto,
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
              {/* TÍTULO */}
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

              {/* DATA */}
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
                style={[
                  estiloCampo,
                  Estilos.campoData,
                ]}
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
              >
                <Text
                  style={[
                    Estilos.textoCampoData,
                    {
                      color: data
                        ? tema.text
                        : tema.placeholder,
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

              {/* CALENDÁRIO INTERNO */}
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
                    key={`seletor-data-${tipoTema}-${escalaFonte}`}
                    current={
                      dataInterna &&
                      dataInterna >= hojeCalendario
                        ? dataInterna
                        : hojeCalendario
                    }
                    minDate={hojeCalendario}
                    disableAllTouchEventsForDisabledDays
                    hideExtraDays
                    onDayPress={selecionarDataCalendario}
                    markedDates={
                      dataInterna
                        ? {
                            [dataInterna]: {
                              selected: true,
                              selectedColor: "#94C0DF",
                              selectedTextColor:
                                tipoTema === "forte"
                                  ? "#000000"
                                  : "#FFFFFF",
                            },
                          }
                        : {}
                    }
                    theme={{
                      backgroundColor: tema.card,
                      calendarBackground: tema.card,

                      dayTextColor: tema.text,
                      monthTextColor: tema.text,
                      textSectionTitleColor: tema.text,

                      todayTextColor: corTextoHoje,
                      todayBackgroundColor: corHoje,

                      arrowColor: tema.text,

                      textDisabledColor:
                        tipoTema === "forte"
                          ? "#BDBDBD"
                          : "#888888",

                      textDayFontSize: 14 * escalaFonte,
                      textMonthFontSize: 16 * escalaFonte,
                      textDayHeaderFontSize: 12 * escalaFonte,

                      textDayFontFamily: "FredokaLight",
                      textMonthFontFamily: "FredokaMedium",
                      textDayHeaderFontFamily: "FredokaLight",
                    }}
                  />

                  <TouchableOpacity
                    style={Estilos.botaoFecharCalendario}
                    onPress={() =>
                      setCalendarioDataAberto(false)
                    }
                  >
                    <Text
                      style={{
                        color: tema.text,
                        fontSize: 14 * escalaFonte,
                        fontFamily: "FredokaLight",
                        textAlign: "center",
                      }}
                    >
                      Fechar calendário
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* DISCIPLINA */}
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

              {/* PROFESSOR */}
              <Text
                style={[
                  Estilos.titulosInfoTarefa,
                  {
                    color: tema.text,
                    fontSize: 14 * escalaFonte,
                  },
                ]}
              >
                Professora/Professor
              </Text>

              <TextInput
                style={estiloCampo}
                placeholder="Nome da professora/do professor"
                placeholderTextColor={tema.placeholder}
                value={professor}
                onChangeText={setProfessor}
              />

              {/* PLATAFORMA */}
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

              {/* DESCRIÇÃO */}
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

            {/* BOTÕES */}
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
                  botoesEmColuna && Estilos.botaoColuna,
                ]}
                onPress={fecharModalEvento}
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
                  botoesEmColuna && Estilos.botaoColuna,
                ]}
                onPress={async () => {
                  const sucesso = editando
                    ? await editarTarefa()
                    : await adicionarTarefa(tipoSelecionado);

                  if (sucesso) {
                    fecharModalEvento();
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
                  {editando
                    ? "Salvar Alterações"
                    : "Adicionar Evento"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
