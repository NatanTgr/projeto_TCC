import { StyleSheet } from "react-native";

const Estilos = StyleSheet.create({
  container: {
    flex: 1,
  },

  tela: {
    gap: 6,
    padding: 8,
  },

  titulo: {
    marginTop: 15,
    marginBottom: 6,
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
  },

  cardPerfil: {
    backgroundColor: "#fff",
    borderRadius: 11,
    padding: 10,
    flexDirection: "column",
    elevation: 4,
  },

  cardTutorial: {
    backgroundColor: "#fff",
    borderRadius: 11,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },

  cardConfig: {
    backgroundColor: "#fff",
    borderRadius: 11,
    padding: 10,
    gap: 5,
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },

  cardTema: {
    backgroundColor: "#FFFDD0",
    borderRadius: 11,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },

  cardOpcoes: {
    backgroundColor: "#FFFDD0",
    borderRadius: 11,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },

  cardNotiChat: {
    backgroundColor: "#FFFDD0",
    borderRadius: 11,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },

  cardLembrete: {
    backgroundColor: "#FFFDD0",
    borderRadius: 11,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },

  botaoSair: {
    backgroundColor: "#fe0505",
    borderRadius: 11,
    padding: 10,
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },

  textoBotaoSair: {
    color: "#fff",
    fontSize: 16,
  },

  texto: {
    fontSize: 16,
  },

  texto2: {
    fontSize: 16,
  },

  textoConfiguracoes: {},

  navbar: {
    marginBottom: 15,
    alignItems: "center",
  },

  perfilTopo: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarContainer: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: "#94C0DF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  avatarTexto: {
    fontSize: 30,
  },

  informacoesPerfil: {
    flex: 1,
    gap: 1,
  },

  nomePerfil: {
    fontWeight: "bold",
  },

  tipoPerfil: {
    fontWeight: "600",
  },

  detalhesPerfil: {
    marginTop: 0,
  },

  botaoAvatar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 8,
    padding: 7,
    marginTop: 7,
  },

  textoBotaoAvatar: {
    fontWeight: "600",
  },

  botoesTema: {
    flexDirection: "row",
    gap: 5,
    width: "100%",
  },

  botaoTema: {
    flex: 1,
    padding: 7,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  cabecalhoConfig: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 25,
  },

  botaoAlerta: {
    backgroundColor: "#FF8C42",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    elevation: 3,
  },

  textoAlerta: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Estilos;