
import { StyleSheet } from "react-native";

const Estilos = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 24,
  },

  modal: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 25,
  },

  conteudo: {
    alignItems: "center",
    paddingBottom: 4,
  },

  iconeContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  titulo: {
    fontFamily: "FredokaMedium",
    textAlign: "center",
    marginBottom: 12,
  },

  subtitulo: {
    fontFamily: "FredokaMedium",
    textAlign: "center",
    marginBottom: 14,
  },

  descricao: {
    fontFamily: "FredokaLight",
    textAlign: "center",
    lineHeight: 24,
  },

  divisor: {
    width: "100%",
    height: 1,
    marginVertical: 20,
  },

  orientacao: {
    fontFamily: "FredokaLight",
    textAlign: "center",
    lineHeight: 25,
    marginBottom: 22,
  },

  botao: {
    width: "100%",
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  textoBotao: {
    fontFamily: "FredokaMedium",
    textAlign: "center",
  },

  mensagemErro: {
    fontFamily: "FredokaLight",
    textAlign: "center",
    color: "#D32F2F",
    marginBottom: 12,
  },
});

export default Estilos;
