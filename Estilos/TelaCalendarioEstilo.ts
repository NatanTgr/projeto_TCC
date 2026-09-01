import { StyleSheet } from "react-native";

const Estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDD0",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  calendarContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    marginTop: 2,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  calendar: {
    borderRadius: 24,
    width: 350,
    padding: 15,
  },

  titulo: {
    marginTop: 0,
    marginBottom: 30,
    fontSize: 50,
    fontWeight: "bold",
    textAlign: "center",
  },

  legenda: {
    fontSize: 15,
  },

  legendaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  quadrado: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },

  legendaContainer: {
    flexDirection: "row",
    gap: 40,
  },

  buttons: {
    marginTop: 20,
    gap: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  cardModalEscolha: {
    width: "85%",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
  },

  tituloModalLista: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },

  botaoEscolha: {
    backgroundColor: "#94C0DF",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },

  textoBotaoEscolha: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  botaoCancelarEscolha: {
    backgroundColor: "#FFAA56",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  itemTarefa: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },

  tituloTarefa: {
    fontSize: 16,
    fontWeight: "bold",
  },

  tipoTarefa: {
    marginTop: 5,
    fontSize: 14,
  },

  botaoConfirmarDetalhes: {
    backgroundColor: '#94C0DF',
    padding: 12,
    borderRadius: 10,
    width: '50%',
    alignItems: 'center',
  },

  deleteButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    padding: 10,
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
    padding: 20,
  },

  tituloModal: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },

  opcaoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },

  opcoesRow: {
    flexDirection: "row",
    marginBottom: 15,
  },

  tipoTexto: {
    paddingBottom: 15,
  },

  radioExterno: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4B6CB7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  radioInterno: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4B6CB7",
  },

  textoOpcao: {
    fontSize: 16,
  },

  botoesModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  botaoCancelar: {
    backgroundColor: "#FFAA56",
    padding: 12,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },

  botaoConfirmar: {
    backgroundColor: "#94C0DF",
    padding: 12,
    borderRadius: 10,
    width: "50%",
    alignItems: "center",
  },

  infoTarefa: {
    gap: 10,
  },

  textosInfo: {
    borderWidth: 1,
    borderColor: "#dbdbdb",
    borderRadius: 10,
  },

  titulosInfoTarefa: {
    marginTop: 20,
  },

  modalDate: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default Estilos;