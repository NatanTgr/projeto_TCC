import { StyleSheet } from "react-native";

const Estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDD0",
  },

  header: {
    width: "100%",
    paddingHorizontal: 15,
    marginTop: 12,
  },

  topRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 8,
    marginBottom: 12,
  },

  headerTitle: {
    flex: 1,
    flexShrink: 1,
    fontSize: 30,
    minWidth: 0,
    fontFamily: "FredokaMedium",
    color: "#333",
  },

  studentCount: {
    fontSize: 14,
    fontFamily: "FredokaLight",
    color: "#666",
    marginBottom: 10,
  },

  lista: {
    flex: 1,
  },

  listaConteudo: {
    paddingHorizontal: 15,
    paddingBottom: 25,
  },

  cardAluno: {
    minHeight: 98,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#94C0DF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },

  avatarTexto: {
    fontSize: 20,
    color: "#FFFFFF",
    fontFamily: "FredokaLight",
  },

  informacoes: {
    flex: 1,
    minWidth: 0,
  },

  nomeAluno: {
    fontSize: 18,
    fontFamily: "FredokaMedium",
    marginBottom: 6,
  },

  linhaInformacoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },

  tagTurma: {
    backgroundColor: "#EAF4FA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  textoTag: {
    color: "#477FA3",
    fontSize: 11,
    fontFamily: "FredokaLight",
  },

  tagTurno: {
    backgroundColor: "#EAF6E8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  textoTagTurno: {
    color: "#477D40",
    fontSize: 11,
    fontFamily: "FredokaLight",
  },

  tagCurso: {
    backgroundColor: "#F3ECFA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    maxWidth: "100%",
  },

  textoTagCurso: {
    color: "#8663A8",
    fontSize: 11,
    fontFamily: "FredokaLight",
    flexShrink: 1,
  },

  tagEscolaridade: {
    backgroundColor: "#FFF0DD",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    maxWidth: "100%",
  },

  textoTagEscolaridade: {
    color: "#9D682C",
    fontSize: 11,
    fontFamily: "FredokaLight",
    flexShrink: 1,
  },

  tarefasPendentes: {
    fontSize: 14,
    fontFamily: "FredokaLight",
    marginTop: 7,
  },

  botaoFixar: {
    width: 40,
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 5,
  },

  semAlunos: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },

  semAlunosTexto: {
    marginTop: 16,
    fontFamily: "FredokaLight",
    textAlign: "center",
  },

  linhaFiltro: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: "flex-end",
  },

  botaoFiltro: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },

  textoFiltro: {
    fontSize: 13,
    fontFamily: "FredokaLight",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  modalFiltro: {
    width: "100%",
    maxWidth: 540,
    maxHeight: "85%",
    alignSelf: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },

  cabecalhoFiltro: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    flexShrink: 0,
  },

  linhaTituloFiltro: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 12,
    rowGap: 4,
    marginBottom: 5,
  },

  tituloModal: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 140,
    minWidth: 0,
    fontFamily: "FredokaMedium",
  },

  botaoSelecionarTodos: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minHeight: 44,
    maxWidth: "100%",
    marginLeft: "auto",
    gap: 6,
  },

  iconeSelecionarTodos: {
    flexShrink: 0,
  },

  textoSelecionarTodos: {
    fontFamily: "FredokaMedium",
    flexShrink: 1,
    textAlign: "right",
  },

  subtituloModal: {
    fontFamily: "FredokaLight",
  },

  listaFiltro: {
    flexGrow: 0,
    flexShrink: 1,
    minHeight: 0,
  },

  listaFiltroConteudo: {
    paddingHorizontal: 20,
  },

  itemFiltro: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },

  iconeFiltro: {
    marginRight: 10,
    flexShrink: 0,
  },

  nomeFiltro: {
    flex: 1,
    minWidth: 0,
    fontFamily: "FredokaLight",
  },

  rodapeFiltro: {
    padding: 20,
    flexShrink: 0,
  },

  botaoAplicar: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  textoAplicar: {
    color: "#FFFFFF",
    fontFamily: "FredokaMedium",
    textAlign: "center",
  },
});

export default Estilos;