import { Text, View, ScrollView, TextInput, Alert, TouchableOpacity, Modal, } from 'react-native';
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import { useState, useCallback, useEffect } from 'react';
import { testarLogin } from "../../bd/testarAuth";
import { Feather, Ionicons } from "@expo/vector-icons";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";
import { useFontSize } from "../../context/FontSizeContext";
import { useFocusEffect } from 'expo-router';
import Estilos from "../../Estilos/TelaCalendarioEstilo";
import BotaoAlerta from "../../components/BotaoAlerta";

import { ptBR } from "../../Utils/configCal"

LocaleConfig.locales["pt-br"] = ptBR
LocaleConfig.defaultLocale = "pt-br"

export default function TelaCalendario() {
  const { tema } = useTheme();
  const { escalaFonte } = useFontSize();

  const [editando, setEditando] = useState(false);

  // ========================================
// FUNÇÃO PARA VALIDAR DATA
// ========================================

const validarData = (data: string) => {
  const partes = data.split("-");

  if (partes.length !== 3) return false;

  const [ano, mes, dia] = partes;

  if (
    ano.length !== 4 ||
    mes.length !== 2 ||
    dia.length !== 2
  ) {
    return false;
  }

  const dataTeste = new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia)
  );

  return (
    dataTeste.getFullYear() === Number(ano) &&
    dataTeste.getMonth() === Number(mes) - 1 &&
    dataTeste.getDate() === Number(dia)
  );
};

// ========================================
// FUNÇÃO PARA CONVERTER DATA
// ========================================

const converterData = (data: string) => {
  const [ano, mes, dia] = data.split("-");

  return new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia)
  );
};

  // ========================================
  // FUNÇÃO PARA ABRIR A EDIÇÃO
  // ========================================

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

  // ========================================
  // FUNÇÃO PARA SALVAR A EDIÇÃO
  // ========================================

  const editarTarefa = async () => {
    if (
      !titulo.trim() ||
      !dataInterna.trim() ||
      !disciplina.trim() ||
      !professor.trim() ||
      !tipoSelecionado.trim() ||
      !plataforma.trim() ||
      !descricao.trim()
    ) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha todos os campos para editar o evento.",
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

      // Atualiza a tarefa selecionada
      setTarefaSelecionada(tarefaAtualizada);

      // Atualiza os pontos do calendário
      await carregarEventosCalendario();

      // Limpa os campos
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
  };;

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


  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [dataInterna, setDataInterna] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [professor, setProfessor] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [descricao, setDescricao] = useState("");

const adicionarTarefa = async (tipo: string) => {
  // Verifica se todos os campos foram preenchidos
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

  // Impede criar evento em data inválida
  if (!validarData(dataInterna)) {
    Alert.alert("Data inválida", "Digite uma data válida.");
    return false;
  }

  // Data de hoje
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataEvento = converterData(dataInterna);
  dataEvento.setHours(0, 0, 0, 0);

  // Impede criar evento em data passada
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
  }
};

  //selecionar dia
  const [selectedDay, setSelectedDay] = useState("");

  //marcar data
  const [markedDates, setMarkedDates] = useState<any>({});

  //não excluir esse const day
  const [day, setDay] = useState<DateData>();

  //aparecer modal quando clicar em um dia
  const [modalVisible, setModalVisible] = useState(false);

  //escolher tipo de tarefa
  const [tipoSelecionado, setTipoSelecionado] = useState("");

  //modal escolha descrição ou adicionar
  const [modalEscolha, setModalEscolha] = useState(false);

  //modal Lista de Tarefas para escolha
  const [modalListaTarefas, setModalListaTarefas] = useState(false);

  //modal detalhes da tarefa
  const [modalDetalhes, setModalDetalhes] = useState(false);

  //tarefas do dia selecionado
  const [tarefasDoDia, setTarefasDoDia] = useState<any[]>([]);

  //selecionar tarefa
  const [tarefaSelecionada, setTarefaSelecionada] = useState<any>(null);

  // CLICA NO DIA
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
        // Se já existem eventos nessa data,
        // mostra o modal com as duas opções
        setModalEscolha(true);
      } else {
        // Se não existe evento, abre diretamente
        // o modal de adicionar evento
        setModalVisible(true);
      }
    } catch (error) {
      console.log(error);
    }
  }

  //remover Tarefa
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

    console.log("Usuário encontrado no calendário:", user.id);

    const { data: tarefas, error } = await supabase
      .from("tarefas")
      .select("*")
      .eq("aluno_id", user.id);

      console.log("TAREFAS DO CALENDÁRIO:", tarefas);
      console.log("ERRO DAS TAREFAS:", error);

      if (error) {
        console.log("Erro ao carregar tarefas do calendário:", error);
        setMarkedDates({});
        return;
      }

      const datasMarcadas: any = {};

      // Data de hoje no formato AAAA-MM-DD
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

        let cor;

        // Se a tarefa estiver atrasada
        if (tarefa.data < dataHoje && !tarefa.concluido) {
          cor = "#FFA64E";
        }

        // Se for tarefa normal
        else if (tarefa.tipo === "Tarefa") {
          cor = "#88C688";
        }

        // Se for reunião normal
        else if (tarefa.tipo === "Reunião") {
          cor = "#94C0DF";
        }

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

  //formatar Data
  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  //salvar data da tarefa na tela Tarefa e fazer mostrar um DOT no calendário
  useFocusEffect(
    useCallback(() => {
      carregarEventosCalendario();
    }, []),
  );

  return (
    <View
      style={[
        Estilos.container,
        {
          backgroundColor: tema.background,
        },
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
            Calendário
          </Text>

          <BotaoAlerta />
        </View>
      </View>

      <View style={Estilos.legendaContainer}>
        <View style={Estilos.legendaItem}>
          <View style={[Estilos.quadrado, { backgroundColor: "#FFA64E" }]} />

          <Text
            style={[
              Estilos.legenda,
              {
                color: tema.text,
                fontSize: 15 * escalaFonte,
              },
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
              {
                color: tema.text,
                fontSize: 15 * escalaFonte,
              },
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
              {
                color: tema.text,
                fontSize: 15 * escalaFonte,
              },
            ]}
          >
            Reunião
          </Text>
        </View>
      </View>

      <View
        style={[
          Estilos.calendarContainer,
          {
            backgroundColor: tema.card,
          },
        ]}
      >
        <Calendar
          style={Estilos.calendar}
          renderArrow={(direction: "right" | "left") => (
            <Feather size={24} color="#000000" name={`chevron-${direction}`} />
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
          //minDate={new Date().toDateString()}
          hideExtraDays={true}
          onDayPress={handleDayPress}
          markingType={"multi-dot"}
          markedDates={markedDates}
        />
      </View>

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
                  {
                    fontSize: 16 * escalaFonte,
                  },
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
                  {
                    fontSize: 16 * escalaFonte,
                  },
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
                      borderColor:
                        tarefa.tipo === "Reunião" ? "#94C0DF" : "#88C688",
                    },
                    { backgroundColor: tema.card },
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

      <Modal
        visible={modalDetalhes}
        transparent
        animationType="fade"
        onRequestClose={() => setModalDetalhes(false)}
      >
        <View style={Estilos.modalOverlay}>
          <View style={[Estilos.cardModal, { backgroundColor: tema.modal }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={[
                  Estilos.tituloModal,
                  { color: tema.text, fontSize: 27 * escalaFonte },
                ]}
              >
                Detalhes do Evento
              </Text>

              <Text style={{ color: tema.text, fontSize: 16 * escalaFonte }}>
                <Text
                  style={[
                    Estilos.tituloDetalhe,
                    {
                      fontSize: 19 * escalaFonte,
                    },
                  ]}
                >
                  Título:
                </Text>{" "}
                <Text
                  style={[
                    Estilos.textoDetalhe,
                    {
                      fontSize: 16 * escalaFonte,
                    },
                  ]}
                >
                  {tarefaSelecionada?.titulo}
                </Text>
              </Text>

              <Text style={{ color: tema.text, fontSize: 16 * escalaFonte }}>
                <Text
                  style={[
                    Estilos.tituloDetalhe,
                    { fontSize: 19 * escalaFonte },
                  ]}
                >
                  Data:
                </Text>{" "}
                <Text
                  style={[Estilos.textoDetalhe, { fontSize: 16 * escalaFonte }]}
                >
                  {tarefaSelecionada
                    ? formatarData(tarefaSelecionada.data)
                    : ""}
                </Text>
              </Text>

              <Text style={{ color: tema.text, fontSize: 16 * escalaFonte }}>
                <Text
                  style={[
                    Estilos.tituloDetalhe,
                    { fontSize: 19 * escalaFonte },
                  ]}
                >
                  Disciplina:
                </Text>{" "}
                <Text
                  style={[Estilos.textoDetalhe, { fontSize: 16 * escalaFonte }]}
                >
                  {tarefaSelecionada?.disciplina}
                </Text>
              </Text>

              <Text style={{ color: tema.text, fontSize: 16 * escalaFonte }}>
                <Text
                  style={[
                    Estilos.tituloDetalhe,
                    { fontSize: 19 * escalaFonte },
                  ]}
                >
                  Professor:
                </Text>{" "}
                <Text
                  style={[Estilos.textoDetalhe, { fontSize: 16 * escalaFonte }]}
                >
                  {tarefaSelecionada?.professor}
                </Text>
              </Text>

              <Text style={{ color: tema.text, fontSize: 16 * escalaFonte }}>
                <Text
                  style={[
                    Estilos.tituloDetalhe,
                    { fontSize: 19 * escalaFonte },
                  ]}
                >
                  Tipo:
                </Text>{" "}
                <Text
                  style={[Estilos.textoDetalhe, { fontSize: 16 * escalaFonte }]}
                >
                  {tarefaSelecionada?.tipo}
                </Text>
              </Text>

              <Text style={{ color: tema.text, fontSize: 16 * escalaFonte }}>
                <Text
                  style={[
                    Estilos.tituloDetalhe,
                    { fontSize: 19 * escalaFonte },
                  ]}
                >
                  Plataforma:
                </Text>{" "}
                <Text
                  style={[Estilos.textoDetalhe, { fontSize: 16 * escalaFonte }]}
                >
                  {tarefaSelecionada?.plataforma}
                </Text>
              </Text>

              <Text style={{ color: tema.text, fontSize: 16 * escalaFonte }}>
                <Text
                  style={[
                    Estilos.tituloDetalhe,
                    { fontSize: 19 * escalaFonte },
                  ]}
                >
                  Descrição:
                </Text>{" "}
                <Text
                  style={[Estilos.textoDetalhe, { fontSize: 16 * escalaFonte }]}
                >
                  {tarefaSelecionada?.descricao}
                </Text>
              </Text>

              <TouchableOpacity
                style={Estilos.botaoConfirmar}
                onPress={abrirEdicao}
              >
                <Ionicons name="create-outline" size={20} color="#fff" />

                <Text
                  style={[
                    Estilos.textoBotao,
                    {
                      color: "#fff",
                      fontSize: 16 * escalaFonte,
                    },
                  ]}
                >
                  Editar Evento
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={Estilos.botaoConfirmarDetalhes}
                onPress={() => setModalDetalhes(false)}
              >
                <Text
                  style={[
                    Estilos.textoBotao,
                    { color: "#fff", fontSize: 16 * escalaFonte },
                  ]}
                >
                  Fechar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={Estilos.deleteButton}
                onPress={async () => {
                  if (tarefaSelecionada) {
                    await removerTarefa(tarefaSelecionada.id);

                    setModalDetalhes(false);
                    setTarefaSelecionada(null);

                    await carregarEventosCalendario();
                  }
                }}
              >
                <Feather name="trash-2" size={20} color="#ff3b30" />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={Estilos.modalOverlay}>
          <View style={[Estilos.cardModal, { backgroundColor: tema.modal }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
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
                  { color: tema.text, fontSize: 16 * escalaFonte },
                ]}
              >
                Tipo
              </Text>

              <View style={Estilos.opcoesRow}>
                {/* Opção Tarefa */}
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

                {/* Opção Reunião */}
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
              </View>

              {/*Colocar Textos*/}
              <View style={Estilos.infoTarefa}>
                <Text
                  style={[
                    Estilos.titulosInfoTarefa,
                    { color: tema.text, fontSize: 16 * escalaFonte },
                  ]}
                >
                  Título
                </Text>
                <TextInput
                  style={[Estilos.textosInfo, { fontSize: 16 * escalaFonte }]}
                  placeholder="Nome do evento"
                  value={titulo}
                  onChangeText={setTitulo}
                ></TextInput>

                <Text
                  style={[
                    Estilos.titulosInfoTarefa,
                    { color: tema.text, fontSize: 16 * escalaFonte },
                  ]}
                >
                  Data Selecionada
                </Text>
                <TextInput
                  style={[Estilos.textosInfo, { fontSize: 16 * escalaFonte }]}
                  placeholder="dd/mm/aaaa"
                  value={data}
                  onChangeText={alterarData}
                  keyboardType="numeric"
                  editable={editando}
                ></TextInput>

                <Text
                  style={[
                    Estilos.titulosInfoTarefa,
                    { color: tema.text, fontSize: 16 * escalaFonte },
                  ]}
                >
                  Disciplina
                </Text>
                <TextInput
                  style={[Estilos.textosInfo, { fontSize: 16 * escalaFonte }]}
                  placeholder="Ex: Matemática"
                  value={disciplina}
                  onChangeText={setDisciplina}
                ></TextInput>

                <Text
                  style={[
                    Estilos.titulosInfoTarefa,
                    { color: tema.text, fontSize: 16 * escalaFonte },
                  ]}
                >
                  Professor
                </Text>
                <TextInput
                  style={[Estilos.textosInfo, { fontSize: 16 * escalaFonte }]}
                  placeholder="Nome do professor"
                  value={professor}
                  onChangeText={setProfessor}
                ></TextInput>

                <Text
                  style={[
                    Estilos.titulosInfoTarefa,
                    { color: tema.text, fontSize: 16 * escalaFonte },
                  ]}
                >
                  Plataforma de Realização
                </Text>
                <TextInput
                  style={[Estilos.textosInfo, { fontSize: 16 * escalaFonte }]}
                  placeholder="Ex: Google Classroom, Moodle"
                  value={plataforma}
                  onChangeText={setPlataforma}
                ></TextInput>

                <Text
                  style={[
                    Estilos.titulosInfoTarefa,
                    { color: tema.text, fontSize: 16 * escalaFonte },
                  ]}
                >
                  Descrição
                </Text>
                <TextInput
                  style={[Estilos.textosInfo, { fontSize: 16 * escalaFonte }]}
                  placeholder="Detalhes do evento"
                  value={descricao}
                  onChangeText={setDescricao}
                ></TextInput>
              </View>

              {/* Botões */}
              <View style={Estilos.botoesModal}>
                <TouchableOpacity
                  style={Estilos.botaoCancelar}
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
                      { color: "#fff", fontSize: 16 * escalaFonte },
                    ]}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={Estilos.botaoConfirmar}
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
                      { color: "#fff", fontSize: 16 * escalaFonte },
                    ]}
                  >
                    {editando ? "Salvar Alterações" : "Adicionar Evento"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}