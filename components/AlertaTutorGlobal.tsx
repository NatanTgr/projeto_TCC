import { useEffect, useState } from "react";
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

import { Feather } from "@expo/vector-icons";

import { supabase } from "../bd/supabase";
import { useTheme } from "../context/ThemeContext";
import { useFontSize } from "../context/FontSizeContext";

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

export default function AlertaTutorGlobal() {
  const { tema } = useTheme();
  const { escalaFonte } = useFontSize();

  const [tutorId, setTutorId] =
    useState<string | null>(null);

  const [filaAlertas, setFilaAlertas] =
    useState<AlertaCompleto[]>([]);

  const alertaAtual = filaAlertas[0] ?? null;

  const carregarDetalhes = async (
    alerta: AlertaBanco,
  ): Promise<AlertaCompleto | null> => {
    const [
      { data: usuario, error: erroUsuario },
      { data: aluno, error: erroAluno },
    ] = await Promise.all([
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

    if (erroUsuario || erroAluno || !usuario || !aluno) {
      console.log(
        "Erro ao carregar estudante do alerta:",
        erroUsuario || erroAluno,
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
  };

  const adicionarNaFila = async (
    alerta: AlertaBanco,
  ) => {
    const alertaCompleto =
      await carregarDetalhes(alerta);

    if (!alertaCompleto) {
      return;
    }

    setFilaAlertas((filaAtual) => {
      const jaExiste = filaAtual.some(
        (item) => item.id === alertaCompleto.id,
      );

      if (jaExiste) {
        return filaAtual;
      }

      return [...filaAtual, alertaCompleto];
    });
  };

  const buscarAlertasPendentes = async (
    idTutor: string,
  ) => {
    const { data, error } = await supabase
      .from("alertas")
      .select(
        `
          id,
          aluno_id,
          tutor_id,
          local_campus,
          status,
          criado_em
        `,
      )
      .eq("tutor_id", idTutor)
      .eq("status", "enviado")
      .order("criado_em", { ascending: true });

    if (error) {
      console.log(
        "Erro ao buscar alertas pendentes:",
        error,
      );

      return;
    }

    for (const alerta of (data || []) as AlertaBanco[]) {
      await adicionarNaFila(alerta);
    }
  };

  /*
   * Verifica se o usuário logado é tutor.
   */
  useEffect(() => {
    let componenteAtivo = true;

    const verificarUsuario = async (
      usuarioId: string | null,
    ) => {
      if (!usuarioId) {
        if (componenteAtivo) {
          setTutorId(null);
          setFilaAlertas([]);
        }

        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("tipo")
        .eq("id", usuarioId)
        .single();

      if (!componenteAtivo) {
        return;
      }

      if (error || data?.tipo !== "tutor") {
        setTutorId(null);
        setFilaAlertas([]);
        return;
      }

      setTutorId(usuarioId);
    };

    const carregarSessao = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      await verificarUsuario(user?.id ?? null);
    };

    carregarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_evento, sessao) => {
        setTimeout(() => {
          verificarUsuario(
            sessao?.user?.id ?? null,
          );
        }, 0);
      },
    );

    return () => {
      componenteAtivo = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * Busca alertas já existentes e observa novos INSERTs.
   */
  useEffect(() => {
    if (!tutorId) {
      return;
    }

    buscarAlertasPendentes(tutorId);

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
          adicionarNaFila(
            payload.new as AlertaBanco,
          );
        },
      )
      .subscribe((status) => {
        console.log(
          "Realtime dos alertas:",
          status,
        );
      });

    const appStateSubscription =
      AppState.addEventListener(
        "change",
        (proximoEstado) => {
          if (proximoEstado === "active") {
            buscarAlertasPendentes(tutorId);
          }
        },
      );

    return () => {
      appStateSubscription.remove();
      supabase.removeChannel(canal);
    };
  }, [tutorId]);

  /*
   * Ao aparecer no modal, marca como visualizado.
   */
  useEffect(() => {
    if (
      !alertaAtual ||
      alertaAtual.status !== "enviado"
    ) {
      return;
    }

    const marcarComoVisualizado = async () => {
      const { error } = await supabase
        .from("alertas")
        .update({
          status: "visualizado",
          visualizado_em: new Date().toISOString(),
        })
        .eq("id", alertaAtual.id)
        .eq("tutor_id", tutorId);

      if (error) {
        console.log(
          "Erro ao visualizar alerta:",
          error,
        );

        return;
      }

      setFilaAlertas((filaAtual) =>
        filaAtual.map((alerta) =>
          alerta.id === alertaAtual.id
            ? {
                ...alerta,
                status: "visualizado",
              }
            : alerta,
        ),
      );
    };

    marcarComoVisualizado();
  }, [alertaAtual?.id]);

  const fecharAlerta = () => {
    setFilaAlertas((filaAtual) =>
      filaAtual.slice(1),
    );
  };

  const marcarComoAtendido = async () => {
    if (!alertaAtual || !tutorId) {
      return;
    }

    const { error } = await supabase
      .from("alertas")
      .update({
        status: "atendido",
        atendido_em: new Date().toISOString(),
      })
      .eq("id", alertaAtual.id)
      .eq("tutor_id", tutorId);

    if (error) {
      console.log(
        "Erro ao atender alerta:",
        error,
      );

      Alert.alert(
        "Erro",
        "Não foi possível marcar o alerta como atendido.",
      );

      return;
    }

    fecharAlerta();
  };

  const formatarHorario = (data: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(data));
  };

  if (!tutorId) {
    return null;
  }

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
            <ScrollView
              showsVerticalScrollIndicator={false}
            >
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
                    Aluno solicitando ajuda
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
                    {formatarHorario(
                      alertaAtual.criadoEm,
                    )}
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
                Local informado pelo estudante
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
                    {
                      fontSize: 18 * escalaFonte,
                    },
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
                  Mais {filaAlertas.length - 1} alerta(s)
                  aguardando.
                </Text>
              )}

              <TouchableOpacity
                style={estilos.botaoAtendido}
                onPress={marcarComoAtendido}
              >
                <Feather
                  name="check-circle"
                  size={20}
                  color="#FFFFFF"
                />

                <Text
                  style={[
                    estilos.textoBotao,
                    {
                      fontSize: 16 * escalaFonte,
                    },
                  ]}
                >
                  Marcar como atendido
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