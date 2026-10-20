
import { useEffect, useState } from "react";

import {
  Alert,
  AppState,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

import { supabase } from "../bd/supabase";
import { useFontSize } from "../context/FontSizeContext";
import ModalAlerta from "./ModalAlerta";

// =====================================================
// HORÁRIO DE FUNCIONAMENTO DO ALERTA
// =====================================================

const HORARIO_INICIO = 7 * 60 + 20;
const HORARIO_FIM = 22 * 60 + 30;

function estaNoHorarioPermitido() {
  const agora = new Date();

  const minutosAtuais =
    agora.getHours() * 60 + agora.getMinutes();

  return (
    minutosAtuais >= HORARIO_INICIO &&
    minutosAtuais < HORARIO_FIM
  );
}

// =====================================================
// COMPONENTE BOTÃO ALERTA
// =====================================================

export default function BotaoAlerta() {
  const { escalaFonte } = useFontSize();

  const [modalVisivel, setModalVisivel] = useState(false);
  const [ehEstudante, setEhEstudante] = useState(false);

  const [horarioPermitido, setHorarioPermitido] = useState(
    estaNoHorarioPermitido
  );

  // =====================================================
  // VERIFICAR HORÁRIO DE FUNCIONAMENTO
  // =====================================================

  useEffect(() => {
    const atualizarHorario = () => {
      const permitido = estaNoHorarioPermitido();

      setHorarioPermitido(permitido);

      if (!permitido) {
        setModalVisivel(false);
      }
    };

    atualizarHorario();

    const intervalo = setInterval(
      atualizarHorario,
      1000
    );

    const subscription = AppState.addEventListener(
      "change",
      (estado) => {
        if (estado === "active") {
          atualizarHorario();
        }
      }
    );

    return () => {
      clearInterval(intervalo);
      subscription.remove();
    };
  }, []);

  // =====================================================
  // VERIFICAR SE O USUÁRIO É ESTUDANTE
  // =====================================================

  useEffect(() => {
    let componenteAtivo = true;
    let verificacaoAtual = 0;

    // Armazena os temporizadores para removê-los
    // quando o componente for desmontado.

    const temporizadores = new Set<
      ReturnType<typeof setTimeout>
    >();

    // ===================================================
    // CONSULTAR TIPO DO USUÁRIO
    // ===================================================

    const verificarUsuario = async (
      usuarioId: string | null
    ): Promise<void> => {
      if (!componenteAtivo) {
        return;
      }

      const numeroVerificacao = ++verificacaoAtual;

      setEhEstudante(false);
      setModalVisivel(false);

      if (!usuarioId) {
        return;
      }

      const { data, error } = await supabase
        .from("usuarios")
        .select("tipo")
        .eq("id", usuarioId)
        .single();

      // Ignora resultados de verificações antigas
      // ou de um componente já desmontado.

      if (
        !componenteAtivo ||
        numeroVerificacao !== verificacaoAtual
      ) {
        return;
      }

      if (error) {
        console.error(
          "Erro ao verificar usuário do alerta:",
          error
        );
        return;
      }

      setEhEstudante(data?.tipo === "estudante");
    };

    // ===================================================
    // CARREGAR USUÁRIO ATUAL
    // ===================================================

    const carregarUsuarioAtual =
      async (): Promise<void> => {
        const verificacaoAntesDaConsulta =
          verificacaoAtual;

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (
          !componenteAtivo ||
          verificacaoAntesDaConsulta !==
            verificacaoAtual
        ) {
          return;
        }

        if (error) {
          console.error(
            "Erro ao recuperar usuário do alerta:",
            error
          );

          setEhEstudante(false);
          setModalVisivel(false);

          return;
        }

        await verificarUsuario(user?.id ?? null);
      };

    // Correção SonarCloud S9383:
    // trata rejeições da consulta inicial.

    void carregarUsuarioAtual().catch((error) => {
      if (!componenteAtivo) {
        return;
      }

      console.error(
        "Erro inesperado ao carregar usuário do alerta:",
        error
      );
    });

    // ===================================================
    // MONITORAR ALTERAÇÕES DE AUTENTICAÇÃO
    // ===================================================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_evento, sessao) => {
        // Invalida consultas iniciadas antes
        // da alteração da autenticação.

        verificacaoAtual += 1;

        const usuarioId =
          sessao?.user?.id ?? null;

        /*
         * Executa fora do callback imediato
         * de autenticação para evitar conflitos
         * com o controle interno do Supabase.
         */

        const temporizador = setTimeout(() => {
          temporizadores.delete(temporizador);

          if (!componenteAtivo) {
            return;
          }

          // Correção SonarCloud S9383:
          // trata rejeições da verificação.

          void verificarUsuario(usuarioId).catch(
            (error) => {
              if (!componenteAtivo) {
                return;
              }

              console.error(
                "Erro inesperado ao verificar usuário após autenticação:",
                error
              );
            }
          );
        }, 0);

        temporizadores.add(temporizador);
      }
    );

    // ===================================================
    // LIMPEZA
    // ===================================================

    return () => {
      componenteAtivo = false;

      // Invalida consultas ainda em andamento.
      verificacaoAtual += 1;

      // Remove verificações agendadas.
      temporizadores.forEach((temporizador) => {
        clearTimeout(temporizador);
      });

      temporizadores.clear();

      subscription.unsubscribe();
    };
  }, []);

  // =====================================================
  // ABRIR MODAL DE ALERTA
  // =====================================================

  const abrirAlerta = () => {
    // Confere novamente no momento do toque.

    const permitido = estaNoHorarioPermitido();

    setHorarioPermitido(permitido);

    if (!permitido) {
      setModalVisivel(false);

      Alert.alert(
        "Alerta indisponível",
        "O botão de alerta pode ser utilizado somente das 7h20 às 22h30. Fora desse horário, não é possível enviar um alerta."
      );

      return;
    }

    setModalVisivel(true);
  };

  // =====================================================
  // VISIBILIDADE DO BOTÃO
  // =====================================================

  if (!ehEstudante) {
    return null;
  }

  // =====================================================
  // INTERFACE
  // =====================================================

  return (
    <>
      <TouchableOpacity
        style={[
          estilos.botao,
          !horarioPermitido &&
            estilos.botaoIndisponivel,
        ]}
        onPress={abrirAlerta}
        accessibilityRole="button"
        accessibilityLabel={
          horarioPermitido
            ? "Solicitar ajuda a uma tutora ou um tutor"
            : "Alerta indisponível. Consulte o horário de uso"
        }
        accessibilityHint="Disponível das 7h20 às 22h30"
      >
        <Text
          style={[
            estilos.texto,
            {
              fontSize: 14 * escalaFonte,
            },
          ]}
        >
          ALERTA
        </Text>
      </TouchableOpacity>

      <ModalAlerta
        visivel={
          modalVisivel && horarioPermitido
        }
        aoFechar={() => setModalVisivel(false)}
      />
    </>
  );
}

// =====================================================
// ESTILOS
// =====================================================

const estilos = StyleSheet.create({
  botao: {
    backgroundColor: "#FF8C42",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    elevation: 3,
  },

  botaoIndisponivel: {
    backgroundColor: "#777777",
    elevation: 0,
  },

  texto: {
    color: "#FFFFFF",
    fontFamily: "FredokaMedium",
  },
});
