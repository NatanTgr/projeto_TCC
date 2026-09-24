import { StyleSheet } from "react-native";

const Estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDD0",
  },

  header: {
    paddingLeft: 15,
    paddingRight: 15,
    marginTop: 40,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 8,
  },

  headerTitle: {
    flexShrink: 1,
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",
  },

  studentCount: {
    fontSize: 14,
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
    fontWeight: "500",
  },

  informacoes: {
    flex: 1,
    minWidth: 0,
  },

  nomeAluno: {
    fontSize: 18,
    fontWeight: "bold",
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
    color: "#7DAED1",
    fontSize: 11,
  },

  tagTurno: {
    backgroundColor: "#EAF6E8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  textoTagTurno: {
    color: "#83B77A",
    fontSize: 11,
  },

  tarefasPendentes: {
    fontSize: 14,
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
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  modalFiltro: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },

  tituloModal: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  subtituloModal: {
    fontSize: 13,
    marginBottom: 15,
  },

  itemFiltro: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },

  iconeFiltro: {
    marginRight: 10,
  },

  nomeFiltro: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },

  botaoAplicar: {
    marginTop: 15,
    marginBottom: 40,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  textoAplicar: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Estilos;