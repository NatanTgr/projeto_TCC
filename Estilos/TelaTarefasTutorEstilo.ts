import { StyleSheet } from "react-native";

const Estilos = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },

  titulo: {
    fontSize: 23,
    fontWeight: "500",
    marginLeft: 30,
    marginBottom: 18,
  },

  lista: {
    flex: 1,
  },

  listaConteudo: {
    paddingHorizontal: 30,
    paddingBottom: 25,
  },

  cardAluno: {
    minHeight: 98,
    borderRadius: 17,
    marginBottom: 9,
    paddingHorizontal: 16,

    flexDirection: "row",
    alignItems: "center",

    elevation: 3,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.12,
    shadowRadius: 3,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,

    backgroundColor: "#94C0DF",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  avatarTexto: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  informacoes: {
    flex: 1,
  },

  nomeAluno: {
    fontSize: 16,
    marginBottom: 5,
  },

  linhaInformacoes: {
    flexDirection: "row",
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
    color: "#B9AAAA",
    fontSize: 12,
    marginTop: 5,
  },

  botaoFixar: {
    width: 40,
    height: 50,

    justifyContent: "center",
    alignItems: "center",

    marginLeft: 5,
  },

  semAlunos: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },

  semAlunosTexto: {
    marginTop: 10,
    fontSize: 15,
  },
});

export default Estilos;