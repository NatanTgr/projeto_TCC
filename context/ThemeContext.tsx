import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type TipoTema = "claro" | "escuro" | "forte";

type ThemeContextType = {
  tipoTema: TipoTema;
  alternarTema: () => void;
  selecionarTema: (tema: TipoTema) => void;
  carregando: boolean;
  tema: any;
};

const ThemeContext = createContext<ThemeContextType>(
  {} as ThemeContextType
);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [tipoTema, setTipoTema] = useState<TipoTema>("claro");
  const [carregando, setCarregando] = useState(true);

  const tema =
    tipoTema === "escuro"
      ? {
          background: "#897272",
          card: "#2A2A2A",
          text: "#FFFDD0",
          secondaryText: "#CCCCCC",
          input: "#333333",
          border: "#444444",
          primary: "#94C0DF",
          modal: "#524c4c",
        }
      : tipoTema === "forte"
        ? {
            background: "#e90000",
            card: "#FFF200",
            text: "#ffffff",
            secondaryText: "#222222",
            input: "#FFFFFF",
            border: "#000000",
            primary: "#0057FF",
            modal: "#ff6200",
          }
        : {
            background: "#FFFDD0",
            card: "#FFFFFF",
            text: "#836F68",
            secondaryText: "#666666",
            input: "#FFFFFF",
            border: "#DDDDDD",
            primary: "#94C0DF",
            modal: "#fff",
          };

  useEffect(() => {
    carregarTema();
  }, []);

  async function carregarTema() {
    try {
      const temaSalvo = await AsyncStorage.getItem("tema");

      if (temaSalvo !== null) {
        // Compatibilidade com o sistema antigo:
        // false = claro
        // true = escuro
        if (temaSalvo === "true") {
          setTipoTema("escuro");
        } else if (temaSalvo === "false") {
          setTipoTema("claro");
        } else {
          setTipoTema(JSON.parse(temaSalvo));
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setCarregando(false);
    }
  }

  async function selecionarTema(novoTema: TipoTema) {
    try {
      setTipoTema(novoTema);

      await AsyncStorage.setItem(
        "tema",
        JSON.stringify(novoTema)
      );
    } catch (error) {
      console.log(error);
    }
  }

  async function alternarTema() {
    let novoTema: TipoTema;

    if (tipoTema === "claro") {
      novoTema = "escuro";
    } else if (tipoTema === "escuro") {
      novoTema = "forte";
    } else {
      novoTema = "claro";
    }

    await selecionarTema(novoTema);
  }

  return (
    <ThemeContext.Provider
      value={{
        tipoTema,
        alternarTema,
        selecionarTema,
        carregando,
        tema,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}