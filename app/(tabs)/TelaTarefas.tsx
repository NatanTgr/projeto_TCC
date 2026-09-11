// Importando componentes e recursos
import { useState,  useCallback } from "react";
import { View, ScrollView, Text, TextInput, 
  Modal, TouchableOpacity, Alert,} from 'react-native';
import { useTheme } from "../../context/ThemeContext";
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
//import { router, Link } from 'expo-router';
import Estilos from "../../Estilos/TelaTarefasEstilo";
import { supabase } from "../../bd/supabase";

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
};

export default function ListaTarefas() {
  
  const { alunoId: alunoIdParametro } = useLocalSearchParams<{ alunoId?: string }>();

  const alunoId = Array.isArray(alunoIdParametro)
    ? alunoIdParametro[0]
    : alunoIdParametro;

  const { tema } = useTheme();
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
      !tipoSelecionado.trim() ||
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

    setTarefas([...tarefas, tarefaSalva]);

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
            { color: tema.text },
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
          <Text style={Estilos.textoTipo}>{item.tipo}</Text>
        </View>
      </View>

      <Text style={[Estilos.textodataEvento, { color: tema.text }]}>
        📅 {formatarData(item.data)} 📚 {item.disciplina}
      </Text>

      <Text style={[Estilos.textodataEvento, { color: tema.text }]}>
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
    } = await supabase.auth.getUser();

    if (!user && !alunoId) {
      console.log("Nenhum usuário ou aluno selecionado.");
      setTarefas([]);
      return;
    }

    // Se recebeu um alunoId, usa o aluno selecionado.
    // Caso contrário, usa o próprio usuário logado.
    const idAluno = alunoId || user?.id;

    if (!idAluno) {
      setTarefas([]);
      return;
    }

    const { data: tarefasSalvas, error } = await supabase
      .from("tarefas")
      .select("*")
      .eq("aluno_id", idAluno)
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
          style={{
            fontSize: 22,
            fontWeight: "bold",
            marginBottom: 10,
            marginLeft: 5,
          }}
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
    }, [alunoId]),
  );

  // Toda vez que lista de tarefas mudar, salvar localmente
  //useEffect(() => {
  //storeData(tarefas);
  //}, [tarefas]);

  return (
    <View style={[Estilos.container, { backgroundColor: tema.background }]}>
      {/* Cabeçalho */}
      <View style={Estilos.header}>
        <View style={Estilos.topRow}>
          <Text style={[Estilos.headerTitle, { color: tema.text }]}>
            Minhas Tarefas
          </Text>

          <TouchableOpacity
            style={Estilos.addButton}
            onPress={() => setModalVisivel(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={Estilos.taskCount}>
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
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[Estilos.tituloModal, { color: tema.text }]}>
                Novo Evento
              </Text>

              <Text style={[Estilos.textoTipoAdicionar, { color: tema.text }]}>
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

                  <Text style={[Estilos.textoOpcao, { color: tema.text }]}>
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

                  <Text style={[Estilos.textoOpcao, { color: tema.text }]}>
                    Reunião
                  </Text>
                </TouchableOpacity>
              </View>

              {/*Colocar Textos*/}
              <View style={Estilos.infoTarefa}>
                <Text style={[Estilos.titulosInfoTarefa, { color: tema.text }]}>
                  Título
                </Text>
                <TextInput
                  style={Estilos.textosInfo}
                  placeholder="Nome do evento"
                  value={titulo}
                  onChangeText={setTitulo}
                ></TextInput>

                <Text style={[Estilos.titulosInfoTarefa, { color: tema.text }]}>
                  Data
                </Text>
                <TextInput
                  style={Estilos.textosInfo}
                  placeholder="dd/mm/aaaa"
                  value={data}
                  onChangeText={alterarData}
                  keyboardType="numeric"
                  maxLength={10}
                ></TextInput>

                <Text style={[Estilos.titulosInfoTarefa, { color: tema.text }]}>
                  Disciplina
                </Text>
                <TextInput
                  style={Estilos.textosInfo}
                  placeholder="Ex: Matemática"
                  value={disciplina}
                  onChangeText={setDisciplina}
                ></TextInput>

                <Text style={[Estilos.titulosInfoTarefa, { color: tema.text }]}>
                  Professor
                </Text>
                <TextInput
                  style={Estilos.textosInfo}
                  placeholder="Nome do professor"
                  value={professor}
                  onChangeText={setProfessor}
                ></TextInput>

                <Text style={[Estilos.titulosInfoTarefa, { color: tema.text }]}>
                  Plataforma de Realização
                </Text>
                <TextInput
                  style={Estilos.textosInfo}
                  placeholder="Ex: Google Classroom, Moodle"
                  value={plataforma}
                  onChangeText={setPlataforma}
                ></TextInput>

                <Text style={[Estilos.titulosInfoTarefa, { color: tema.text }]}>
                  Descrição
                </Text>
                <TextInput
                  style={Estilos.textosInfo}
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
                  <Text style={{ color: "#fff" }}>Cancelar</Text>
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
                  <Text style={{ color: "#ffffff" }}>{textoBotao}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={modalDetalhes} transparent animationType="fade">
        <View style={Estilos.modalOverlay}>
          <View style={[Estilos.cardModal, { backgroundColor: tema.modal }]}>
            <Text style={[Estilos.tituloModal, { color: tema.text }]}>
              Detalhes do Evento
            </Text>

            <Text>
              <Text style={{ fontWeight: "bold", color: tema.text }}>
                Título
              </Text>{" "}
              {tarefaSelecionada?.titulo}
            </Text>

            <Text>
              <Text style={{ fontWeight: "bold", color: tema.text }}>Data</Text>{" "}
              {formatarDataDetalhes()}
            </Text>

            <Text>
              <Text style={{ fontWeight: "bold", color: tema.text }}>
                Disciplina
              </Text>{" "}
              {tarefaSelecionada?.disciplina}
            </Text>

            <Text>
              <Text style={{ fontWeight: "bold", color: tema.text }}>
                Professor
              </Text>{" "}
              {tarefaSelecionada?.professor}
            </Text>

            <Text>
              <Text style={{ fontWeight: "bold", color: tema.text }}>Tipo</Text>{" "}
              {tarefaSelecionada?.tipo}
            </Text>

            <Text>
              <Text style={{ fontWeight: "bold", color: tema.text }}>
                Plataforma
              </Text>{" "}
              {tarefaSelecionada?.plataforma}
            </Text>

            <Text>
              <Text style={{ fontWeight: "bold", color: tema.text }}>
                Descrição
              </Text>{" "}
              {tarefaSelecionada?.descricao}
            </Text>

            <TouchableOpacity
              style={Estilos.botaoConfirmar}
              onPress={abrirEdicao}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />

              <Text style={{ color: "#fff", marginLeft: 8 }}>
                Editar Evento
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={Estilos.botaoConfirmar}
              onPress={() => setModalDetalhes(false)}
            >
              <Text style={{ color: "#fff" }}>Fechar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={Estilos.deleteButton}
              onPress={() => {
                if (tarefaSelecionada) {
                  removerTarefa(tarefaSelecionada.id);
                  setModalDetalhes(false);
                }
              }}
            >
              <Ionicons name="trash-outline" size={20} color="#ff3b30" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

