
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../bd/supabase";

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

const TEMA_PADRAO: TipoTema = "claro";

function validarTema(valor: string | null): TipoTema {
  if (!valor) return TEMA_PADRAO;

  try {
    // Compatibilidade com formatos de armazenamento.
    const temaSalvo =
      valor === "true"
        ? "escuro"
        : valor === "false"
          ? "claro"
          : valor.startsWith('"')
            ? JSON.parse(valor)
            : valor;

    if (
      temaSalvo === "claro" ||
      temaSalvo === "escuro" ||
      temaSalvo === "forte"
    ) {
      return temaSalvo;
    }
  } catch (erro) {
    console.error("Erro ao interpretar tema salvo:", erro);
  }

  return TEMA_PADRAO;
}

function chaveTema(usuarioId: string): string {
  return `@paed:tema:${usuarioId}`;
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [tipoTema, setTipoTema] =
    useState<TipoTema>(TEMA_PADRAO);

  const [carregando, setCarregando] = useState(true);

  const usuarioAtualRef = useRef<string | null>(null);
  const geracaoRef = useRef(0);
  const inicializadoRef = useRef(false);

  // =====================================================
  // CONFIGURAÇÕES DOS TEMAS
  // =====================================================

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
          professores: "#94c0df",
          Tutores: "#88c688",
          balaoChat: "#524c4c",

          botaoCancelar: "#655854",
          textoBotaoCancelar: "#FFFDD0",
          bordaBotaoCancelar: "#655854",
          larguraBordaBotaoCancelar: 0,

          baloes: {
            estudante: "#65432C",
            professor: "#294B63",
            tutor: "#345438",
            napne: "#503D65",
            padrao: "#2A2A2A",

            texto: "#FFFDD0",

            bordas: {
              estudante: "#65432C",
              professor: "#294B63",
              tutor: "#345438",
              napne: "#503D65",
              padrao: "#2A2A2A",
            },
          },

          placeholder: "#fff",
          textoBotao: "#fff",
        }
      : tipoTema === "forte"
        ? {
            background: "#000000",
            card: "#303030",
            text: "#ffea00",
            secondaryText: "#222222",
            input: "#FFFFFF",
            border: "#000000",
            primary: "#0057FF",
            modal: "#303030",
            professores: "#94c0df",
            Tutores: "#88c688",
            balaoChat: "#0057FF",

            botaoCancelar: "#303030",
            textoBotaoCancelar: "#FFEA00",
            bordaBotaoCancelar: "#FFEA00",
            larguraBordaBotaoCancelar: 2,

            baloes: {
              estudante: "#000000",
              professor: "#000000",
              tutor: "#000000",
              napne: "#000000",
              padrao: "#000000",

              texto: "#FFEA00",

              bordas: {
                estudante: "#FFAA56",
                professor: "#94C0DF",
                tutor: "#88C688",
                napne: "#C5A5E5",
                padrao: "#FFEA00",
              },
            },

            placeholder: "#fff",
            textoBotao: "#fff",
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
            professores: "#94c0df",
            Tutores: "#88c688",
            balaoChat: "#ffb1638f",

            botaoCancelar: "#8C7B75",
            textoBotaoCancelar: "#FFFFFF",
            bordaBotaoCancelar: "#8C7B75",
            larguraBordaBotaoCancelar: 0,

            baloes: {
              estudante: "#FFE0BD",
              professor: "#D6EAF7",
              tutor: "#DCEED8",
              napne: "#E8DDF3",
              padrao: "#FFFFFF",

              texto: "#493B35",

              bordas: {
                estudante: "#FFE0BD",
                professor: "#D6EAF7",
                tutor: "#DCEED8",
                napne: "#E8DDF3",
                padrao: "#FFFFFF",
              },
            },

            placeholder: "#836F6880",
            textoBotao: "#fff",
          };

  // =====================================================
  // CARREGAR TEMA ESPECÍFICO DE CADA CONTA
  // =====================================================

  useEffect(() => {
    let ativo = true;
    let recebeuEventoAuth = false;

    const atualizarUsuario = (usuarioId: string | null) => {
      if (!ativo) return;

      if (
        inicializadoRef.current &&
        usuarioAtualRef.current === usuarioId
      ) {
        return;
      }

      inicializadoRef.current = true;
      usuarioAtualRef.current = usuarioId;

      const geracaoAtual = ++geracaoRef.current;

      // Impede que o tema da conta anterior apareça.
      setTipoTema(TEMA_PADRAO);

      if (!usuarioId) {
        setCarregando(false);
        return;
      }

      setCarregando(true);

      void AsyncStorage.getItem(chaveTema(usuarioId))
        .then((valorSalvo) => {
          if (
            !ativo ||
            geracaoAtual !== geracaoRef.current
          ) {
            return;
          }

          setTipoTema(validarTema(valorSalvo));
        })
        .catch((erro) => {
          if (
            !ativo ||
            geracaoAtual !== geracaoRef.current
          ) {
            return;
          }

          console.error(
            "Erro ao carregar tema da conta:",
            erro
          );

          setTipoTema(TEMA_PADRAO);
        })
        .finally(() => {
          if (
            ativo &&
            geracaoAtual === geracaoRef.current
          ) {
            setCarregando(false);
          }
        });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (!ativo) return;

      recebeuEventoAuth = true;
      atualizarUsuario(session?.user?.id ?? null);
    });

    void supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!ativo || recebeuEventoAuth) return;

        if (error) {
          console.error(
            "Erro ao recuperar sessão para o tema:",
            error
          );
        }

        atualizarUsuario(session?.user?.id ?? null);
      })
      .catch((erro) => {
        if (!ativo || recebeuEventoAuth) return;

        console.error(
          "Erro inesperado ao recuperar sessão do tema:",
          erro
        );

        atualizarUsuario(null);
      });

    return () => {
      ativo = false;
      geracaoRef.current++;
      subscription.unsubscribe();
    };
  }, []);

  // =====================================================
  // SELECIONAR TEMA
  // =====================================================

  function selecionarTema(novoTema: TipoTema) {
    if (carregando) return;

    const usuarioId = usuarioAtualRef.current;

    if (!usuarioId) {
      return;
    }

    setTipoTema(novoTema);

    void AsyncStorage.setItem(
      chaveTema(usuarioId),
      novoTema
    ).catch((erro) => {
      console.error(
        "Erro ao salvar tema da conta:",
        erro
      );
    });
  }

  // =====================================================
  // ALTERNAR ENTRE OS TEMAS
  // =====================================================

  function alternarTema() {
    let novoTema: TipoTema;

    if (tipoTema === "claro") {
      novoTema = "escuro";
    } else if (tipoTema === "escuro") {
      novoTema = "forte";
    } else {
      novoTema = "claro";
    }

    selecionarTema(novoTema);
  }

  // =====================================================
  // PROVIDER
  // =====================================================

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

// =====================================================
// HOOK PARA ACESSAR O TEMA
// =====================================================

export function useTheme() {
  return useContext(ThemeContext);
}
