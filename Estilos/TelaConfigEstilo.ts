
import { StyleSheet } from "react-native";
import type { useTheme } from "../context/ThemeContext";

type Tema = ReturnType<typeof useTheme>["tema"];

export default function criarEstilos(
  tema: Tema,
  escalaFonte: number
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tema.background,
    },

    tela: {
      gap: 20,
      padding: 15,
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
      marginBottom: 15,
    },

    headerTitle: {
      flex: 1,
      flexShrink: 1,
      minWidth: 0,
      fontSize: 30 * escalaFonte,
      fontFamily: "FredokaMedium",
      color: tema.text,
    },

    cardPerfil: {
      backgroundColor: tema.modal,
      borderRadius: 15,
      padding: 20,
      flexDirection: "column",
      elevation: 5,
    },

    cardConta: {
      backgroundColor: tema.modal,
      borderRadius: 15,
      padding: 20,
      flexDirection: "column",
      elevation: 5,
    },

    cardTutorial: {
      backgroundColor: tema.modal,
      borderRadius: 15,
      padding: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      elevation: 5,
    },

    conteudoTutorial: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },

    textoTutorial: {
      color: tema.text,
      fontSize: 18 * escalaFonte,
      fontFamily: "FredokaLight",
      flexShrink: 1,
    },

    cardConfig: {
      backgroundColor: tema.modal,
      borderRadius: 15,
      padding: 20,
      gap: 10,
      flexDirection: "column",
      justifyContent: "space-between",
      alignItems: "center",
      elevation: 5,
    },

    cardOpcoes: {
      backgroundColor: tema.card,
      borderRadius: 15,
      width: "100%",
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      elevation: 5,
    },

    conteudoOpcao: {
      flex: 1,
      minWidth: 0,
    },

    tituloOpcao: {
      color: tema.text,
      fontSize: 18 * escalaFonte,
      fontFamily: "FredokaMedium",
    },

    textoTamanhoAtual: {
      color: tema.text,
      fontSize: 14 * escalaFonte,
      fontFamily: "FredokaLight",
      marginTop: 5,
      textAlign: "center",
    },

    textoResumoLimpeza: {
      color: tema.text,
      fontSize: 14 * escalaFonte,
      fontFamily: "FredokaLight",
      marginTop: 6,
    },

    cardNotiChat: {
      backgroundColor: tema.card,
      borderRadius: 15,
      width: "100%",
      minHeight: 70,
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      elevation: 5,
    },

    cardLembrete: {
      backgroundColor: tema.card,
      borderRadius: 15,
      width: "100%",
      minHeight: 70,
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
      elevation: 5,
    },

    textoNotificacao: {
      flex: 1,
      color: tema.text,
      fontSize: 16 * escalaFonte,
      fontFamily: "FredokaLight",
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
      fontSize: 16 * escalaFonte,
      fontFamily: "FredokaLight",
    },

    perfilTopo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },

    perfilTopoEmColuna: {
      flexDirection: "column",
      alignItems: "flex-start",
    },

    avatarContainer: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: "#94C0DF",
      justifyContent: "center",
      alignItems: "center",
      flexShrink: 0,
    },

    avatarTexto: {
      fontSize: 42,
      fontFamily: "FredokaLight",
    },

    informacoesPerfil: {
      flex: 1,
      gap: 4,
    },

    informacoesPerfilEmColuna: {
      flex: 0,
      width: "100%",
    },

    nomePerfil: {
      color: tema.text,
      fontSize: 21 * escalaFonte,
      fontFamily: "FredokaMedium",
    },

    tipoPerfil: {
      color: tema.text,
      fontSize: 16 * escalaFonte,
      fontFamily: "FredokaLight",
    },

    detalhesPerfil: {
      color: tema.text,
      fontSize: 14 * escalaFonte,
      fontFamily: "FredokaLight",
      marginTop: 2,
    },

    botaoAvatar: {
      backgroundColor: tema.card,
      borderColor: tema.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      marginTop: 18,
    },

    textoBotaoAvatar: {
      color: tema.text,
      fontSize: 15 * escalaFonte,
      fontFamily: "FredokaLight",
      flexShrink: 1,
      textAlign: "center",
    },

    secaoTema: {
      width: "100%",
    },

    tituloTema: {
      color: tema.text,
      fontSize: 20 * escalaFonte,
      fontFamily: "FredokaMedium",
      marginBottom: 10,
      textAlign: "center",
    },

    botoesTema: {
      flexDirection: "row",
      gap: 8,
      width: "100%",
      flexWrap: "wrap",
    },

    botaoTema: {
      backgroundColor: tema.card,
      borderColor: tema.border,
      minHeight: 48,
      flexGrow: 1,
      flexBasis: 120,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    botaoTemaSelecionado: {
      backgroundColor: "#94C0DF",
    },

    botaoTemaForteSelecionado: {
      backgroundColor: "#FF6B00",
    },

    textoBotaoTema: {
      color: tema.text,
      fontSize: 14 * escalaFonte,
      fontFamily: "FredokaLight",
    },

    tituloConta: {
      color: tema.text,
      fontSize: 20 * escalaFonte,
      fontFamily: "FredokaMedium",
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

    conteudoConta: {
      flex: 1,
    },

    labelConta: {
      color: tema.text,
      fontSize: 14 * escalaFonte,
      fontFamily: "FredokaLight",
      opacity: 0.7,
      marginBottom: 3,
    },

    valorConta: {
      color: tema.text,
      fontSize: 16 * escalaFonte,
      fontFamily: "FredokaLight",
    },

    botaoAlterarSenha: {
      backgroundColor: tema.card,
      borderColor: tema.border,
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
      color: tema.text,
      fontSize: 15 * escalaFonte,
      fontFamily: "FredokaLight",
      flexShrink: 1,
      textAlign: "center",
    },

    fundoModal: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.5)",
    },

    modalTamanhoFonte: {
      width: "85%",
      padding: 20,
      borderRadius: 15,
      backgroundColor: tema.modal,
    },

    tituloModalFonte: {
      color: tema.text,
      fontSize: 22 * escalaFonte,
      fontFamily: "FredokaMedium",
      marginBottom: 20,
    },

    opcaoTamanhoFonte: {
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      backgroundColor: tema.card,
      borderWidth: 1,
      borderColor: tema.border,
    },

    opcaoTamanhoSelecionada: {
      backgroundColor: "#94C0DF",
    },

    textoOpcaoTamanho: {
      color: tema.text,
      fontFamily: "FredokaLight",
    },

    pequeno: {
      fontSize: 14 * escalaFonte,
    },

    normal: {
      fontSize: 16 * escalaFonte,
    },

    grande: {
      fontSize: 18 * escalaFonte,
    },

    muitoGrande: {
      fontSize: 20 * escalaFonte,
    },

    // BOTÃO FECHAR - TAMANHO DA FONTE

    botaoFecharFonte: {
      backgroundColor: tema.botaoCancelar,
      borderColor: tema.bordaBotaoCancelar,
      borderWidth: tema.larguraBordaBotaoCancelar,
      borderRadius: 10,
      minHeight: 48,
      padding: 14,
      marginTop: 10,
      alignItems: "center",
      justifyContent: "center",
    },

    textoFechar: {
      color: tema.textoBotaoCancelar,
      fontSize: 16 * escalaFonte,
      fontFamily: "FredokaMedium",
      textAlign: "center",
    },

    modalSenha: {
      width: "92%",
      maxWidth: 520,
      maxHeight: "85%",
      padding: 20,
      borderRadius: 15,
      backgroundColor: tema.modal,
      flexGrow: 0,
    },

    conteudoModal: {
      padding: 20,
    },

    tituloModalSenha: {
      color: tema.text,
      fontSize: 21 * escalaFonte,
      fontFamily: "FredokaMedium",
      marginBottom: 5,
    },

    textoModalSenha: {
      color: tema.text,
      fontSize: 14 * escalaFonte,
      fontFamily: "FredokaLight",
      opacity: 0.7,
      marginBottom: 20,
    },

    inputSenha: {
      backgroundColor: tema.card,
      borderColor: tema.border,
      color: tema.text,
      fontSize: 16 * escalaFonte,
      fontFamily: "FredokaLight",
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
      fontSize: 16 * escalaFonte,
      fontFamily: "FredokaLight",
      textAlign: "center",
    },

    // BOTÃO CANCELAR - SENHA, LIMPEZA E TURMA

    botaoCancelarSenha: {
      backgroundColor: tema.botaoCancelar,
      borderColor: tema.bordaBotaoCancelar,
      borderWidth: tema.larguraBordaBotaoCancelar,
      borderRadius: 10,
      minHeight: 48,
      padding: 14,
      marginTop: 10,
      alignItems: "center",
      justifyContent: "center",
    },

    textoCancelarSenha: {
      color: tema.textoBotaoCancelar,
      fontSize: 16 * escalaFonte,
      fontFamily: "FredokaMedium",
      textAlign: "center",
    },

    modalLimpeza: {
      width: "92%",
      maxWidth: 520,
      maxHeight: "85%",
      flexGrow: 0,
      borderRadius: 15,
      backgroundColor: tema.modal,
    },

    tituloModalLimpeza: {
      color: tema.text,
      fontSize: 21 * escalaFonte,
      fontFamily: "FredokaMedium",
      marginBottom: 10,
    },

    textoModalLimpeza: {
      color: tema.text,
      fontSize: 14 * escalaFonte,
      fontFamily: "FredokaLight",
      marginBottom: 18,
    },

    opcaoLimpeza: {
      minHeight: 48,
      padding: 15,
      marginBottom: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: tema.text,
      backgroundColor: tema.card,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    opcaoLimpezaSelecionada: {
      borderWidth: 2,
    },

    textoOpcaoLimpeza: {
      flex: 1,
      flexShrink: 1,
      color: tema.text,
      fontSize: 16 * escalaFonte,
      fontFamily: "FredokaLight",
    },

    textoSalvando: {
      color: tema.text,
      fontSize: 14 * escalaFonte,
      fontFamily: "FredokaLight",
      textAlign: "center",
      marginTop: 5,
    },

    desabilitado: {
      opacity: 0.5,
    },

    botaoSobrePaed: {
      backgroundColor: tema.modal,
      borderRadius: 15,
      padding: 20,
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      elevation: 5,
    },

    textoSobrePaed: {
      color: tema.text,
      fontSize: 16 * escalaFonte,
      fontFamily: "FredokaLight",
      flexShrink: 1,
      textAlign: "center",
    },

    // BOTÃO ALTERAR TURMA

    botaoAlterarTurma: {
      backgroundColor: tema.card,
      borderColor: tema.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      marginTop: 10,
      minHeight: 48,
    },

    textoAlterarTurma: {
      color: tema.text,
      fontSize: 15 * escalaFonte,
      fontFamily: "FredokaLight",
      flexShrink: 1,
      textAlign: "center",
    },

    // MODAL ALTERAR TURMA

    modalTurma: {
      width: "92%",
      maxWidth: 520,
      maxHeight: "85%",
      flexGrow: 0,
      borderRadius: 15,
      backgroundColor: tema.modal,
    },

    tituloModalTurma: {
      color: tema.text,
      fontSize: 21 * escalaFonte,
      fontFamily: "FredokaMedium",
      marginBottom: 8,
    },

    textoModalTurma: {
      color: tema.text,
      fontSize: 14 * escalaFonte,
      fontFamily: "FredokaLight",
      marginBottom: 20,
    },

    labelTurma: {
      color: tema.text,
      fontSize: 15 * escalaFonte,
      fontFamily: "FredokaMedium",
      marginBottom: 8,
    },

    valorTurmaAtual: {
      backgroundColor: tema.card,
      borderColor: tema.border,
      color: tema.text,
      fontSize: 16 * escalaFonte,
      fontFamily: "FredokaLight",
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      marginBottom: 18,
    },

    inputTurma: {
      backgroundColor: tema.card,
      borderColor: tema.border,
      color: tema.text,
      fontSize: 16 * escalaFonte,
      fontFamily: "FredokaLight",
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 12,
      marginBottom: 18,
    },

    botaoConfirmarTurma: {
      backgroundColor: "#88C688",
      borderRadius: 10,
      padding: 14,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
    },

    textoConfirmarTurma: {
      color: "#FFFFFF",
      fontSize: 16 * escalaFonte,
      fontFamily: "FredokaMedium",
      textAlign: "center",
    },

    // AVISO DE ALTERAÇÃO DE TURMA

    avisoAlterarTurma: {
      backgroundColor: tema.card,
      borderColor: tema.border,
      borderWidth: 1,
      borderLeftWidth: 4,
      borderLeftColor: "#FFAA56",
      borderRadius: 10,
      padding: 14,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      marginBottom: 20,
    },

    conteudoAvisoTurma: {
      flex: 1,
      minWidth: 0,
      gap: 6,
    },

    tituloAvisoTurma: {
      color: tema.text,
      fontSize: 16 * escalaFonte,
      fontFamily: "FredokaMedium",
      flexShrink: 1,
    },

    textoAvisoTurma: {
      color: tema.text,
      fontSize: 14 * escalaFonte,
      fontFamily: "FredokaLight",
      lineHeight: 21 * escalaFonte,
      flexShrink: 1,
    },
  });
}
