
import { StyleSheet } from "react-native";

type TemaSobrePaed = {
  background: string;
  card: string;
  text: string;
  border: string;
  primary: string;
};

export default function criarEstilos(
  tema: TemaSobrePaed,
  escalaFonte: number,
  largura: number
) {
  const larguraDisponivel = Math.max(0, largura - 60);

  // Mantém o logo original e reduz apenas se não couber.
  const larguraLogo = Math.min(300, larguraDisponivel);
  const alturaLogo = larguraLogo * (140 / 300);

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tema.background,
    },

    header: {
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: tema.border,
      backgroundColor: tema.background,
    },

    backButton: {
      width: 42,
      height: 42,
      flexShrink: 0,
      alignItems: "center",
      justifyContent: "center",
    },

    headerTitle: {
      flex: 1,
      minWidth: 0,
      fontSize: 20 * escalaFonte,
      fontFamily: "FredokaMedium",
      color: tema.text,
      textAlign: "center",
    },

    headerSpacer: {
      width: 42,
      flexShrink: 0,
    },

    scroll: {
      flex: 1,
    },

    scrollContent: {
      alignItems: "center",
      paddingHorizontal: 30,
      paddingTop: 10,
      paddingBottom: 20,
      flexGrow: 1,
    },

    logo: {
      width: larguraLogo,
      height: alturaLogo,
      marginTop: 5,
      marginBottom: 5,
    },

    title: {
      width: "100%",
      fontSize: 30 * escalaFonte,
      fontFamily: "FredokaMedium",
      color: tema.text,
      marginBottom: 22,
      textAlign: "left",
    },

    card: {
      width: "100%",
      backgroundColor: tema.card,
      borderRadius: 15,
      padding: 18,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: tema.border,
    },

    cardTitle: {
      fontSize: 19 * escalaFonte,
      fontFamily: "FredokaMedium",
      color: tema.text,
      marginBottom: 12,
    },

    text: {
      fontSize: 16 * escalaFonte,
      lineHeight: 24 * escalaFonte,
      fontFamily: "FredokaLight",
      color: tema.text,
      textAlign: "justify",
      marginBottom: 10,
    },

    sectionTitle: {
      maxWidth: "100%",
      fontSize: 22 * escalaFonte,
      fontFamily: "FredokaMedium",
      color: tema.text,
      marginTop: 5,
      marginBottom: 15,
    },

    subsectionTitle: {
      width: "100%",
      fontSize: 18 * escalaFonte,
      fontFamily: "FredokaMedium",
      color: tema.text,
      textAlign: "center",
      marginBottom: 14,
      marginTop: 35,
    },

    teamRow: {
      width: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "flex-start",
      gap: 18,
      marginBottom: 22,
    },

    member: {
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: 98,
      maxWidth: 110,
      alignItems: "center",
    },

    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: tema.primary,
      marginBottom: 8,
    },

    memberName: {
      maxWidth: "100%",
      color: tema.text,
      fontSize: 15 * escalaFonte,
      fontFamily: "FredokaMedium",
      textAlign: "center",
    },

    memberRole: {
      maxWidth: "100%",
      color: tema.text,
      fontSize: 12 * escalaFonte,
      fontFamily: "FredokaLight",
      textAlign: "center",
      marginTop: 3,
    },

    institutionCard: {
      width: "100%",
      backgroundColor: tema.card,
      borderRadius: 15,
      padding: 18,
      marginTop: 5,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: tema.border,
      alignItems: "center",
    },

    institutionTitle: {
      maxWidth: "100%",
      color: tema.text,
      fontSize: 17 * escalaFonte,
      fontFamily: "FredokaMedium",
      textAlign: "center",
      marginBottom: 6,
    },

    institutionText: {
      maxWidth: "100%",
      color: tema.text,
      fontSize: 15 * escalaFonte,
      fontFamily: "FredokaLight",
      textAlign: "center",
    },

    // INSTAGRAM

    instagramContainer: {
      maxWidth: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 10,
    },

    instagram: {
      flexShrink: 1,
      color: tema.text,
      fontSize: 16 * escalaFonte,
      fontFamily: "FredokaMedium",
      textAlign: "center",
    },

    // E-MAIL PARA CONTATO

    emailContainer: {
      maxWidth: "100%",
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginBottom: 18,
      paddingVertical: 6,
      paddingHorizontal: 8,
      minHeight: 48,
    },

    email: {
      flexShrink: 1,
      color: tema.text,
      fontSize: 16 * escalaFonte,
      fontFamily: "FredokaMedium",
      textAlign: "center",
    },

    // VERSÃO

    version: {
      maxWidth: "100%",
      color: tema.text,
      fontSize: 13 * escalaFonte,
      fontFamily: "FredokaLight",
      marginBottom: 5,
    },
  });
}
