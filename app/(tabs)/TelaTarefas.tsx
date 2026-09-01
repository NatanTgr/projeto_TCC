// Importando componentes e recursos
import { useState,  useCallback } from "react";
import { View, ScrollView, Text, TextInput, 
  Modal, TouchableOpacity, Alert,} from 'react-native';
import { useTheme } from "../../context/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
//import { router, Link } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Estilos from "../../Estilos/TelaTarefasEstilo";

// Definindo o tipo para uma tarefa
type Task = {
  id: string;
  title: string;
  data: string;
  disciplina: string;
  professor: string;
  tipo: string;
  plataforma: string;
  descricao: string;
  completed: boolean;

};


export default function ListaTarefas() {

  const { tema } = useTheme();
  const [tarefas, setTarefas] = useState<Task[]>([]);
  const [descricaoTarefa, setDescricaoTarefa] = useState('');

  const [modalVisivel, setModalVisivel] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState('');

  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [professor, setProfessor] = useState('');
  const [plataforma, setPlataforma] = useState('');
  const [descricao, setDescricao] = useState('');

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

    const novaTarefa: Task = {
      id: Date.now().toString(),
      title: titulo.trim(),
      data: dataInterna,
      disciplina: disciplina.trim(),
      professor: professor.trim(),
      tipo: tipoSelecionado,
      plataforma: plataforma.trim(),
      descricao: descricao.trim(),
      completed: false,
    };

    const json = await AsyncStorage.getItem("tarefas");
    const tarefasExistentes = json ? JSON.parse(json) : [];

    tarefasExistentes.push(novaTarefa);

    await AsyncStorage.setItem("tarefas", JSON.stringify(tarefasExistentes));

    setTarefas([...tarefas, novaTarefa]);

    setTitulo("");
    setData("");
    setDisciplina("");
    setProfessor("");
    setPlataforma("");
    setDescricao("");
    setTipoSelecionado("");

    console.log("Tarefa adicionada");

    return true;
  };;
  
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

    return '';
  };

  // Renderizar cada item da lista
  const renderizarTarefas = ({ item }: { item: Task }) => (
    <TouchableOpacity 
      style={[Estilos.cardEvento,
        { borderColor: getCorTipo(item.tipo)}, {backgroundColor: tema.card}
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
          {item.completed ? (
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          ) : (
            <Ionicons name="ellipse-outline" size={24} color="#ccc" />
          )}
        </TouchableOpacity>
     
        <Text
          style={[
            Estilos.tituloEvento,
            item.completed && Estilos.completedTaskText,
            {color: tema.text}
          ]}
        >
          {item.title}
        </Text>

        <View 
          style={[Estilos.badgeTipo,
            { backgroundColor: getCorTipo(item.tipo) }
          ]}
        >
          <Text style={Estilos.textoTipo}>
            {item.tipo}
          </Text>
        </View>
      </View>

      <Text style={[Estilos.textodataEvento,
        {color: tema.text}
      ]}>
        📅 {formatarData(item.data)}   📚 {item.disciplina}
      </Text>

      <Text style={[Estilos.textodataEvento,
        {color: tema.text}
      ]}>
        👨‍🏫 Prof. {item.professor}
      </Text>
      
    </TouchableOpacity>
  );


  // Alternar o status de conclusão de uma tarefa
  const alterarStatusTarefa = async (id: string) => {
    try {
      const json = await AsyncStorage.getItem("tarefas");

      if (!json) {
        return;
      }

      const tarefasSalvas: Task[] = JSON.parse(json);

      const novasTarefas = tarefasSalvas.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      );

      await AsyncStorage.setItem("tarefas", JSON.stringify(novasTarefas));

      setTarefas(novasTarefas);
    } catch (error) {
      console.log("Erro ao alterar status da tarefa:", error);
    }
  };


  // Remover uma tarefa
  const removerTarefa = (id: string) => {
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
              // Pega as tarefas salvas
              const json = await AsyncStorage.getItem("tarefas");

              if (!json) {
                return;
              }

              const tarefasSalvas: Task[] = JSON.parse(json);

              // Remove a tarefa pelo ID
              const novasTarefas = tarefasSalvas.filter(
                (task) => task.id !== id,
              );

              // Salva novamente no AsyncStorage
              await AsyncStorage.setItem(
                "tarefas",
                JSON.stringify(novasTarefas),
              );

              // Atualiza a lista da TelaTarefas
              setTarefas(novasTarefas);

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
  const tarefasCompletas = tarefas.filter(task => task.completed).length;


  // Salva as tarefas na memória interna
  //const storeData = async (conteudo: any) => {
    //try {
      //const jsonValue = JSON.stringify(conteudo);
      //await AsyncStorage.setItem('tarefas', jsonValue);
    //} catch (e) {
      //console.log(e);
    //}
  //};


  // Recupera as informações salvas
  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("tarefas");

      if (jsonValue !== null) {
        const tarefasSalvas: Task[] = JSON.parse(jsonValue);

        setTarefas(tarefasSalvas);
      } else {
        setTarefas([]);
      }
    } catch (error) {
      console.log("Erro ao carregar tarefas:", error);
    }
  };

  //converter data
  const converterData = (data: string) => {
    const [ano, mes, dia] = data.split("-");

    return new Date(
      Number(ano),
      Number(mes) - 1,
      Number(dia)
    );
  };

  //para o textInput da data funcionar
  const alterarData = (texto: string) => {
    let valor = texto.replace(/\D/g, "");

    if (valor.length > 8) valor = valor.slice(0, 8);

    if (valor.length > 4) {
      valor =
        valor.slice(0, 2) +
        "/" +
        valor.slice(2, 4) +
        "/" +
        valor.slice(4);
    } else if (valor.length > 2) {
      valor =
        valor.slice(0, 2) +
        "/" +
        valor.slice(2);
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
  if (tarefa.completed) {
    concluidas.push(tarefa);
    return;
  }
    const data = converterData(tarefa.data);

    data.setHours(0, 0, 0, 0);

    const diferencaDias =
      (data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);

    console.log(tarefa.data)

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
          <View key={item.id}>
            {renderizarTarefas({ item })}
          </View>
        ))}
      </View>
    );
  };

    // Toda vez que o app for iniciado os dados salvos serão carregados
    //useEffect(() => {
      //getData();
    //}, []);

    useFocusEffect(
      useCallback(() => {
        getData();
      }, []),
    );

   // Toda vez que lista de tarefas mudar, salvar localmente
    //useEffect(() => {
      //storeData(tarefas);
    //}, [tarefas]);


  return (
    <View style={[Estilos.container,
      {backgroundColor: tema.background,},
    ]}>
      {/* Cabeçalho */}
      <View style={Estilos.header}>
        <View style={Estilos.topRow}>
          <Text style={[Estilos.headerTitle,
            {color: tema.text}
          ]}>Minhas Tarefas</Text>

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
          <View style={[Estilos.cardModal,
          {backgroundColor: tema.modal}
          ]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[Estilos.tituloModal,
                {color: tema.text}
              ]}>Novo Evento</Text>

              <Text style={[Estilos.textoTipoAdicionar,
                {color: tema.text}
              ]}>Tipo</Text>

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

                  <Text style={[Estilos.textoOpcao,
                    {color: tema.text}
                  ]}>Tarefa</Text>
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

                  <Text style={[Estilos.textoOpcao,
                    {color: tema.text}
                  ]}>Reunião</Text>
                </TouchableOpacity>
              </View>

              {/*Colocar Textos*/}
              <View style={Estilos.infoTarefa}>
                <Text style={[Estilos.titulosInfoTarefa,
                  {color: tema.text}
                ]}>Título</Text>
                <TextInput
                  style={Estilos.textosInfo}
                  placeholder="Nome do evento"
                  value={titulo}
                  onChangeText={setTitulo}
                ></TextInput>

                <Text style={[Estilos.titulosInfoTarefa,
                  {color: tema.text}
                ]}>Data</Text>
                <TextInput
                  style={Estilos.textosInfo}
                  placeholder="dd/mm/aaaa"
                  value={data}
                  onChangeText={alterarData}
                  keyboardType="numeric"
                  maxLength={10}
                ></TextInput>

                <Text style={[Estilos.titulosInfoTarefa,
                  {color: tema.text}
                ]}>Disciplina</Text>
                <TextInput
                  style={Estilos.textosInfo}
                  placeholder="Ex: Matemática"
                  value={disciplina}
                  onChangeText={setDisciplina}
                ></TextInput>

                <Text style={[Estilos.titulosInfoTarefa,
                  {color: tema.text}
                ]}>Professor</Text>
                <TextInput
                  style={Estilos.textosInfo}
                  placeholder="Nome do professor"
                  value={professor}
                  onChangeText={setProfessor}
                ></TextInput>

                <Text style={[Estilos.titulosInfoTarefa,
                  {color: tema.text}
                ]}>
                  Plataforma de Realização
                </Text>
                <TextInput
                  style={Estilos.textosInfo}
                  placeholder="Ex: Google Classroom, Moodle"
                  value={plataforma}
                  onChangeText={setPlataforma}
                ></TextInput>

                <Text style={[Estilos.titulosInfoTarefa,
                  {color: tema.text}
                ]}>Descrição</Text>
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
                    setTipoSelecionado("");
                  }}
                >
                  <Text style={{ color: "#fff" }}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={Estilos.botaoConfirmar}
                  onPress={async () => {
                    const sucesso = await adicionarTarefa();

                    if (sucesso) {
                      setModalVisivel(false);
                    }
                  }}
                >
                  <Text style={{ color: "#ffffff" }}>Adicionar Evento</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={modalDetalhes} transparent animationType="fade">
        <View style={Estilos.modalOverlay}>
          <View style={[Estilos.cardModal,
            {backgroundColor: tema.modal}
          ]}>
            <Text style={[Estilos.tituloModal,
              {color: tema.text}
            ]}>Detalhes do Evento</Text>

            <Text>
              <Text style={{ fontWeight: "bold", color: tema.text }}>Título</Text>{" "}
              {tarefaSelecionada?.title}
            </Text>

            <Text>
              <Text style={{ fontWeight: "bold", color: tema.text }}>Data</Text>{" "}
              {formatarDataDetalhes()}
            </Text>

            <Text>
              <Text style={{ fontWeight: "bold", color: tema.text }}>Disciplina</Text>{" "}
              {tarefaSelecionada?.disciplina}
            </Text>

            <Text>
              <Text style={{ fontWeight: "bold", color: tema.text }}>Professor</Text>{" "}
              {tarefaSelecionada?.professor}
            </Text>

            <Text>
              <Text style={{ fontWeight: "bold", color: tema.text }}>Tipo</Text>{" "}
              {tarefaSelecionada?.tipo}
            </Text>

            <Text>
              <Text style={{ fontWeight: "bold", color: tema.text }}>Plataforma</Text>{" "}
              {tarefaSelecionada?.plataforma}
            </Text>

            <Text>
              <Text style={{ fontWeight: "bold", color: tema.text }}>Descrição</Text>{" "}
              {tarefaSelecionada?.descricao}
            </Text>

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
  );}

