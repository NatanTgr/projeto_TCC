import React from "react";
import { StatusBar } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function BarraStatusTema() {
  const { tema, tipoTema } = useTheme();

  return (
    <StatusBar
      animated
      barStyle={
        tipoTema === "claro"
          ? "dark-content"
          : "light-content"
      }
      backgroundColor={tema.background}
    />
  );
}