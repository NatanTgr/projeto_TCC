import { StyleSheet } from "react-native";

const Estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDD0",
  },

  header: {
    paddingHorizontal: 15,
    marginTop: 12,
    width: "100%",
  },

  topRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 8,
    marginBottom: 15,
  },

  headerTitle: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 30,
    fontFamily: "FredokaMedium",
    color: "#333",
  },

  calendarContainer: {
    backgroundColor: "#ffffff",
    width: "100%",
    maxWidth: 350,
    alignSelf: "center",
    borderRadius: 24,
    marginTop: 10,
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
    width: "100%",
    paddingHorizontal: 4,
    paddingVertical: 10,
  },

  titulo: {
    fontSize: 30,
    fontFamily: "FredokaMedium",
    textAlign: "left",
  },

  legenda: {
    fontSize: 15,
    fontFamily: "FredokaLight",
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
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: 15,
    marginTop: 20,
    marginBottom: 10,
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
    width: "92%",
    maxWidth: 520,
    maxHeight: "85%",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    padding: 20,
  },

  tituloModalLista: {
    fontSize: 20,
    fontFamily: "FredokaMedium",
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
    fontFamily: "FredokaLight",
  },

  botaoCancelarEscolha: {
    backgroundColor: "#FFAA56",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  tituloDetalhe: {
    fontSize: 18,
    fontFamily: "FredokaMedium",
  },

  textoDetalhe: {
    fontSize: 16,
    fontFamily: "FredokaLight",
  },

  textoBotao: {
    fontSize: 16,
    fontFamily: "FredokaLight",
    textAlign: "center",
    flexShrink: 1,
    maxWidth: "100%",
  },

  itemTarefa: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },

  tituloTarefa: {
    fontSize: 16,
    fontFamily: "FredokaMedium",
  },

  tipoTarefa: {
    marginTop: 5,
    fontSize: 14,
    fontFamily: "FredokaLight",
  },

  botaoConfirmarDetalhes: {
    backgroundColor: "#94C0DF",
    padding: 12,
    borderRadius: 10,
    width: "50%",
    alignItems: "center",
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
    width: "92%",
    maxWidth: 520,
    maxHeight: "85%",
    backgroundColor: "#ffffff",
    borderRadius: 15,
    overflow: "hidden",
  },

  tituloModal: {
    fontSize: 20,
    fontFamily: "FredokaMedium",
    marginBottom: 20,
  },

  opcaoContainer: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
    marginRight: 20,
  },

  opcoesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 15,
  },

  tipoTexto: {
    paddingBottom: 15,
    fontFamily: "FredokaLight",
  },

  radioExterno: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#4B6CB7",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    flexShrink: 0,
  },

  radioInterno: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4B6CB7",
  },

  textoOpcao: {
    fontSize: 16,
    fontFamily: "FredokaLight",
    flexShrink: 1,
  },

  botoesModal: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    alignItems: "stretch",
    marginTop: 20,
    gap: 12,
  },

  botaoCancelar: {
    backgroundColor: "#FFAA56",
    borderRadius: 10,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 140,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoConfirmar: {
    backgroundColor: "#94C0DF",
    borderRadius: 10,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 140,
    alignItems: "center",
    justifyContent: "center",
  },

  infoTarefa: {
    gap: 10,
  },

  textosInfo: {
    borderWidth: 1,
    borderColor: "#dbdbdb",
    borderRadius: 10,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: "FredokaLight",
  },

  titulosInfoTarefa: {
    marginTop: 20,
    fontFamily: "FredokaMedium",
  },

  modalDate: {
    fontSize: 18,
    fontFamily: "FredokaLight",
    marginBottom: 20,
  },

  cabecalhoCalendario: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    fontFamily: "FredokaLight",
  },
});

export default Estilos;