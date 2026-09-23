import { StyleSheet } from "react-native";
const Estilos = StyleSheet.create({
  container: { flex: 1 },
  tela: { gap: 20, padding: 15 },

  header: {
    width: "100%",
    paddingHorizontal: 15,
    marginTop: 40,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 8,
    marginBottom: 15,
  },

  headerTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",
  },

  cardPerfil: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    flexDirection: "column",
    elevation: 5,
  },

  cardConta: {
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
  textoBotaoSair: { color: "#fff", fontSize: 18 },
  texto: { fontSize: 18 },
  texto2: { fontSize: 18 },
  textoConfiguracoes: {},
  navbar: { marginBottom: 50, alignItems: "center" },
  perfilTopo: { flexDirection: "row", alignItems: "center" },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#94C0DF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
  },
  avatarTexto: { fontSize: 42 },
  informacoesPerfil: { flex: 1, gap: 4 },
  nomePerfil: { fontWeight: "bold" },
  tipoPerfil: { fontWeight: "600" },
  detalhesPerfil: { marginTop: 2 },
  botaoAvatar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 18,
  },
  textoBotaoAvatar: { fontWeight: "600" },
  botoesTema: { flexDirection: "row", gap: 8, width: "100%", flexWrap: "wrap" },
  botaoTema: {
    minWidth: "45%",
    flexGrow: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoAlerta: {
    backgroundColor: "#FF8C42",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    elevation: 3,
  },

  textoAlerta: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },

  tituloConta: {
    fontWeight: "bold",
    marginBottom: 18,
  },

  informacaoConta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  iconeConta: {
    width: 40,
    alignItems: "center",
  },

  labelConta: {
    opacity: 0.7,
    marginBottom: 3,
  },

  valorConta: {
    fontWeight: "500",
  },

  botaoAlterarSenha: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },

  textoAlterarSenha: {
    fontWeight: "600",
  },

  fundoModal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalSenha: {
    width: "85%",
    padding: 20,
    borderRadius: 15,
  },

  tituloModalSenha: {
    fontWeight: "bold",
    marginBottom: 5,
  },

  textoModalSenha: {
    opacity: 0.7,
    marginBottom: 20,
  },

  inputSenha: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 12,
  },

  botaoConfirmarSenha: {
    backgroundColor: "#4CAF50",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },

  textoConfirmarSenha: {
    color: "#fff",
    fontWeight: "bold",
  },

  botaoCancelarSenha: {
    padding: 14,
    alignItems: "center",
    marginTop: 5,
  },
});
export default Estilos;