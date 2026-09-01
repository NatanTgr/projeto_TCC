import { StyleSheet } from "react-native";

const Estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDD0',
  },

  header: {
    padding: 20,
    marginTop: 40,
  },

  topRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },

  taskCount: {
    fontSize: 14,
    color: '#666',
  },

  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
  },

  addButton: {
    backgroundColor: '#94C0DF',
    borderRadius: 8,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },

  taskList: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
    paddingBottom: 0,
    paddingTop: 0,
  },

  cardEvento: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 2,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  checkbox: {
    marginRight: 12,
  },

  taskText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },

  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },

  deleteButton: {
    padding: 8,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },

  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },

  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },


  /*Parte feita com IA até o BotaoConfirmar*/
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
  },

  scrollModal: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardModal: {
    width: '85%',
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
  },

  tituloModal: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  opcaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    },

  opcoesRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },

  radioExterno: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4B6CB7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  radioInterno: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4B6CB7',
  },

  textoOpcao: {
    fontSize: 16,
  },

  botoesModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  botaoCancelar: {
    backgroundColor: '#FFAA56',
    padding: 12,
    borderRadius: 10,
    width: '45%',
    alignItems: 'center',
  },

  botaoConfirmar: {
    backgroundColor: '#94C0DF',
    padding: 12,
    borderRadius: 10,
    width: '50%',
    alignItems: 'center',
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

  buttons: {
    marginBottom: 50,
    alignItems: "center",   
  },

  topoCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  tituloEvento: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },

  badgeTipo: {
    backgroundColor: "#94C0DF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },

  textoTipo: {
    color: "#fff",
    fontWeight: "bold",
  },

  textoTipoAdicionar: {
    paddingBottom: 15,
  },

  textodataEvento: {
    
  },
});

export default Estilos;