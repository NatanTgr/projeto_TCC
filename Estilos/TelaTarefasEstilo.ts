import { StyleSheet } from "react-native";

const Estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDD0",
  },

  header: {
    padding: 12,
    marginTop: 25,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },

  headerTitle: {
    fontSize: 27,
    fontWeight: "bold",
    color: "#333",
  },

  taskCount: {
    fontSize: 13,
    color: "#666",
  },

  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginRight: 8,
    fontSize: 15,
  },

  addButton: {
    backgroundColor: "#94C0DF",
    borderRadius: 8,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },

  taskList: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 0,
    paddingTop: 0,
  },

  /* CARD DA TAREFA */
  cardEvento: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 2,
    padding: 11,
    marginBottom: 7,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  checkbox: {
    marginRight: 8,
  },

  taskText: {
    flex: 1,
    fontSize: 15,
    color: "#333",
  },

  completedTaskText: {
    textDecorationLine: "line-through",
    color: "#999",
  },

  deleteButton: {
    padding: 5,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },

  emptyStateText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#999",
    marginTop: 10,
    textAlign: "center",
  },

  emptyStateSubtext: {
    fontSize: 13,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },

  /* MODAL */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  scrollModal: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  cardModal: {
    width: "85%",
    maxHeight: "85%",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 16,
  },

  tituloModal: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },

  opcaoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },

  opcoesRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  radioExterno: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#4B6CB7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  radioInterno: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4B6CB7",
  },

  textoOpcao: {
    fontSize: 15,
  },

  botoesModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  botaoCancelar: {
    backgroundColor: "#FFAA56",
    padding: 10,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },

  botaoConfirmar: {
    backgroundColor: "#94C0DF",
    padding: 10,
    borderRadius: 10,
    width: "50%",
    alignItems: "center",
  },

  textoBotao: {
    fontSize: 15,
    textAlign: "center",
  },

  /* INFORMAÇÕES DA TAREFA */

  infoTarefa: {
    gap: 7,
  },

  textosInfo: {
    borderWidth: 1,
    borderColor: "#dbdbdb",
    borderRadius: 8,
  },

  titulosInfoTarefa: {
    marginTop: 12,
  },

  buttons: {
    marginBottom: 25,
    alignItems: "center",
  },

  /* TOPO DO CARD */

  topoCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  tituloEvento: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },

  badgeTipo: {
    backgroundColor: "#94C0DF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  textoTipo: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },

  textoTipoAdicionar: {
    paddingBottom: 10,
  },

  textodataEvento: {},

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
});

export default Estilos;