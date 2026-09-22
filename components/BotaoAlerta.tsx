import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

import { supabase } from "../bd/supabase";
import { useFontSize } from "../context/FontSizeContext";
import ModalAlerta from "./ModalAlerta";

export default function BotaoAlerta() {
  const { escalaFonte } = useFontSize();

  const [modalVisivel, setModalVisivel] =
    useState(false);

  const [ehEstudante, setEhEstudante] =
    useState(false);

useEffect(() => {
  let componenteAtivo = true;

  const verificarUsuario = async (usuarioId: string | null) => {
    if (!usuarioId) {
      if (componenteAtivo) {
        setEhEstudante(false);
        setModalVisivel(false);
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

    if (error) {
      console.log("Erro ao verificar usuário do alerta:", error);

      setEhEstudante(false);
      setModalVisivel(false);
      return;
    }

    const usuarioEhEstudante = data.tipo === "estudante";

    setEhEstudante(usuarioEhEstudante);

    if (!usuarioEhEstudante) {
      setModalVisivel(false);
    }
  };

  const carregarUsuarioAtual = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.log("Erro ao recuperar usuário do alerta:", error);

      if (componenteAtivo) {
        setEhEstudante(false);
      }

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
      verificarUsuario(sessao?.user?.id ?? null);
    }, 0);
  });

  return () => {
    componenteAtivo = false;
    subscription.unsubscribe();
  };
}, []);

  if (!ehEstudante) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        style={estilos.botao}
        onPress={() => setModalVisivel(true)}
        accessibilityRole="button"
        accessibilityLabel="Solicitar ajuda a um tutor"
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
        visivel={modalVisivel}
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

  texto: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});