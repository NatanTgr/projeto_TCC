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
  useWindowDimensions,
} from "react-native";
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { Feather } from "@expo/vector-icons";
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

export default function TelaCalendario() {
  const { tema } = useTheme();
  const { escalaFonte } = useFontSize();

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

  const [selectedDay, setSelectedDay] = useState("");
  const [markedDates, setMarkedDates] = useState<any>({});
  const [day, setDay] = useState<DateData>();

  const [modalVisible, setModalVisible] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState("");

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
        "Preencha título, data, disciplina, professor e tipo do evento.",
      );
      return false;
    }

    if (!validarData(dataInterna)) {
      Alert.alert(
        "Data inválida",
        "Digite uma data válida no formato dd/mm/aaaa.",
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
        "Não é possível colocar o evento em uma data que já passou.",
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

      setTitulo("");
      setData("");
      setDataInterna("");
      setDisciplina("");
      setProfessor("");
      setPlataforma("");
      setDescricao("");
      setTipoSelecionado("");
      setEditando(false);

      return true;
    } catch (error) {
      console.log("Erro ao editar tarefa:", error);
      return false;
    }
  };

  const alterarData = (texto: string) => {
    let valor = texto.replace(/\D/g, "");

    if (valor.length > 8) valor = valor.slice(0, 8);

    if (valor.length > 4) {
      valor =
        valor.slice(0, 2) + "/" + valor.slice(2, 4) + "/" + valor.slice(4);
    } else if (valor.length > 2) {
      valor = valor.slice(0, 2) + "/" + valor.slice(2);
    }

    setData(valor);

    if (valor.length === 10) {
      const [dia, mes, ano] = valor.split("/");
      setDataInterna(`${ano}-${mes}-${dia}`);
    }
  };

  const adicionarTarefa = async (tipo: string) => {
    if (
      !titulo.trim() ||
      !dataInterna.trim() ||
      !disciplina.trim() ||
      !professor.trim() ||
      !tipo.trim() ||
      !plataforma.trim() ||
      !descricao.trim()
    ) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha todos os campos para adicionar o evento.",
      );
      return false;
    }

    if (!validarData(dataInterna)) {
      Alert.alert("Data inválida", "Digite uma data válida.");
      return false;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataEvento = converterData(dataInterna);
    dataEvento.setHours(0, 0, 0, 0);

    if (dataEvento < hoje) {
      Alert.alert(
        "Data inválida",
        "Não é possível criar um evento em uma data que já passou.",
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
          "Não foi possível identificar o usuário logado.",
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
      });

      if (error) {
        console.log("Erro ao adicionar tarefa:", error);
        Alert.alert("Erro", "Não foi possível adicionar o evento.");
        return false;
      }

      await carregarEventosCalendario();

      setTitulo("");
      setDisciplina("");
      setProfessor("");
      setPlataforma("");
      setDescricao("");
      setTipoSelecionado("");

      return true;
    } catch (error) {
      console.log("Erro ao adicionar tarefa:", error);
      Alert.alert("Erro", "Ocorreu um erro ao adicionar o evento.");
      return false;
    }
  };

  async function handleDayPress(day: DateData) {
    setSelectedDay(day.dateString);
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
      console.log(error);
    }
  }

  const removerTarefa = async (id: number) => {
    try {
      const { error } = await supabase.from("tarefas").delete().eq("id", id);

      if (error) {
        console.log("Erro ao remover tarefa:", error);
        Alert.alert("Erro", "Não foi possível excluir o evento.");
        return;
      }

      await carregarEventosCalendario();

      setTarefasDoDia((tarefasAtuais) =>
        tarefasAtuais.filter((tarefa: any) => tarefa.id !== id),
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
        if (!tarefa.data) {
          return;
        }

        const cor =
          tarefa.data < dataHoje && !tarefa.concluido
            ? "#FFA64E"
            : getCorTipo(tarefa.tipo);

        const data = tarefa.data;

        if (!datasMarcadas[data]) {
          datasMarcadas[data] = {
            dots: [],
          };
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
      carregarEventosCalendario();
    }, []),
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={[Estilos.container, { backgroundColor: tema.background }]}
    >
      <View style={Estilos.header}>
        <View style={Estilos.topRow}>
          <Text
            style={[
              Estilos.headerTitle,
              { color: tema.text, fontSize: 30 * escalaFonte },
            ]}
          >
            Calendário
          </Text>

          <BotaoAlerta />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={Estilos.legendaContainer}>
          <View style={Estilos.legendaItem}>
            <View style={[Estilos.quadrado, { backgroundColor: "#FFA64E" }]} />

            <Text
              style={[
                Estilos.legenda,
                { color: tema.text, fontSize: 15 * escalaFonte },
              ]}
            >
              Atrasada
            </Text>
          </View>

          <View style={Estilos.legendaItem}>
            <View style={[Estilos.quadrado, { backgroundColor: "#88C688" }]} />

            <Text
              style={[
                Estilos.legenda,
                { color: tema.text, fontSize: 15 * escalaFonte },
              ]}
            >
              Tarefa
            </Text>
          </View>

          <View style={Estilos.legendaItem}>
            <View style={[Estilos.quadrado, { backgroundColor: "#94C0DF" }]} />

            <Text
              style={[
                Estilos.legenda,
                { color: tema.text, fontSize: 15 * escalaFonte },
              ]}
            >
              Reunião
            </Text>
          </View>

          <View style={Estilos.legendaItem}>
            <View style={[Estilos.quadrado, { backgroundColor: "#9E82C0" }]} />

            <Text
              style={[
                Estilos.legenda,
                { color: tema.text, fontSize: 15 * escalaFonte },
              ]}
            >
              Avaliação
            </Text>
          </View>
        </View>

        <View
          style={[Estilos.calendarContainer, { backgroundColor: tema.card }]}
        >
          <Calendar
            key={`calendario-${escalaFonte}`}
            style={Estilos.calendar}
            renderArrow={(direction: "right" | "left") => (
              <Feather
                size={24}
                color="#000000"
                name={`chevron-${direction}`}
              />
            )}
            headerStyle={{
              paddingBottom: 10,
              marginBottom: 10,
            }}
            theme={
              {
                backgroundColor: "#fff",
                todayTextColor: "#fff",
                todayBackgroundColor: "#836F68",
                monthTextColor: "#000000",
                textDayFontSize: 14 * escalaFonte,
                textMonthFontSize: 16 * escalaFonte,
                textDayHeaderFontSize: 12 * escalaFonte,
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
                ["Estilosheet.day.basic"]: {
                  base: {
                    width: 40,
                    height: 40,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "#cdcdcd85",
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

      <Modal
        visible={modalEscolha}
        transparent
        animationType="fade"
        onRequestClose={() => setModalEscolha(false)}
      >
        <View style={Estilos.modalOverlay}>
          <View
            style={[Estilos.cardModalEscolha, { backgroundColor: tema.modal }]}
          >
            <Text
              style={[
                Estilos.tituloModal,
                { color: tema.text, fontSize: 20 * escalaFonte },
              ]}
            >
              O que você deseja fazer?
            </Text>

            <TouchableOpacity
              style={Estilos.botaoEscolha}
              onPress={() => {
                setModalEscolha(false);
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
                  { color: "#fff", fontSize: 16 * escalaFonte },
                ]}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalListaTarefas}
        transparent
        animationType="fade"
        onRequestClose={() => setModalListaTarefas(false)}
      >
        <View style={Estilos.modalOverlay}>
          <View
            style={[Estilos.cardModalEscolha, { backgroundColor: tema.modal }]}
          >
            <Text
              style={[
                Estilos.tituloModalLista,
                { color: tema.text, fontSize: 20 * escalaFonte },
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
                      { color: tema.text, fontSize: 16 * escalaFonte },
                    ]}
                  >
                    {tarefa.titulo}
                  </Text>

                  <Text
                    style={[
                      Estilos.tipoTarefa,
                      { color: tema.text, fontSize: 14 * escalaFonte },
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
                  { color: "#fff", fontSize: 16 * escalaFonte },
                ]}
              >
                Voltar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
              { text: "Cancelar", style: "cancel" },
              {
                text: "Excluir",
                style: "destructive",
                onPress: async () => {
                  await removerTarefa(tarefaSelecionada.id);
                  setModalDetalhes(false);
                  setTarefaSelecionada(null);
                },
              },
            ],
          );
        }}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[Estilos.modalOverlay, { paddingVertical: 16 }]}
        >
          <ScrollView
            style={[
              Estilos.cardModal,
              { backgroundColor: tema.modal, flexGrow: 0 },
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
                { color: tema.text, fontSize: 20 * escalaFonte },
              ]}
            >
              {editando ? "Editar Evento" : "Novo Evento"}
            </Text>

            <Text
              style={[
                Estilos.tipoTexto,
                { color: tema.text, fontSize: 14 * escalaFonte },
              ]}
            >
              Tipo
            </Text>

            <View style={Estilos.opcoesRow}>
              <TouchableOpacity
                style={Estilos.opcaoContainer}
                onPress={() => setTipoSelecionado("Tarefa")}
              >
                <View style={Estilos.radioExterno}>
                  {tipoSelecionado === "Tarefa" && (
                    <View style={Estilos.radioInterno} />
                  )}
                </View>

                <Text
                  style={[
                    Estilos.textoOpcao,
                    { color: tema.text, fontSize: 16 * escalaFonte },
                  ]}
                >
                  Tarefa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={Estilos.opcaoContainer}
                onPress={() => setTipoSelecionado("Reunião")}
              >
                <View style={Estilos.radioExterno}>
                  {tipoSelecionado === "Reunião" && (
                    <View style={Estilos.radioInterno} />
                  )}
                </View>

                <Text
                  style={[
                    Estilos.textoOpcao,
                    { color: tema.text, fontSize: 16 * escalaFonte },
                  ]}
                >
                  Reunião
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={Estilos.opcaoContainer}
                onPress={() => setTipoSelecionado("Avaliação")}
              >
                <View style={Estilos.radioExterno}>
                  {tipoSelecionado === "Avaliação" && (
                    <View style={Estilos.radioInterno} />
                  )}
                </View>

                <Text
                  style={[
                    Estilos.textoOpcao,
                    { color: tema.text, fontSize: 16 * escalaFonte },
                  ]}
                >
                  Avaliação
                </Text>
              </TouchableOpacity>
            </View>

            <View style={Estilos.infoTarefa}>
              <Text
                style={[
                  Estilos.titulosInfoTarefa,
                  { color: tema.text, fontSize: 14 * escalaFonte },
                ]}
              >
                Título
              </Text>

              <TextInput
                style={[
                  Estilos.textosInfo,
                  { color: tema.text, fontSize: 14 * escalaFonte },
                ]}
                placeholder="Nome do evento"
                placeholderTextColor={tema.placeholder}
                value={titulo}
                onChangeText={setTitulo}
              />

              <Text
                style={[
                  Estilos.titulosInfoTarefa,
                  { color: tema.text, fontSize: 14 * escalaFonte },
                ]}
              >
                Data Selecionada
              </Text>

              <TextInput
                style={[
                  Estilos.textosInfo,
                  { color: tema.text, fontSize: 14 * escalaFonte },
                ]}
                placeholder="dd/mm/aaaa"
                placeholderTextColor={tema.placeholder}
                value={data}
                onChangeText={alterarData}
                keyboardType="numeric"
                editable={editando}
              />

              <Text
                style={[
                  Estilos.titulosInfoTarefa,
                  { color: tema.text, fontSize: 14 * escalaFonte },
                ]}
              >
                Disciplina
              </Text>

              <TextInput
                style={[
                  Estilos.textosInfo,
                  { color: tema.text, fontSize: 14 * escalaFonte },
                ]}
                placeholder="Ex: Matemática"
                placeholderTextColor={tema.placeholder}
                value={disciplina}
                onChangeText={setDisciplina}
              />

              <Text
                style={[
                  Estilos.titulosInfoTarefa,
                  { color: tema.text, fontSize: 14 * escalaFonte },
                ]}
              >
                Professor
              </Text>

              <TextInput
                style={[
                  Estilos.textosInfo,
                  { color: tema.text, fontSize: 14 * escalaFonte },
                ]}
                placeholder="Nome do professor"
                placeholderTextColor={tema.placeholder}
                value={professor}
                onChangeText={setProfessor}
              />

              <Text
                style={[
                  Estilos.titulosInfoTarefa,
                  { color: tema.text, fontSize: 14 * escalaFonte },
                ]}
              >
                Plataforma de Realização (Opcional)
              </Text>

              <TextInput
                style={[
                  Estilos.textosInfo,
                  { color: tema.text, fontSize: 14 * escalaFonte },
                ]}
                placeholder="Ex: Google Classroom, Moodle"
                placeholderTextColor={tema.placeholder}
                value={plataforma}
                onChangeText={setPlataforma}
              />

              <Text
                style={[
                  Estilos.titulosInfoTarefa,
                  { color: tema.text, fontSize: 14 * escalaFonte },
                ]}
              >
                Descrição (Opcional)
              </Text>

              <TextInput
                style={[
                  Estilos.textosInfo,
                  { color: tema.text, fontSize: 14 * escalaFonte },
                ]}
                placeholder="Detalhes do evento"
                placeholderTextColor={tema.placeholder}
                value={descricao}
                onChangeText={setDescricao}
              />
            </View>

            <View
              style={[
                Estilos.botoesModal,
                botoesEmColuna && { flexDirection: "column" },
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
                onPress={() => {
                  setModalVisible(false);
                  setEditando(false);
                  setTitulo("");
                  setData("");
                  setDataInterna("");
                  setDisciplina("");
                  setProfessor("");
                  setPlataforma("");
                  setDescricao("");
                  setTipoSelecionado("");
                }}
              >
                <Text
                  style={[
                    Estilos.textoBotao,
                    { color: tema.textoBotao, fontSize: 16 * escalaFonte },
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
                  if (editando) {
                    const sucesso = await editarTarefa();

                    if (sucesso) {
                      setModalVisible(false);
                    }
                  } else {
                    const sucesso = await adicionarTarefa(tipoSelecionado);

                    if (sucesso) {
                      setModalVisible(false);
                    }
                  }
                }}
              >
                <Text
                  style={[
                    Estilos.textoBotao,
                    { color: tema.textoBotao, fontSize: 16 * escalaFonte },
                  ]}
                >
                  {editando ? "Salvar Alterações" : "Adicionar Evento"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}