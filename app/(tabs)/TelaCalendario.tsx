import { Text, View, ScrollView, TextInput, Alert, TouchableOpacity, Modal, } from 'react-native';
import { Calendar, DateData, LocaleConfig } from "react-native-calendars";
import { useState, useCallback } from 'react';
//import { router, Link } from 'expo-router';
import { Feather } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from "../../context/ThemeContext";
import { useFocusEffect } from '@react-navigation/native';
import Estilos from "../../Estilos/TelaCalendarioEstilo";

import { ptBR } from "../../Utils/configCal"

LocaleConfig.locales["pt-br"] = ptBR
LocaleConfig.defaultLocale = "pt-br"

export default function TelaCalendario() {

  const { tema } = useTheme();

  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [disciplina, setDisciplina] = useState('');
  const [professor, setProfessor] = useState('');
  const [plataforma, setPlataforma] = useState('');
  const [descricao, setDescricao] = useState('');

  const adicionarTarefa = async (tipo: string) => {
    // Verifica se todos os campos foram preenchidos
    if (
      !titulo.trim() ||
      !data.trim() ||
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
      return;
    }

    // Data de hoje no formato AAAA-MM-DD
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    const dataHoje = `${ano}-${mes}-${dia}`;

    // Impede criar evento em data passada
    if (data < dataHoje) {
      Alert.alert(
        "Data inválida",
        "Não é possível criar um evento em uma data que já passou.",
      );
      return;
    }

    const novaTarefa = {
      id: Date.now().toString(),
      title: titulo.trim(),
      data,
      disciplina: disciplina.trim(),
      professor: professor.trim(),
      tipo,
      plataforma: plataforma.trim(),
      descricao: descricao.trim(),
      completed: false,
    };

    const json = await AsyncStorage.getItem("tarefas");

    const tarefasExistentes = json ? JSON.parse(json) : [];

    tarefasExistentes.push(novaTarefa);

    await AsyncStorage.setItem("tarefas", JSON.stringify(tarefasExistentes));

    await carregarEventosCalendario();

    setTitulo("");
    setDisciplina("");
    setProfessor("");
    setPlataforma("");
    setDescricao("");
    setTipoSelecionado("");

    return true;
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
  const [tipoSelecionado, setTipoSelecionado] = useState('');

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
    setData(day.dateString);
    
    try {
      const json = await AsyncStorage.getItem("tarefas");
      const tarefas = json ? JSON.parse(json) : [];

      const tarefasDoDiaSelecionado = tarefas.filter(
        (tarefa: any) => tarefa.data === day.dateString
      );

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
  const removerTarefa = async (id: string) => {
    try {
      const json = await AsyncStorage.getItem("tarefas");

      if (!json) {
        return;
      }

      const tarefas = JSON.parse(json);

      const novasTarefas = tarefas.filter((tarefa: any) => tarefa.id !== id);

      await AsyncStorage.setItem("tarefas", JSON.stringify(novasTarefas));

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
      const json = await AsyncStorage.getItem("tarefas");

      if (!json) {
        setMarkedDates({});
        return;
      }

      const tarefas = JSON.parse(json);
      const datasMarcadas: any = {};

      // Data de hoje no formato AAAA-MM-DD
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const ano = hoje.getFullYear();
      const mes = String(hoje.getMonth() + 1).padStart(2, "0");
      const dia = String(hoje.getDate()).padStart(2, "0");

      const dataHoje = `${ano}-${mes}-${dia}`;

      tarefas.forEach((tarefa: any) => {
        if (!tarefa.data) {
          return;
        }

        let cor;

        // Se a tarefa estiver atrasada
        if (tarefa.data < dataHoje && !tarefa.completed) {
          cor = "#FFA64E"; // laranja - atrasada
        }
        // Se for tarefa normal
        else if (tarefa.tipo === "Tarefa") {
          cor = "#88C688"; // verde
        }
        // Se for reunião normal
        else if (tarefa.tipo === "Reunião") {
          cor = "#94C0DF"; // azul
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
    }, [])
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
      <Text
        style={[
          Estilos.titulo,
          {
            color: tema.text,
          },
        ]}
      >
        Calendário
      </Text>

      <View style={Estilos.legendaContainer}>
        <View style={Estilos.legendaItem}>
          <View style={[Estilos.quadrado, { backgroundColor: "#FFA64E" }]} />

          <Text
            style={[
              Estilos.legenda,
              {
                color: tema.text,
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
            <Text style={[Estilos.tituloModal, { color: tema.text }]}>
              O que você deseja fazer?
            </Text>

            <TouchableOpacity
              style={Estilos.botaoEscolha}
              onPress={() => {
                setModalEscolha(false);
                setModalVisible(true);
              }}
            >
              <Text style={Estilos.textoBotaoEscolha}>Adicionar Evento</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={Estilos.botaoEscolha}
              onPress={() => {
                setModalEscolha(false);
                setModalListaTarefas(true);
              }}
            >
              <Text style={Estilos.textoBotaoEscolha}>Detalhes da Tarefa</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={Estilos.botaoCancelarEscolha}
              onPress={() => setModalEscolha(false)}
            >
              <Text style={{ color: "#fff" }}>Cancelar</Text>
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
            <Text style={[Estilos.tituloModalLista, { color: tema.text }]}>
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
                  ]}
                  onPress={() => {
                    setTarefaSelecionada(tarefa);
                    setModalListaTarefas(false);
                    setModalDetalhes(true);
                  }}
                >
                  <Text style={[Estilos.tituloTarefa, { color: tema.text }]}>
                    {tarefa.title}
                  </Text>

                  <Text style={[Estilos.tipoTarefa, { color: tema.text }]}>
                    {tarefa.tipo}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={Estilos.botaoCancelarEscolha}
              onPress={() => setModalListaTarefas(false)}
            >
              <Text style={{ color: "#fff" }}>Voltar</Text>
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
              <Text style={[Estilos.tituloModal, { color: tema.text }]}>
                Detalhes do Evento
              </Text>

              <Text style={{ color: tema.text }}>
                <Text style={{ fontWeight: "bold" }}>Título</Text>{" "}
                {tarefaSelecionada?.title}
              </Text>

              <Text style={{ color: tema.text }}>
                <Text style={{ fontWeight: "bold" }}>Data</Text>{" "}
                {tarefaSelecionada ? formatarData(tarefaSelecionada.data) : ""}
              </Text>

              <Text style={{ color: tema.text }}>
                <Text style={{ fontWeight: "bold" }}>Disciplina</Text>{" "}
                {tarefaSelecionada?.disciplina}
              </Text>

              <Text style={{ color: tema.text }}>
                <Text style={{ fontWeight: "bold" }}>Professor</Text>{" "}
                {tarefaSelecionada?.professor}
              </Text>

              <Text style={{ color: tema.text }}>
                <Text style={{ fontWeight: "bold" }}>Tipo</Text>{" "}
                {tarefaSelecionada?.tipo}
              </Text>

              <Text style={{ color: tema.text }}>
                <Text style={{ fontWeight: "bold" }}>Plataforma</Text>{" "}
                {tarefaSelecionada?.plataforma}
              </Text>

              <Text style={{ color: tema.text }}>
                <Text style={{ fontWeight: "bold" }}>Descrição</Text>{" "}
                {tarefaSelecionada?.descricao}
              </Text>

              <TouchableOpacity
                style={Estilos.botaoConfirmarDetalhes}
                onPress={() => setModalDetalhes(false)}
              >
                <Text style={{ color: "#fff" }}>Fechar</Text>
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
              <Text style={[Estilos.tituloModal, { color: tema.text }]}>
                Novo Evento
              </Text>

              <Text style={[Estilos.tipoTexto, { color: tema.text }]}>
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
                  Data Selecionada
                </Text>
                <TextInput
                  style={Estilos.textosInfo}
                  value={formatarData(data)}
                  editable={false}
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
                    setModalVisible(false);
                    setTipoSelecionado("");
                  }}
                >
                  <Text style={{ color: "#fff" }}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={Estilos.botaoConfirmar}
                  onPress={async () => {
                    const sucesso = await adicionarTarefa(tipoSelecionado);

                    if (sucesso) {
                      setModalVisible(false);
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
    </View>
  );
}