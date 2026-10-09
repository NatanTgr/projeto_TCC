import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
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

const LOCAIS_PREDEFINIDOS = [
  "Bloco Didático",
  "Bloco Administrativo",
  "Sala",
  "Banheiro",
  "Biblioteca",
  "Refeitório",
  "Quadra",
];

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

  const [modalTutores, setModalTutores] = useState(false);

  const nomeTutorSelecionado = tutores.find(
    (tutor) => tutor.id === tutorSelecionado,
  )?.nome;

  const [localCampus, setLocalCampus] = useState("");
  const [localSelecionado, setLocalSelecionado] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const limparFormulario = () => {
    setTutorSelecionado(null);
    setLocalCampus("");
    setLocalSelecionado(null);
    setModalTutores(false);
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

    const complemento = localCampus.trim();

    if (!localSelecionado && complemento.length < 2) {
      Alert.alert(
        "Local obrigatório",
        "Selecione um local ou escreva onde você está no campus.",
      );
      return;
    }

    const localTratado = [localSelecionado, complemento]
      .filter(Boolean)
      .join(" — ");

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
      onRequestClose={() => {
        if (modalTutores) {
          setModalTutores(false);
          return;
        }

        fecharModal();
      }}
    >
      <KeyboardAvoidingView
        style={estilos.fundo}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={[
            estilos.modal,
            {
              backgroundColor: tema.modal,
              borderColor: tema.border,
            },
          ]}
        >
          {modalTutores ? (
            <ScrollView
              style={estilos.scrollModal}
              contentContainerStyle={estilos.conteudoModal}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text
                accessibilityRole="header"
                style={[
                  estilos.titulo,
                  {
                    color: tema.text,
                    fontSize: 22 * escalaFonte,
                    marginBottom: 8,
                  },
                ]}
              >
                Selecionar tutor
              </Text>

              <Text
                style={{
                  color: tema.text,
                  fontSize: 14 * escalaFonte,
                  marginBottom: 20,
                }}
              >
                Escolha quem receberá seu pedido de ajuda.
              </Text>

              <View style={estilos.listaTutores}>
                {tutores.map((tutor) => {
                  const selecionado = tutorSelecionado === tutor.id;

                  return (
                    <TouchableOpacity
                      key={tutor.id}
                      accessibilityRole="radio"
                      accessibilityLabel={tutor.nome}
                      accessibilityState={{ selected: selecionado }}
                      onPress={() => {
                        setTutorSelecionado(tutor.id);
                        setModalTutores(false);
                      }}
                      style={[
                        estilos.tutor,
                        {
                          backgroundColor: tema.card,
                          borderColor: selecionado ? tema.text : tema.border,
                          borderWidth: selecionado ? 2 : 1,
                          gap: 12,
                          minHeight: 48,
                        },
                      ]}
                    >
                      <Feather name="user" size={22} color={tema.text} />

                      <Text
                        style={[
                          estilos.nomeTutor,
                          {
                            color: tema.text,
                            fontSize: 16 * escalaFonte,
                            fontWeight: selecionado ? "bold" : "500",
                          },
                        ]}
                      >
                        {tutor.nome}
                      </Text>

                      {selecionado && (
                        <Feather name="check" size={22} color={tema.text} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setModalTutores(false)}
                style={[
                  estilos.voltarTutores,
                  {
                    backgroundColor: tema.card,
                    borderColor: tema.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: tema.text,
                    fontSize: 16 * escalaFonte,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Voltar
                </Text>
              </TouchableOpacity>
            </ScrollView>
          ) : carregando ? (
            <View style={estilos.carregando}>
              <ActivityIndicator size="large" color="#FF8C42" />

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
              style={estilos.scrollModal}
              contentContainerStyle={estilos.conteudoModal}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={
                Platform.OS === "ios" ? "interactive" : "on-drag"
              }
              automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
            >
              <View style={estilos.cabecalho}>
                <View style={estilos.iconeAlerta}>
                  <Feather name="alert-triangle" size={25} color="#FFFFFF" />
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

              <TouchableOpacity
                disabled={enviando || tutores.length === 0}
                accessibilityRole="button"
                accessibilityLabel={
                  nomeTutorSelecionado
                    ? `Tutor selecionado: ${nomeTutorSelecionado}. Toque para alterar.`
                    : "Selecionar tutor"
                }
                accessibilityState={{
                  disabled: enviando || tutores.length === 0,
                }}
                onPress={() => {
                  Keyboard.dismiss();
                  setModalTutores(true);
                }}
                style={[
                  estilos.seletorTutor,
                  {
                    backgroundColor: tema.card,
                    borderColor: tutorSelecionado ? tema.text : tema.border,
                  },
                  (enviando || tutores.length === 0) && estilos.desabilitado,
                ]}
              >
                <Feather name="user" size={22} color={tema.text} />

                <Text
                  style={[
                    estilos.nomeTutor,
                    {
                      color: tema.text,
                      fontSize: 16 * escalaFonte,
                    },
                  ]}
                >
                  {tutores.length === 0
                    ? "Nenhum tutor disponível no seu campus"
                    : nomeTutorSelecionado || "Selecionar tutor"}
                </Text>

                <Feather name="chevron-right" size={22} color={tema.text} />
              </TouchableOpacity>

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

              <View style={estilos.listaLocais}>
                {LOCAIS_PREDEFINIDOS.map((local) => {
                  const selecionado = localSelecionado === local;

                  return (
                    <TouchableOpacity
                      key={local}
                      disabled={enviando}
                      accessibilityRole="button"
                      accessibilityLabel={local}
                      accessibilityState={{
                        selected: selecionado,
                        disabled: enviando,
                      }}
                      onPress={() =>
                        setLocalSelecionado((atual) =>
                          atual === local ? null : local,
                        )
                      }
                      style={[
                        estilos.botaoLocal,
                        local === "Bloco Administrativo" && {
                          flexBasis: 190,
                        },
                        {
                          backgroundColor: tema.card,
                          borderColor: selecionado ? tema.text : tema.border,
                          borderWidth: selecionado ? 2 : 1,
                        },
                        enviando && estilos.desabilitado,
                      ]}
                    >
                      <Feather
                        name={selecionado ? "check-circle" : "map-pin"}
                        size={18 * escalaFonte}
                        color={tema.text}
                      />

                      <Text
                        style={[
                          estilos.textoLocal,
                          {
                            color: tema.text,
                            fontSize: 16 * escalaFonte,
                            fontWeight: selecionado ? "bold" : "500",
                          },
                        ]}
                      >
                        {local === "Bloco Administrativo"
                          ? "Bloco\nAdministrativo"
                          : local === "Bloco Didático"
                            ? "Bloco\nDidático"
                            : local}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text
                style={[
                  estilos.tituloCampo,
                  {
                    color: tema.text,
                    fontSize: 16 * escalaFonte,
                  },
                ]}
              >
                Especifique o local (opcional)
              </Text>

              <TextInput
                value={localCampus}
                onChangeText={setLocalCampus}
                editable={!enviando}
                accessibilityLabel="Especifique o local, opcional"
                placeholder="Ex.: sala B12, próximo à entrada..."
                placeholderTextColor={tema.text}
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
                    style={[estilos.textoBotao, { fontSize: 16 * escalaFonte }]}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    estilos.botaoEnviar,
                    (enviando || tutores.length === 0) && estilos.desabilitado,
                  ]}
                  onPress={enviarAlerta}
                  disabled={enviando || tutores.length === 0}
                >
                  <Text
                    style={[estilos.textoBotao, { fontSize: 16 * escalaFonte }]}
                  >
                    {enviando ? "Enviando..." : "Enviar alerta"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
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

  listaLocais: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },

  botaoLocal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 140,
    maxWidth: "100%",
  },

  textoLocal: {
    flexShrink: 1,
    textAlign: "center",
  },

  scrollModal: {
    flexShrink: 1,
  },

  conteudoModal: {
    paddingBottom: 20,
  },

  seletorTutor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },

  voltarTutores: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});