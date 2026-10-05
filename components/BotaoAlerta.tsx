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

const HORARIO_INICIO = 7 * 60 + 20;
const HORARIO_FIM = 22 * 60 + 30;

function estaNoHorarioPermitido() {
  const agora = new Date();
  const minutosAtuais = agora.getHours() * 60 + agora.getMinutes();

  return (
    minutosAtuais >= HORARIO_INICIO &&
    minutosAtuais < HORARIO_FIM
  );
}

export default function BotaoAlerta() {
  const { escalaFonte } = useFontSize();

  const [modalVisivel, setModalVisivel] = useState(false);
  const [ehEstudante, setEhEstudante] = useState(false);
  const [horarioPermitido, setHorarioPermitido] = useState(
    estaNoHorarioPermitido
  );

  useEffect(() => {
    const atualizarHorario = () => {
      const permitido = estaNoHorarioPermitido();

      setHorarioPermitido(permitido);

      if (!permitido) {
        setModalVisivel(false);
      }
    };

    atualizarHorario();

    const intervalo = setInterval(atualizarHorario, 1000);

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

  useEffect(() => {
    let componenteAtivo = true;
    let verificacaoAtual = 0;

    const verificarUsuario = async (usuarioId: string | null) => {
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

      if (
        !componenteAtivo ||
        numeroVerificacao !== verificacaoAtual
      ) {
        return;
      }

      if (error) {
        console.log("Erro ao verificar usuário do alerta:", error);
        return;
      }

      setEhEstudante(data?.tipo === "estudante");
    };

    const carregarUsuarioAtual = async () => {
      const verificacaoAntesDaConsulta = verificacaoAtual;

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (
        !componenteAtivo ||
        verificacaoAntesDaConsulta !== verificacaoAtual
      ) {
        return;
      }

      if (error) {
        console.log("Erro ao recuperar usuário do alerta:", error);
        setEhEstudante(false);
        setModalVisivel(false);
        return;
      }

      await verificarUsuario(user?.id ?? null);
    };

    carregarUsuarioAtual();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      /*
       * Executa fora do callback imediato da autenticação,
       * evitando conflito com o controle interno do Supabase.
       */
      setTimeout(() => {
        if (componenteAtivo) {
          verificarUsuario(sessao?.user?.id ?? null);
        }
      }, 0);
    });

    return () => {
      componenteAtivo = false;
      subscription.unsubscribe();
    };
  }, []);

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

  if (!ehEstudante) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        style={[
          estilos.botao,
          !horarioPermitido && estilos.botaoIndisponivel,
        ]}
        onPress={abrirAlerta}
        accessibilityRole="button"
        accessibilityLabel={
          horarioPermitido
            ? "Solicitar ajuda a um tutor"
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
        visivel={modalVisivel && horarioPermitido}
        aoFechar={() => setModalVisivel(false)}
      />
    </>
  );
}

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
    fontWeight: "bold",
  },
});