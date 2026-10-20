
import { useEffect, useRef, useState } from "react";
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

  const [avisarNapne, setAvisarNapne] = useState(false);

  const [modalTutores, setModalTutores] = useState(false);
  const [localCampus, setLocalCampus] = useState("");

  const [localSelecionado, setLocalSelecionado] =
    useState<string | null>(null);

  const [carregando, setCarregando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const envioEmAndamentoRef = useRef(false);

  const nomeTutorSelecionado = tutores.find(
    (tutor) => tutor.id === tutorSelecionado
  )?.nome;

  // =====================================================
  // LIMPAR FORMULÁRIO
  // =====================================================

  const limparFormulario = () => {
    setTutorSelecionado(null);
    setAvisarNapne(false);
    setLocalCampus("");
    setLocalSelecionado(null);
    setModalTutores(false);
  };

  const fecharModal = () => {
    if (envioEmAndamentoRef.current) return;

    Keyboard.dismiss();
    limparFormulario();
    aoFechar();
  };

  // =====================================================
  // CARREGAR ESTUDANTE E TUTORES
  // =====================================================

  const carregarDados = async () => {
    try {
      setCarregando(true);
      setEstudante(null);
      setTutores([]);
      limparFormulario();

      const {
        data: { session },
        error: erroSessao,
      } = await supabase.auth.getSession();

      if (erroSessao) {
        throw new Error(
          "Não foi possível recuperar sua sessão."
        );
      }

      if (!session?.user) {
        throw new Error(
          "Sua sessão não foi encontrada. Entre novamente na sua conta."
        );
      }

      const {
        data: { user },
        error: erroAuth,
      } = await supabase.auth.getUser();

      if (erroAuth || !user) {
        throw new Error(
          erroAuth?.message ||
          "Não foi possível identificar o usuário logado."
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
          "Não foi possível carregar o usuário."
        );
      }

      if (usuario.tipo !== "estudante") {
        throw new Error(
          "O botão de alerta está disponível somente para estudantes."
        );
      }

      if (!usuario.estado || !usuario.campus) {
        throw new Error(
          "O estado ou campus do estudante não está preenchido."
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
          "Não foi possível carregar os dados do estudante."
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

      const {
        data: tutoresEncontrados,
        error: erroTutores,
      } = await supabase
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
      console.error(
        "Erro ao carregar modal de alerta:",
        erro
      );

      Alert.alert(
        "Erro",
        erro instanceof Error
          ? erro.message
          : "Não foi possível carregar o alerta."
      );

      aoFechar();
    } finally {
      setCarregando(false);
    }
  };

  // =====================================================
  // ENVIAR ALERTA
  // =====================================================


const enviarAlerta = async () => {
  if (envioEmAndamentoRef.current) return;

  if (!estudante) {
    Alert.alert("Erro", "Os dados do estudante não foram carregados.");
    return;
  }

  // Basta escolher uma tutora/tutor OU a equipe NAPNE.

  if (!tutorSelecionado && !avisarNapne) {
    Alert.alert(
      "Selecione quem receberá o alerta",
      "Para enviar o alerta, você precisa selecionar uma tutora ou um tutor, a equipe NAPNE ou ambos.",
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
    envioEmAndamentoRef.current = true;
    setEnviando(true);

    const destinatarios = new Set<string>();

    // Adiciona a tutora/tutor somente se selecionado.
    if (tutorSelecionado) {
      destinatarios.add(tutorSelecionado);
    }

    let quantidadeNapne = 0;

    // A equipe NAPNE pode receber sem tutor selecionado.
    if (avisarNapne) {
      const { data: equipeNapne, error: erroNapne } = await supabase
        .from("usuarios")
        .select("id")
        .eq("tipo", "napne")
        .eq("estado", estudante.estado)
        .eq("campus", estudante.campus);

      if (erroNapne) {
        throw new Error(
          "Não foi possível localizar a equipe NAPNE: " + erroNapne.message,
        );
      }

      if (!equipeNapne || equipeNapne.length === 0) {
        Alert.alert(
          "Equipe NAPNE indisponível",
          tutorSelecionado
            ? "Nenhum integrante NAPNE foi encontrado neste campus. Desmarque a opção NAPNE para enviar somente à tutora/ao tutor."
            : "Nenhum integrante NAPNE foi encontrado neste campus. Se precisar, selecione uma tutora ou um tutor para receber o alerta.",
        );
        return;
      }

      for (const integrante of equipeNapne) {
        destinatarios.add(integrante.id);
      }

      quantidadeNapne = equipeNapne.length;
    }

    if (destinatarios.size === 0) {
      Alert.alert(
        "Nenhum destinatário",
        "Não foi encontrado nenhum destinatário para o alerta.",
      );
      return;
    }

    // Um registro independente para cada destinatário.
    const registros = Array.from(destinatarios).map((destinatarioId) => ({
      aluno_id: estudante.id,
      tutor_id: destinatarioId,
      local_campus: localTratado,
      status: "enviado",
    }));

    const { error } = await supabase.from("alertas").insert(registros);

    if (error) {
      throw error;
    }

    let mensagem = "";

    if (tutorSelecionado && avisarNapne) {
      mensagem =
        "Alerta registrado para a tutora/o tutor selecionado e " +
        `para ${quantidadeNapne} integrante(s) da equipe NAPNE.`;
    } else if (avisarNapne) {
      mensagem =
        "Alerta registrado para " +
        `${quantidadeNapne} integrante(s) da equipe NAPNE.`;
    } else {
      mensagem = "Alerta registrado para a tutora/o tutor selecionado.";
    }

    Alert.alert("Alerta enviado", mensagem, [
      {
        text: "OK",
        onPress: () => {
          limparFormulario();
          aoFechar();
        },
      },
    ]);
  } catch (erro) {
    console.error("Erro ao enviar alerta:", erro);

    Alert.alert(
      "Erro ao enviar alerta",
      erro instanceof Error
        ? erro.message
        : "Ocorreu um erro ao enviar o alerta.",
    );
  } finally {
    envioEmAndamentoRef.current = false;
    setEnviando(false);
  }
};


  // =====================================================
  // CARREGAR DADOS QUANDO O MODAL ABRIR
  // =====================================================

  useEffect(() => {
    if (visivel) {
      void carregarDados().catch((erro) => {
        console.error(
          "Erro inesperado ao carregar modal de alerta:",
          erro
        );
      });
    }
  }, [visivel]);

  // =====================================================
  // INTERFACE
  // =====================================================

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
                Selecionar tutora/tutor
              </Text>

              <Text
                style={[
                  estilos.texto,
                  {
                    color: tema.text,
                    fontSize: 14 * escalaFonte,
                    marginBottom: 20,
                  },
                ]}
              >
                Escolha quem receberá seu pedido de ajuda.
              </Text>

              <View style={estilos.listaTutores}>
                {[{ id: "", nome: "Nenhum" }, ...tutores].map((tutor) => {
                  const selecionado = tutorSelecionado === (tutor.id || null);

                  return (
                    <TouchableOpacity
                      key={tutor.id}
                      accessibilityRole="radio"
                      accessibilityLabel={tutor.nome}
                      accessibilityState={{
                        selected: selecionado,
                      }}
                      onPress={() => {
                        setTutorSelecionado(tutor.id || null);
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
                  style={[
                    estilos.texto,
                    {
                      color: tema.text,
                      fontSize: 16 * escalaFonte,
                      textAlign: "center",
                    },
                  ]}
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
              {/* CABEÇALHO */}

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
                    Envie um alerta para uma tutora ou um tutor, para a equipe
                    NAPNE ou para ambos.
                  </Text>
                </View>
              </View>

              {/* DADOS DO ESTUDANTE */}

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

                  {[
                    ["Nome", estudante.nome],
                    ["Curso", estudante.curso],
                    ["Turno", estudante.turno],
                    ["Turma", estudante.turma],
                    ["Campus", estudante.campus],
                  ].map(([rotulo, valor]) => (
                    <Text
                      key={rotulo}
                      style={[
                        estilos.dado,
                        {
                          color: tema.text,
                          fontSize: 15 * escalaFonte,
                        },
                      ]}
                    >
                      {rotulo}: {valor}
                    </Text>
                  ))}
                </View>
              )}

              {/* ESCOLHER TUTORA/TUTOR */}

              <Text
                style={[
                  estilos.tituloCampo,
                  {
                    color: tema.text,
                    fontSize: 17 * escalaFonte,
                  },
                ]}
              >
                Escolha uma Tutora/Tutor (opcional)
              </Text>

              <TouchableOpacity
                disabled={enviando || tutores.length === 0}
                accessibilityRole="button"
                accessibilityLabel={
                  nomeTutorSelecionado
                    ? `Tutora/Tutor selecionado: ${nomeTutorSelecionado}. Toque para alterar.`
                    : "Selecionar tutora/tutor"
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
                    ? "Nenhuma tutora ou tutor disponível no seu campus"
                    : nomeTutorSelecionado || "Selecionar tutora/tutor"}
                </Text>

                <Feather name="chevron-right" size={22} color={tema.text} />
              </TouchableOpacity>

              {/* EQUIPE NAPNE - OPCIONAL */}

              <Text
                style={[
                  estilos.tituloCampo,
                  {
                    color: tema.text,
                    fontSize: 17 * escalaFonte,
                  },
                ]}
              >
                Equipe NAPNE (opcional)
              </Text>

              <TouchableOpacity
                disabled={enviando}
                accessibilityRole="checkbox"
                accessibilityLabel="Avisar também toda a equipe NAPNE do campus"
                accessibilityState={{
                  checked: avisarNapne,
                  disabled: enviando,
                }}
                onPress={() => {
                  Keyboard.dismiss();
                  setAvisarNapne((atual) => !atual);
                }}
                style={[
                  estilos.seletorNapne,
                  {
                    backgroundColor: tema.card,
                    borderColor: avisarNapne ? tema.text : tema.border,
                    borderWidth: avisarNapne ? 2 : 1,
                  },
                  enviando && estilos.desabilitado,
                ]}
              >
                <Feather
                  name={avisarNapne ? "check-square" : "square"}
                  size={24}
                  color={tema.text}
                />

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      estilos.nomeNapne,
                      {
                        color: tema.text,
                        fontSize: 16 * escalaFonte,
                      },
                    ]}
                  >
                    Avisar a equipe NAPNE
                  </Text>

                  <Text
                    style={[
                      estilos.descricaoNapne,
                      {
                        color: tema.text,
                        fontSize: 13 * escalaFonte,
                      },
                    ]}
                  >
                    Todos os integrantes NAPNE do mesmo campus receberão o
                    alerta, sem precisar selecionar nomes.
                  </Text>
                </View>

                <Feather name="users" size={22} color={tema.text} />
              </TouchableOpacity>

              {/* SELECIONAR LOCAL */}

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

              {/* LOCAL ADICIONAL */}

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

              {/* BOTÕES */}

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
                      {
                        fontSize: 16 * escalaFonte,
                      },
                    ]}
                  >
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    estilos.botaoEnviar,
                    enviando && estilos.desabilitado,
                  ]}
                  disabled={enviando}
                  onPress={() => {
                    void enviarAlerta().catch((erro) => {
                      console.error("Erro inesperado ao enviar alerta:", erro);
                    });
                  }}
                >
                  <Text
                    style={[
                      estilos.textoBotao,
                      {
                        fontSize: 16 * escalaFonte,
                      },
                    ]}
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

// =====================================================
// ESTILOS
// =====================================================

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

  texto: {
    fontFamily: "FredokaLight",
  },

  textoCarregando: {
    fontFamily: "FredokaLight",
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
    fontFamily: "FredokaMedium",
  },

  subtitulo: {
    fontFamily: "FredokaLight",
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
    fontFamily: "FredokaMedium",
    marginBottom: 5,
  },

  dado: {
    fontFamily: "FredokaLight",
    lineHeight: 22,
  },

  tituloCampo: {
    fontFamily: "FredokaMedium",
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

  nomeTutor: {
    flex: 1,
    fontFamily: "FredokaLight",
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

  seletorNapne: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 60,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },

  nomeNapne: {
    fontFamily: "FredokaMedium",
  },

  descricaoNapne: {
    fontFamily: "FredokaLight",
    opacity: 0.75,
    marginTop: 4,
    flexShrink: 1,
  },

  inputLocal: {
    fontFamily: "FredokaLight",
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
    fontFamily: "FredokaLight",
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
    fontFamily: "FredokaLight",
    flexShrink: 1,
    textAlign: "center",
  },

  scrollModal: {
    flexShrink: 1,
  },

  conteudoModal: {
    paddingBottom: 20,
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
