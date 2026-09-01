import { StyleSheet } from "react-native";

const Estilos = StyleSheet.create({
  container: {
    flex: 1,
  },

  tela: {
    gap: 20,
    padding: 15,
  },

  titulo: {
    marginTop: 50,
    marginBottom: 30,
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },

  cardPerfil: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    flexDirection: "column",
    elevation: 5,
  },

  cardTutorial: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
  },

  cardConfig: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    gap: 10,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
  },

  cardTema: {
    backgroundColor: "#FFFDD0",
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
  },

  cardOpcoes: {
    backgroundColor: "#FFFDD0",
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
  },

  cardNotiChat: {
    backgroundColor: "#FFFDD0",
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
  },

  cardLembrete: {
    backgroundColor: "#FFFDD0",
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    elevation: 5,
  },

  botaoSair: {
    backgroundColor: "#fe0505",
    borderRadius: 15,
    padding: 20,
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
  },

  textoBotaoSair: {
    color: "#fff",
    fontSize: 18,
  },

  texto: {
    fontSize: 18,
  },

  texto2: {
    fontSize: 18,
  },

  textoConfiguracoes: {
    
  },

  navbar: {
    marginBottom: 50,
    alignItems: "center",   
  },
});

export default Estilos;