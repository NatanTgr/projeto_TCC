import { Feather } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  AppState,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { supabase } from "../bd/supabase";
import { useFontSize } from "../context/FontSizeContext";
import { useTheme } from "../context/ThemeContext";

type AlertaBanco = {
  id: number;
  aluno_id: string;
  tutor_id: string;
  local_campus: string;
  status: string;
  criado_em: string;
};

type AlertaCompleto = {
  id: number;
  alunoId: string;
  nome: string;
  curso: string;
  turno: string;
  turma: string;
  campus: string;
  localCampus: string;
  status: string;
  criadoEm: string;
};

// =====================================================
// TRATAMENTO DE ERROS
// =====================================================

function registrarErro(contexto: string, erro: unknown) {
  console.error(`[AlertaTutorGlobal] ${contexto}:`, erro);
}

// =====================================================
// CARREGAR DETALHES DO ALERTA
// =====================================================

async function carregarDetalhes(
  alerta: AlertaBanco
): Promise<AlertaCompleto | null> {
  const [resultadoUsuario, resultadoAluno] = await Promise.all([
    supabase
      .from("usuarios")
      .select("nome, campus")
      .eq("id", alerta.aluno_id)
      .single(),

    supabase
      .from("alunos")
      .select("curso, turno, turma")
      .eq("id", alerta.aluno_id)
      .single(),
  ]);

  const { data: usuario, error: erroUsuario } = resultadoUsuario;
  const { data: aluno, error: erroAluno } = resultadoAluno;

  if (erroUsuario || erroAluno || !usuario || !aluno) {
    registrarErro(
      "Erro ao carregar dados da aluna/do aluno",
      erroUsuario || erroAluno || new Error("Dados incompletos")
    );
    return null;
  }

  return {
    id: alerta.id,
    alunoId: alerta.aluno_id,
    nome: usuario.nome,
    curso: aluno.curso,
    turno: aluno.turno,
    turma: aluno.turma,
    campus: usuario.campus,
    localCampus: alerta.local_campus,
    status: alerta.status,
    criadoEm: alerta.criado_em,
  };
}


type PropriedadesAlertaTutorGlobal = {
  usuarioId: string | null;
  tipoUsuario: string | null;
};



export default function AlertaTutorGlobal({
  usuarioId,
  tipoUsuario,
}: PropriedadesAlertaTutorGlobal) {

  const { tema } = useTheme();
  const { escalaFonte } = useFontSize();

  const [tutorId, setTutorId] = useState<string | null>(null);
  const [filaAlertas, setFilaAlertas] = useState<AlertaCompleto[]>([]);
  const [atendendo, setAtendendo] = useState(false);

  const alertaAtual = filaAlertas[0] ?? null;

  // =====================================================
  // ADICIONAR ALERTA NA FILA
  // =====================================================

  const adicionarNaFila = useCallback(async (alerta: AlertaBanco) => {
    const alertaCompleto = await carregarDetalhes(alerta);

    if (!alertaCompleto) return;

    setFilaAlertas((filaAtual) => {
      if (filaAtual.some((item) => item.id === alertaCompleto.id)) {
        return filaAtual;
      }

      return [...filaAtual, alertaCompleto];
    });
  }, []);

  // =====================================================
  // BUSCAR ALERTAS PENDENTES
  // =====================================================

  const buscarAlertasPendentes = useCallback(
    async (idTutor: string) => {
      const { data, error } = await supabase
        .from("alertas")
        .select("id, aluno_id, tutor_id, local_campus, status, criado_em")
        .eq("tutor_id", idTutor)
        .eq("status", "enviado")
        .order("criado_em", { ascending: true });

      if (error) {
        registrarErro("Erro ao buscar alertas pendentes", error);
        return;
      }

      for (const alerta of (data || []) as AlertaBanco[]) {
        await adicionarNaFila(alerta);
      }
    },
    [adicionarNaFila]
  );

 
  // =====================================================
  // IDENTIFICAR TUTORA/TUTOR PELO PERFIL JÁ CARREGADO
  // =====================================================

  useEffect(() => {
    const idTutor =
      tipoUsuario === "tutor" || tipoUsuario === "napne" ? usuarioId : null;

    setTutorId(idTutor);
    setFilaAlertas([]);
  }, [usuarioId, tipoUsuario]);


  // =====================================================
  // REALTIME DOS ALERTAS
  // =====================================================

  useEffect(() => {
    if (!tutorId) return;

    let ativo = true;

    const buscarComTratamento = () => {
      void buscarAlertasPendentes(tutorId).catch((erro) => {
        if (ativo) {
          registrarErro("Erro inesperado ao buscar alertas", erro);
        }
      });
    };

    buscarComTratamento();

    const canal = supabase
      .channel(`alertas-tutor-${tutorId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alertas",
          filter: `tutor_id=eq.${tutorId}`,
        },
        (payload) => {
          if (!ativo) return;

          const novoAlerta = payload.new as AlertaBanco;

          if (novoAlerta.status !== "enviado") return;

          void adicionarNaFila(novoAlerta).catch((erro) => {
            if (ativo) {
              registrarErro(
                "Erro ao receber alerta em tempo real",
                erro
              );
            }
          });
        }
      )
      .subscribe((status) => {
        console.log("Realtime dos alertas:", status);
      });

    // Atualiza os alertas quando o aplicativo volta ao primeiro plano.
    const appStateSubscription = AppState.addEventListener(
      "change",
      (proximoEstado) => {
        if (proximoEstado === "active") {
          buscarComTratamento();
        }
      }
    );

    return () => {
      ativo = false;
      appStateSubscription.remove();

      void supabase.removeChannel(canal).catch((erro) => {
        registrarErro("Erro ao remover canal de alertas", erro);
      });
    };
  }, [tutorId, buscarAlertasPendentes, adicionarNaFila]);

  // =====================================================
  // MARCAR COMO VISUALIZADO
  // =====================================================

  useEffect(() => {
    if (!alertaAtual || alertaAtual.status !== "enviado" || !tutorId) {
      return;
    }

    let ativo = true;
    const alertaId = alertaAtual.id;

    const marcarComoVisualizado = async () => {
      const { error } = await supabase
        .from("alertas")
        .update({
          status: "visualizado",
          visualizado_em: new Date().toISOString(),
        })
        .eq("id", alertaId)
        .eq("tutor_id", tutorId);

      if (error) {
        registrarErro("Erro ao visualizar alerta", error);
        return;
      }

      if (!ativo) return;

      setFilaAlertas((filaAtual) =>
        filaAtual.map((alerta) =>
          alerta.id === alertaId
            ? {
                ...alerta,
                status: "visualizado",
              }
            : alerta
        )
      );
    };

    void marcarComoVisualizado().catch((erro) => {
      registrarErro(
        "Erro inesperado ao registrar visualização",
        erro
      );
    });

    return () => {
      ativo = false;
    };
  }, [alertaAtual?.id, alertaAtual?.status, tutorId]);

  // =====================================================
  // FECHAR ALERTA
  // =====================================================

  const fecharAlerta = () => {
    setFilaAlertas((filaAtual) => filaAtual.slice(1));
  };

  // =====================================================
  // MARCAR COMO ATENDIDO
  // =====================================================

  const marcarComoAtendido = async () => {
    if (!alertaAtual || !tutorId || atendendo) return;

    try {
      setAtendendo(true);

      const { error } = await supabase
        .from("alertas")
        .update({
          status: "atendido",
          atendido_em: new Date().toISOString(),
        })
        .eq("id", alertaAtual.id)
        .eq("tutor_id", tutorId);

      if (error) throw error;

      fecharAlerta();
    } catch (erro) {
      registrarErro("Erro ao atender alerta", erro);

      Alert.alert(
        "Erro",
        "Não foi possível marcar o alerta como atendido."
      );
    } finally {
      setAtendendo(false);
    }
  };

  // =====================================================
  // FORMATAR HORÁRIO
  // =====================================================

  const formatarHorario = (data: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(data));

  if (!tutorId) return null;

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <Modal
      visible={Boolean(alertaAtual)}
      transparent
      animationType="fade"
      onRequestClose={fecharAlerta}
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
          {alertaAtual && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={estilos.cabecalho}>
                <View style={estilos.icone}>
                  <Feather
                    name="alert-triangle"
                    size={28}
                    color="#FFFFFF"
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      estilos.titulo,
                      {
                        color: tema.text,
                        fontSize: 23 * escalaFonte,
                      },
                    ]}
                  >
                    Aluna/Aluno solicitando ajuda
                  </Text>

                  <Text
                    style={[
                      estilos.horario,
                      {
                        color: tema.text,
                        fontSize: 14 * escalaFonte,
                      },
                    ]}
                  >
                    {formatarHorario(alertaAtual.criadoEm)}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  estilos.cardDados,
                  {
                    backgroundColor: tema.card,
                    borderColor: tema.border,
                  },
                ]}
              >
                <Dado
                  rotulo="Nome"
                  valor={alertaAtual.nome}
                  cor={tema.text}
                  escala={escalaFonte}
                />
                <Dado
                  rotulo="Curso"
                  valor={alertaAtual.curso}
                  cor={tema.text}
                  escala={escalaFonte}
                />
                <Dado
                  rotulo="Turno"
                  valor={alertaAtual.turno}
                  cor={tema.text}
                  escala={escalaFonte}
                />
                <Dado
                  rotulo="Turma"
                  valor={alertaAtual.turma}
                  cor={tema.text}
                  escala={escalaFonte}
                />
                <Dado
                  rotulo="Campus"
                  valor={alertaAtual.campus}
                  cor={tema.text}
                  escala={escalaFonte}
                />
              </View>

              <Text
                style={[
                  estilos.tituloLocal,
                  {
                    color: tema.text,
                    fontSize: 17 * escalaFonte,
                  },
                ]}
              >
                Local informado pela aluna/pelo aluno
              </Text>

              <View style={estilos.cardLocal}>
                <Feather
                  name="map-pin"
                  size={23}
                  color="#C95318"
                />

                <Text
                  style={[
                    estilos.local,
                    { fontSize: 18 * escalaFonte },
                  ]}
                >
                  {alertaAtual.localCampus}
                </Text>
              </View>

              {filaAlertas.length > 1 && (
                <Text
                  style={[
                    estilos.fila,
                    {
                      color: tema.text,
                      fontSize: 14 * escalaFonte,
                    },
                  ]}
                >
                  Mais {filaAlertas.length - 1} alerta(s) aguardando.
                </Text>
              )}

              <TouchableOpacity
                style={[
                  estilos.botaoAtendido,
                  atendendo && { opacity: 0.6 },
                ]}
                disabled={atendendo}
                onPress={() => {
                  void marcarComoAtendido();
                }}
              >
                <Feather
                  name="check-circle"
                  size={20}
                  color="#FFFFFF"
                />

                <Text
                  style={[
                    estilos.textoBotao,
                    { fontSize: 16 * escalaFonte },
                  ]}
                >
                  {atendendo ? "Salvando..." : "Marcar como atendido"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={estilos.botaoFechar}
                onPress={fecharAlerta}
              >
                <Text
                  style={[
                    estilos.textoFechar,
                    {
                      color: tema.text,
                      fontSize: 15 * escalaFonte,
                    },
                  ]}
                >
                  Fechar
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

// =====================================================
// COMPONENTE DE DADOS
// =====================================================

type PropriedadesDado = {
  rotulo: string;
  valor: string;
  cor: string;
  escala: number;
};

function Dado({
  rotulo,
  valor,
  cor,
  escala,
}: PropriedadesDado) {
  return (
    <View style={estilos.linhaDado}>
      <Text
        style={[
          estilos.rotulo,
          {
            color: cor,
            fontSize: 15 * escala,
          },
        ]}
      >
        {rotulo}:
      </Text>

      <Text
        style={[
          estilos.valor,
          {
            color: cor,
            fontSize: 15 * escala,
          },
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}

// =====================================================
// ESTILOS
// =====================================================

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modal: {
    width: "100%",
    maxWidth: 500,
    maxHeight: "88%",
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
  },

  cabecalho: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },

  icone: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FF5A36",
    alignItems: "center",
    justifyContent: "center",
  },

  titulo: {
    fontWeight: "bold",
  },

  horario: {
    opacity: 0.7,
    marginTop: 4,
  },

  cardDados: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    gap: 11,
  },

  linhaDado: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  rotulo: {
    fontWeight: "bold",
    marginRight: 5,
  },

  valor: {
    flexShrink: 1,
  },

  tituloLocal: {
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },

  cardLocal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFE1D2",
    borderWidth: 1,
    borderColor: "#FF8C42",
    borderRadius: 12,
    padding: 15,
  },

  local: {
    flex: 1,
    color: "#7A2E0B",
    fontWeight: "600",
  },

  fila: {
    marginTop: 14,
    textAlign: "center",
    opacity: 0.75,
  },

  botaoAtendido: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    padding: 14,
    marginTop: 20,
  },

  textoBotao: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  botaoFechar: {
    alignItems: "center",
    padding: 13,
    marginTop: 5,
  },

  textoFechar: {
    fontWeight: "600",
  },
});