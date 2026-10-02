// Importando componentes e recursos
import { useState,  useCallback, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, ScrollView, Text, TextInput, 
  Modal, TouchableOpacity, Alert, Keyboard} from 'react-native';
import { Calendar, LocaleConfig, DateData } from "react-native-calendars";
import { useTheme } from "../../context/ThemeContext";
import { useFontSize } from "../../context/FontSizeContext";
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Estilos from "../../Estilos/TelaTarefasEstilo";
import { supabase } from "../../bd/supabase";
import BotaoAlerta from "../../components/BotaoAlerta";
import ModalDetalhesTarefa from "../../components/ModalDetalhesTarefa";
import { ptBR } from "../../Utils/configCal";

// Definindo o tipo para uma tarefa
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
  criado_por : string | null;
};

export default function ListaTarefas() {
  const { alunoId } = useLocalSearchParams<{ alunoId?: string }>();

  const { tema } = useTheme();
  const { escalaFonte } = useFontSize();
  const [tarefas, setTarefas] = useState<Task[]>([]);
  const [descricaoTarefa, setDescricaoTarefa] = useState("");
  const [editando, setEditando] = useState(false);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState("");

  const [titulo, setTitulo] = useState("");
  const [data, setData] = useState("");
  const [disciplina, setDisciplina] = useState("");
  const [professor, setProfessor] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [descricao, setDescricao] = useState("");

  //modal quando clica no card
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [tarefaSelecionada, setTarefaSelecionada] = useState<Task | null>(null);

  const validarData = (data: string) => {
    const partes = data.split("-");

    if (partes.length !== 3) {
      return false;
    }

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

  // Adicionar uma nova tarefa
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

    // Data de hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Data informada pelo usuário
    const dataEvento = converterData(dataInterna);
    dataEvento.setHours(0, 0, 0, 0);

    // Impede data passada
    if (dataEvento < hoje) {
      Alert.alert(
        "Data inválida",
        "Não é possível criar um evento em uma data que já passou.",
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

    setTitulo("");
    setData("");
    setDisciplina("");
    setProfessor("");
    setPlataforma("");
    setDescricao("");
    setTipoSelecionado("");

    console.log("Tarefa adicionada");

    return true;
  };

  const getCorTipo = (tipo: string) => {
    switch (tipo) {
      case "Tarefa":
        return "#88C688"; // verde
      case "Reunião":
        return "#94C0DF"; // azul
      default:
        return "#94C0DF";
    }
  };

  //Formata a data
  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  //formatar data no Modal Detalhes
  const formatarDataDetalhes = () => {
    if (tarefaSelecionada) {
      return formatarData(tarefaSelecionada.data);
    }

    return "";
  };

  // Renderizar cada item da lista
  const renderizarTarefas = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={[
        Estilos.cardEvento,
        { borderColor: getCorTipo(item.tipo) },
        { backgroundColor: tema.card },
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
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          ) : (
            <Ionicons name="ellipse-outline" size={24} color="#ccc" />
          )}
        </TouchableOpacity>

        <Text
          style={[
            Estilos.tituloEvento,
            item.concluido && Estilos.completedTaskText,
            { color: tema.text, fontSize: 18 * escalaFonte },
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
          <Text style={[Estilos.textoTipo, { fontSize: 14 * escalaFonte }]}>
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
    </TouchableOpacity>
  );

  // Alternar o status de conclusão de uma tarefa
  const alterarStatusTarefa = async (id: number) => {
    try {
      // Encontra a tarefa que foi selecionada
      const tarefa = tarefas.find((task) => task.id === id);

      if (!tarefa) {
        return;
      }

      // Inverte o status atual
      const novoStatus = !tarefa.concluido;

      // Atualiza a tarefa no Supabase
      const { error } = await supabase
        .from("tarefas")
        .update({
          concluido: novoStatus,
        })
        .eq("id", id);

      if (error) {
        console.log("Erro ao alterar status da tarefa:", error);
        Alert.alert("Erro", "Não foi possível alterar o status da tarefa.");
        return;
      }

      // Atualiza a lista na tela
      setTarefas(
        tarefas.map((task) =>
          task.id === id ? { ...task, concluido: novoStatus } : task,
        ),
      );
    } catch (error) {
      console.log("Erro ao alterar status da tarefa:", error);
    }
  };

  // Remover uma tarefa
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
              // Remove a tarefa do Supabase
              const { error } = await supabase
                .from("tarefas")
                .delete()
                .eq("id", id);

              if (error) {
                console.log("Erro ao remover tarefa:", error);
                Alert.alert("Erro", "Não foi possível remover a tarefa.");
                return;
              }

              // Remove a tarefa da lista que está na tela
              setTarefas(tarefas.filter((task) => task.id !== id));

              // Fecha o modal
              setModalDetalhes(false);
              setTarefaSelecionada(null);
            } catch (error) {
              console.log("Erro ao remover tarefa:", error);
            }
          },
        },
      ],
    );
  };

  // Contadores para estatísticas
  const totalTarefas = tarefas.length;
  const tarefasCompletas = tarefas.filter((task) => task.concluido).length;

  const getData = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.log("Erro ao obter usuário logado:", authError);
        setTarefas([]);
        return;
      }

      if (!user) {
        console.log("Nenhum usuário está logado.");
        setTarefas([]);
        return;
      }

      console.log("Carregando tarefas do usuário:", user.id);

      const { data: tarefasSalvas, error } = await supabase
        .from("tarefas")
        .select("*")
        .eq("aluno_id", alunoId || user.id)
        .order("data", { ascending: true });

      if (error) {
        console.log("Erro ao carregar tarefas:", error);
        return;
      }

      setTarefas(tarefasSalvas || []);
    } catch (error) {
      console.log("Erro ao carregar tarefas:", error);
    }
  };

  //converter data
  const converterData = (data: string) => {
    const [ano, mes, dia] = data.split("-");

    return new Date(Number(ano), Number(mes) - 1, Number(dia));
  };

  //para o textInput da data funcionar
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

  //o que sera salvo
  const [dataInterna, setDataInterna] = useState("");

  const [calendarioDataAberto, setCalendarioDataAberto] = useState(false);

  // Usa a data local do aparelho, evitando mudança de dia pelo fuso UTC.
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
    // Preserva a regra existente de impedir datas passadas.
    if (dia.dateString < hojeCalendario) return;

    const [ano, mes, diaNumero] = dia.dateString.split("-");

    setData(`${diaNumero}/${mes}/${ano}`);
    setDataInterna(dia.dateString);
    setCalendarioDataAberto(false);
  };

  useEffect(() => {
    setCalendarioDataAberto(false);
  }, [modalVisivel]);

  //cria a data de hoje
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  //cria os quatro arrays
  const atrasadas: Task[] = [];
  const hojeLista: Task[] = [];
  const semana: Task[] = [];
  const proximas: Task[] = [];
  const concluidas: Task[] = [];

  //separar as tarefas
  tarefas.forEach((tarefa) => {
    // Se estiver concluída, vai direto para a lista de concluídas
    if (tarefa.concluido) {
      concluidas.push(tarefa);
      return;
    }
    const data = converterData(tarefa.data);

    data.setHours(0, 0, 0, 0);

    const diferencaDias =
      (data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);

    console.log(tarefa.data);

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
    setModalVisivel(true);
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
      // Atualiza a tarefa no Supabase
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

      // Atualiza a tarefa na lista da tela
      setTarefas(
        tarefas.map((task) =>
          task.id === tarefaSelecionada.id ? tarefaAtualizada : task,
        ),
      );

      // Atualiza a tarefa selecionada no modal
      setTarefaSelecionada(tarefaAtualizada);

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
  };

  //funçao para  renderizar cada seção
  const renderizarSecao = (titulo: string, dados: Task[]) => {
    if (dados.length === 0) return null;

    return (
      <View style={{ marginBottom: 20 }}>
        <Text
          style={[
            Estilos.tituloSecao,
            { color: tema.text, fontSize: 22 * escalaFonte },
          ]}
        >
          {titulo}
        </Text>

        {dados.map((item) => (
          <View key={item.id}>{renderizarTarefas({ item })}</View>
        ))}
      </View>
    );
  };

  let textoBotao = "Adicionar Evento";

  if (editando) {
    textoBotao = "Salvar Alterações";
  }

  useFocusEffect(
    useCallback(() => {
      getData();
    }, []),
  );

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
              { color: tema.text, fontSize: 30 * escalaFonte },
            ]}
          >
            Minhas Tarefas
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              alignSelf: "flex-end",
            }}
          >
            {/* Botão ALERTA */}
            <BotaoAlerta />
            <TouchableOpacity
              style={Estilos.addButton}
              onPress={() => setModalVisivel(true)}
            >
              <Ionicons name="add" size={24} color="white" />
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

      {/* Area com a lista de tarefas */}
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
          <Ionicons name="checkmark-done-outline" size={64} color="#e0e0e0" />
          <Text style={Estilos.emptyStateText}>Nenhuma tarefa adicionada</Text>
          <Text style={Estilos.emptyStateSubtext}>
            Adicione uma tarefa para começar!
          </Text>
        </View>
      )}

      <Modal transparent={true} visible={modalVisivel} animationType="fade">
        <View style={Estilos.modalOverlay}>
          <View style={[Estilos.cardModal, { backgroundColor: tema.modal }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={Estilos.modalContent}
              keyboardShouldPersistTaps="handled"
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
                  Estilos.textoTipoAdicionar,
                  { color: tema.text, fontSize: 14 * escalaFonte },
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
                  Data
                </Text>
                <TouchableOpacity
                  onPress={abrirCalendarioData}
                  accessibilityRole="button"
                  accessibilityLabel={
                    data ? `Alterar data: ${data}` : "Selecionar data do evento"
                  }
                  accessibilityState={{ expanded: calendarioDataAberto }}
                  style={[
                    Estilos.textosInfo,
                    Estilos.campoData,
                    { backgroundColor: tema.card },
                  ]}
                >
                  <Text
                    style={{
                      color: tema.text,
                      fontSize: 16 * escalaFonte,
                      flex: 1,
                      flexShrink: 1,
                    }}
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
                      { backgroundColor: tema.card },
                    ]}
                  >
                    <Calendar
                      key={`seletor-data-${escalaFonte}-${tema.background}`}
                      current={
                        dataInterna && dataInterna >= hojeCalendario
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
                      onPress={() => setCalendarioDataAberto(false)}
                      accessibilityRole="button"
                      style={Estilos.botaoFecharCalendario}
                    >
                      <Text
                        style={{
                          color: tema.text,
                          fontSize: 14 * escalaFonte,
                          textAlign: "center",
                        }}
                      >
                        Fechar calendário
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

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
                  Plataforma de Realização
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
                  Descrição
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

              {/* Botões */}
              <View style={Estilos.botoesModal}>
                <TouchableOpacity
                  style={Estilos.botaoCancelar}
                  onPress={() => {
                    setModalVisivel(false);
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
                  style={Estilos.botaoConfirmar}
                  onPress={async () => {
                    if (editando) {
                      const sucesso = await editarTarefa();

                      if (sucesso) {
                        setModalVisivel(false);
                      }
                    } else {
                      const sucesso = await adicionarTarefa();

                      if (sucesso) {
                        setModalVisivel(false);
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
                    {textoBotao}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    </SafeAreaView>
  );
}