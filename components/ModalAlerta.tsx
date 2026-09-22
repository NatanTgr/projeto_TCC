import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Feather } from "@expo/vector-icons";

import { supabase } from "../bd/supabase";
import { useTheme } from "../context/ThemeContext";
import { useFontSize } from "../context/FontSizeContext";

type PropriedadesModalAlerta = {
  visivel: boolean;
  aoFechar: () => void;
};

type DadosEstudante = {
  id: string;
  nome: string;
  curso: string;
  turno: string;
  turma: string;
  estado: string;
  campus: string;
};

type Tutor = {
  id: string;
  nome: string;
};

export default function ModalAlerta({
  visivel,
  aoFechar,
}: PropriedadesModalAlerta) {
  const { tema } = useTheme();
  const { escalaFonte } = useFontSize();

  const [estudante, setEstudante] =
    useState<DadosEstudante | null>(null);

  const [tutores, setTutores] = useState<Tutor[]>([]);
  const [tutorSelecionado, setTutorSelecionado] =
    useState<string | null>(null);

  const [localCampus, setLocalCampus] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const limparFormulario = () => {
    setTutorSelecionado(null);
    setLocalCampus("");
  };

  const fecharModal = () => {
    if (enviando) {
      return;
    }

    limparFormulario();
    aoFechar();
  };

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setEstudante(null);
      setTutores([]);
      limparFormulario();

      const {
        data: { user },
        error: erroAuth,
      } = await supabase.auth.getUser();

      if (erroAuth || !user) {
        throw new Error(
          "Não foi possível identificar o usuário logado.",
        );
      }

      const { data: usuario, error: erroUsuario } =
        await supabase
          .from("usuarios")
          .select("id, nome, tipo, estado, campus")
          .eq("id", user.id)
          .single();

      if (erroUsuario || !usuario) {
        throw new Error(
          erroUsuario?.message ||
            "Não foi possível carregar o usuário.",
        );
      }

      if (usuario.tipo !== "estudante") {
        throw new Error(
          "O botão de alerta está disponível somente para estudantes.",
        );
      }

      if (!usuario.estado || !usuario.campus) {
        throw new Error(
          "O estado ou campus do estudante não está preenchido.",
        );
      }

      const { data: aluno, error: erroAluno } =
        await supabase
          .from("alunos")
          .select("curso, turno, turma")
          .eq("id", user.id)
          .single();

      if (erroAluno || !aluno) {
        throw new Error(
          erroAluno?.message ||
            "Não foi possível carregar os dados do estudante.",
        );
      }

      setEstudante({
        id: user.id,
        nome: usuario.nome,
        curso: aluno.curso,
        turno: aluno.turno,
        turma: aluno.turma,
        estado: usuario.estado,
        campus: usuario.campus,
      });

      const { data: tutoresEncontrados, error: erroTutores } =
        await supabase
          .from("usuarios")
          .select("id, nome")
          .eq("tipo", "tutor")
          .eq("estado", usuario.estado)
          .eq("campus", usuario.campus)
          .order("nome", { ascending: true });

      if (erroTutores) {
        throw new Error(erroTutores.message);
      }

      setTutores(tutoresEncontrados || []);
    } catch (erro) {
      console.log("Erro ao carregar modal de alerta:", erro);

      const mensagem =
        erro instanceof Error
          ? erro.message
          : "Não foi possível carregar o alerta.";

      Alert.alert("Erro", mensagem);
      aoFechar();
    } finally {
      setCarregando(false);
    }
  };

  const enviarAlerta = async () => {
    if (!estudante) {
      Alert.alert(
        "Erro",
        "Os dados do estudante não foram carregados.",
      );
      return;
    }

    if (!tutorSelecionado) {
      Alert.alert(
        "Tutor obrigatório",
        "Escolha o tutor que deverá receber o alerta.",
      );
      return;
    }

    const localTratado = localCampus.trim();

    if (localTratado.length < 2) {
      Alert.alert(
        "Local obrigatório",
        "Informe onde você está no campus.",
      );
      return;
    }

    try {
      setEnviando(true);

      const { error } = await supabase.from("alertas").insert({
        aluno_id: estudante.id,
        tutor_id: tutorSelecionado,
        local_campus: localTratado,
        status: "enviado",
      });

      if (error) {
        console.log("Erro ao enviar alerta:", error);

        Alert.alert(
          "Erro",
          "Não foi possível enviar o alerta ao tutor.",
        );

        return;
      }

      Alert.alert(
        "Alerta enviado",
        "O tutor selecionado foi avisado.",
        [
          {
            text: "OK",
            onPress: fecharModal,
          },
        ],
      );
    } catch (erro) {
      console.log("Erro ao enviar alerta:", erro);

      Alert.alert(
        "Erro",
        "Ocorreu um erro ao enviar o alerta.",
      );
    } finally {
      setEnviando(false);
    }
  };

  useEffect(() => {
    if (visivel) {
      carregarDados();
    }
  }, [visivel]);

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={fecharModal}
    >
      <View style={estilos.fundo}>
        <View
          style={[
            estilos.modal,
            {
              backgroundColor: tema.modal,
              borderColor: tema.border,
            },
          ]}
        >
          {carregando ? (
            <View style={estilos.carregando}>
              <ActivityIndicator
                size="large"
                color="#FF8C42"
              />

              <Text
                style={[
                  estilos.textoCarregando,
                  {
                    color: tema.text,
                    fontSize: 16 * escalaFonte,
                  },
                ]}
              >
                Carregando dados...
              </Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={estilos.cabecalho}>
                <View style={estilos.iconeAlerta}>
                  <Feather
                    name="alert-triangle"
                    size={25}
                    color="#FFFFFF"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      estilos.titulo,
                      {
                        color: tema.text,
                        fontSize: 22 * escalaFonte,
                      },
                    ]}
                  >
                    Solicitar ajuda
                  </Text>

                  <Text
                    style={[
                      estilos.subtitulo,
                      {
                        color: tema.text,
                        fontSize: 14 * escalaFonte,
                      },
                    ]}
                  >
                    Envie um alerta para um tutor do seu campus.
                  </Text>
                </View>
              </View>

              {estudante && (
                <View
                  style={[
                    estilos.cardDados,
                    {
                      backgroundColor: tema.card,
                      borderColor: tema.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      estilos.tituloSecao,
                      {
                        color: tema.text,
                        fontSize: 17 * escalaFonte,
                      },
                    ]}
                  >
                    Seus dados
                  </Text>

                  <Text
                    style={[
                      estilos.dado,
                      {
                        color: tema.text,
                        fontSize: 15 * escalaFonte,
                      },
                    ]}
                  >
                    Nome: {estudante.nome}
                  </Text>

                  <Text
                    style={[
                      estilos.dado,
                      {
                        color: tema.text,
                        fontSize: 15 * escalaFonte,
                      },
                    ]}
                  >
                    Curso: {estudante.curso}
                  </Text>

                  <Text
                    style={[
                      estilos.dado,
                      {
                        color: tema.text,
                        fontSize: 15 * escalaFonte,
                      },
                    ]}
                  >
                    Turno: {estudante.turno}
                  </Text>

                  <Text
                    style={[
                      estilos.dado,
                      {
                        color: tema.text,
                        fontSize: 15 * escalaFonte,
                      },
                    ]}
                  >
                    Turma: {estudante.turma}
                  </Text>

                  <Text
                    style={[
                      estilos.dado,
                      {
                        color: tema.text,
                        fontSize: 15 * escalaFonte,
                      },
                    ]}
                  >
                    Campus: {estudante.campus}
                  </Text>
                </View>
              )}

              <Text
                style={[
                  estilos.tituloCampo,
                  {
                    color: tema.text,
                    fontSize: 17 * escalaFonte,
                  },
                ]}
              >
                Escolha um tutor
              </Text>

              {tutores.length === 0 ? (
                <Text
                  style={[
                    estilos.semTutor,
                    {
                      color: tema.text,
                      fontSize: 15 * escalaFonte,
                    },
                  ]}
                >
                  Nenhum tutor disponível no seu campus.
                </Text>
              ) : (
                <View style={estilos.listaTutores}>
                  {tutores.map((tutor) => {
                    const selecionado =
                      tutorSelecionado === tutor.id;

                    return (
                      <TouchableOpacity
                        key={tutor.id}
                        style={[
                          estilos.tutor,
                          {
                            backgroundColor: selecionado
                              ? "#94C0DF"
                              : tema.card,
                            borderColor: selecionado
                              ? "#4B6CB7"
                              : tema.border,
                          },
                        ]}
                        onPress={() =>
                          setTutorSelecionado(tutor.id)
                        }
                      >
                        <View
                          style={[
                            estilos.radioExterno,
                            selecionado && {
                              borderColor: "#4B6CB7",
                            },
                          ]}
                        >
                          {selecionado && (
                            <View style={estilos.radioInterno} />
                          )}
                        </View>

                        <Text
                          style={[
                            estilos.nomeTutor,
                            {
                              color: tema.text,
                              fontSize: 16 * escalaFonte,
                            },
                          ]}
                        >
                          {tutor.nome}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <Text
                style={[
                  estilos.tituloCampo,
                  {
                    color: tema.text,
                    fontSize: 17 * escalaFonte,
                  },
                ]}
              >
                Onde você está?
              </Text>

              <TextInput
                value={localCampus}
                onChangeText={setLocalCampus}
                placeholder="Ex.: Biblioteca, sala B12, pátio..."
                placeholderTextColor="#888"
                maxLength={150}
                multiline
                style={[
                  estilos.inputLocal,
                  {
                    backgroundColor: tema.card,
                    borderColor: tema.border,
                    color: tema.text,
                    fontSize: 16 * escalaFonte,
                  },
                ]}
              />

              <View style={estilos.botoes}>
                <TouchableOpacity
                  style={[
                    estilos.botaoCancelar,
                    enviando && estilos.desabilitado,
                  ]}
                  onPress={fecharModal}
                  disabled={enviando}
                >
                  <Text
                    style={[
                      estilos.textoBotao,
                      { fontSize: 16 * escalaFonte },
                    ]}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    estilos.botaoEnviar,
                    (enviando || tutores.length === 0) &&
                      estilos.desabilitado,
                  ]}
                  onPress={enviarAlerta}
                  disabled={
                    enviando || tutores.length === 0
                  }
                >
                  <Text
                    style={[
                      estilos.textoBotao,
                      { fontSize: 16 * escalaFonte },
                    ]}
                  >
                    {enviando
                      ? "Enviando..."
                      : "Enviar alerta"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modal: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "88%",
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
  },

  carregando: {
    paddingVertical: 45,
    alignItems: "center",
    gap: 15,
  },

  textoCarregando: {
    textAlign: "center",
  },

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },

  iconeAlerta: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF8C42",
  },

  titulo: {
    fontWeight: "bold",
  },

  subtitulo: {
    opacity: 0.75,
    marginTop: 3,
  },

  cardDados: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    gap: 5,
  },

  tituloSecao: {
    fontWeight: "bold",
    marginBottom: 5,
  },

  dado: {
    lineHeight: 22,
  },

  tituloCampo: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  listaTutores: {
    gap: 8,
    marginBottom: 20,
  },

  tutor: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 13,
  },

  radioExterno: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#777",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  radioInterno: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#4B6CB7",
  },

  nomeTutor: {
    flex: 1,
    fontWeight: "500",
  },

  semTutor: {
    marginBottom: 20,
    opacity: 0.7,
  },

  inputLocal: {
    minHeight: 90,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: "top",
  },

  botoes: {
    flexDirection: "row",
    gap: 10,
    marginTop: 22,
  },

  botaoCancelar: {
    flex: 1,
    backgroundColor: "#888",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoEnviar: {
    flex: 1,
    backgroundColor: "#FF8C42",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  textoBotao: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },

  desabilitado: {
    opacity: 0.5,
  },
});