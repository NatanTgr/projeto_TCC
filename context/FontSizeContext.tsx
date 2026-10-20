
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

type TamanhoFonte = "pequeno" | "normal" | "grande" | "muitoGrande";

type FontSizeContextType = {
  tamanhoFonte: TamanhoFonte;
  escalaFonte: number;
  selecionarTamanhoFonte: (tamanho: TamanhoFonte) => void;
};

const FontSizeContext = createContext<FontSizeContextType | undefined>(
  undefined
);

const ESCALAS = {
  pequeno: 0.85,
  normal: 1,
  grande: 1.2,
  muitoGrande: 1.4,
};

export function FontSizeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tamanhoFonte, setTamanhoFonte] =
    useState<TamanhoFonte>("normal");

  // =====================================================
  // CARREGAR PREFERÊNCIA DE TAMANHO DA FONTE
  // =====================================================

  useEffect(() => {
    // Correção SonarCloud S9383
    void carregarTamanhoFonte().catch((error) => {
      console.error(
        "Erro inesperado ao carregar tamanho da fonte:",
        error
      );
    });
  }, []);

  async function carregarTamanhoFonte() {
    try {
      const tamanhoSalvo = await AsyncStorage.getItem("tamanhoFonte");

      if (
        tamanhoSalvo === "pequeno" ||
        tamanhoSalvo === "normal" ||
        tamanhoSalvo === "grande" ||
        tamanhoSalvo === "muitoGrande"
      ) {
        setTamanhoFonte(tamanhoSalvo);
      }
    } catch (error) {
      console.log(
        "Erro ao carregar tamanho da fonte:",
        error
      );
    }
  }

  // =====================================================
  // ALTERAR E SALVAR TAMANHO DA FONTE
  // =====================================================

  async function selecionarTamanhoFonte(tamanho: TamanhoFonte) {
    try {
      setTamanhoFonte(tamanho);

      await AsyncStorage.setItem("tamanhoFonte", tamanho);
    } catch (error) {
      console.log(
        "Erro ao salvar tamanho da fonte:",
        error
      );
    }
  }

  // =====================================================
  // PROVIDER
  // =====================================================

  return (
    <FontSizeContext.Provider
      value={{
        tamanhoFonte,
        escalaFonte: ESCALAS[tamanhoFonte],
        selecionarTamanhoFonte,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
}

// =====================================================
// HOOK PARA ACESSAR O CONTEXTO
// =====================================================

export function useFontSize() {
  const contexto = useContext(FontSizeContext);

  if (!contexto) {
    throw new Error(
      "useFontSize deve ser usado dentro de um FontSizeProvider"
    );
  }

  return contexto;
}
