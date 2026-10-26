import { StyleSheet } from "react-native";

export const colors = {
  background: "#FFFDD0",
  white: "#FFFFFF",
  text: "#836F68",
  textSecondary: "#836F68",
  heading: "#836F68",
  muted: "#836F68",
  border: "#E8E2D5",
  placeholder: "#C4B8A9",
  primary: "#FFAA56",
  student: "#FFAA56",
  professor: "#94C0DF",
  tutor: "#88C688",
  purple: "#9E82C0",
  success: "#88C688",
  danger: "#E53935",
  dangerBackground: "#FFEBEE",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  dashboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: "space-between",
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 28,
  },

  logoImage: {
    width: 400,
    height: 120,
    resizeMode: "contain",
  },

  logoContainerWelcome: {
    alignItems: "center",
    marginBottom: 32,
  },

  logoBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  logoSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.muted,
    letterSpacing: 0.5,
    marginTop: 2,
  },

  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.heading,
    textAlign: "center",
    marginBottom: 24,
  },

  inputGroup: {
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: "500",
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.white,
    justifyContent: "center",
  },

  button: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  buttonPressed: {
    opacity: 0.9,
  },

  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },

  cardFooter: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  cardFooterText: {
    fontSize: 14,
    color: colors.muted,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },

  backButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.muted,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },

  backButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },

  submitButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  submitButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.heading,
    textAlign: "center",
    marginBottom: 28,
  },

  cardsContainer: {
    width: "100%",
    maxWidth: 380,
    gap: 16,
  },

  welcomeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },

  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },

  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  cardTextContainer: {
    flex: 1,
    justifyContent: "center",
  },

  welcomeCardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 2,
  },

  cardSubtitle: {
    fontSize: 13,
    color: "#A39585",
  },

  footer: {
    marginTop: 36,
  },

  loginLink: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.success,
    textDecorationLine: "underline",
  },

  header: {
    alignItems: "center",
    marginTop: 20,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  welcomeText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
  },

  roleBadgeStudent: {
    fontSize: 14,
    color: colors.student,
    fontWeight: "600",
    marginTop: 4,
  },

  roleBadgeProfessor: {
    fontSize: 14,
    color: colors.professor,
    fontWeight: "600",
    marginTop: 4,
  },

  roleBadgeTutor: {
    fontSize: 14,
    color: colors.tutor,
    fontWeight: "600",
    marginTop: 4,
  },

  content: {
    flex: 1,
    marginTop: 40,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.heading,
    marginBottom: 12,
  },

  dashboardCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },

  dashboardCardText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    backgroundColor: colors.dangerBackground,
    borderRadius: 14,
  },

  logoutText: {
    color: colors.danger,
    fontWeight: "600",
    fontSize: 15,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

    chatAbasContainer: {
    width: "100%",
    flexShrink: 0,
    paddingHorizontal: 7,
  },

  chatAbasConteudo: {
    flexDirection: "row",
    alignItems: "stretch",
    paddingVertical: 4,
    gap: 12,
  },

  chatAbaBotao: {
    minWidth: 140,
    minHeight: 48,
    flexShrink: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },

  chatAbaTexto: {
    fontFamily: "FredokaMedium",
    textAlign: "center",
  },

  // --- ESTILOS DE SIGNUP / CADASTRO ---

  signUpContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  signUpScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },

  signUpCardTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.heading,
    textAlign: "center",
    marginBottom: 24,
  },

  signUpSubtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    marginTop: -16,
    marginBottom: 20,
  },

  signUpLink: {
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
    color: colors.success,
  },

  signUpStepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },

  signUpStepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
  },

  signUpStepDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },

  signUpRoleSelector: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  signUpRoleOption: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.white,
  },

  signUpRoleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "15",
  },

  signUpRoleOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  signUpRoleOptionTextSelected: {
    color: colors.primary,
  },

  signUpErrorContainer: {
    backgroundColor: colors.dangerBackground,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },

  signUpErrorText: {
    color: colors.danger,
    fontSize: 13,
    textAlign: "center",
  },

  // --- ESTILOS DOS MODAIS DE SELEÇÃO ---

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.heading,
  },

  modalCloseText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },

  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  modalItemText: {
    fontSize: 15,
    color: colors.text,
  },

  // --- ESTILOS DO CHAT ---

  chatContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },

  chatHeader: {
    width: "100%",
    paddingHorizontal: 15,
    marginTop: 8,
  },

  chatBackButton: {
    width: 42,
    height: 42,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  chatHeaderTitleContainer: {
    flex: 1,
    minWidth: 0,
  },

  chatTopRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
    gap: 8,
  },

  chatHeaderTitle: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 30,
    fontFamily: "FredokaMedium",
    color: colors.heading,
  },

  chatHeaderSubtitle: {
    fontSize: 13,
    fontFamily: "FredokaLight",
    color: colors.muted,
    marginTop: 2,
  },

  chatUsersList: {
    padding: 16,
    paddingBottom: 30,
  },

  chatUserItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  chatUserItemPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  chatUserAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    flexShrink: 0,
  },

  chatUserInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },

  chatUserName: {
    fontSize: 16,
    fontFamily: "FredokaMedium",
    color: colors.heading,
    marginBottom: 3,
  },

  chatUserType: {
    fontSize: 13,
    fontFamily: "FredokaLight",
    color: colors.textSecondary,
    marginBottom: 2,
  },

  chatUserEmail: {
    fontSize: 12,
    fontFamily: "FredokaLight",
    color: colors.placeholder,
  },

  chatLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  chatLoadingText: {
    fontSize: 14,
    fontFamily: "FredokaLight",
    color: colors.muted,
    marginTop: 12,
    textAlign: "center",
  },

  chatEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  chatEmptyTitle: {
    fontSize: 18,
    fontFamily: "FredokaMedium",
    color: colors.heading,
    marginTop: 16,
    textAlign: "center",
  },

  chatEmptyText: {
    fontSize: 14,
    fontFamily: "FredokaLight",
    color: colors.muted,
    textAlign: "center",
    marginTop: 8,
  },

  // --- CONVERSA ---

  conversationContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },

  conversationKeyboard: {
    flex: 1,
  },

  conversationHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexShrink: 0,
    elevation: 2,
  },

  conversationBackButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  conversationAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    overflow: "hidden",
    flexShrink: 0,
  },

  conversationHeaderInfo: {
    flex: 1,
    minWidth: 0,
    justifyContent: "center",
  },

  conversationHeaderName: {
    fontSize: 17,
    fontFamily: "FredokaMedium",
    color: colors.heading,
  },

  conversationHeaderStatus: {
    fontSize: 12,
    fontFamily: "FredokaLight",
    color: colors.muted,
    marginTop: 2,
  },

  conversationMessagesList: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    flexGrow: 1,
  },

  conversationEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  conversationEmptyTitle: {
    fontSize: 18,
    fontFamily: "FredokaMedium",
    color: colors.heading,
    marginTop: 14,
    textAlign: "center",
  },

  conversationEmptyText: {
    fontSize: 14,
    fontFamily: "FredokaLight",
    color: colors.muted,
    textAlign: "center",
    marginTop: 6,
  },

  chatMessageContainer: {
    width: "100%",
    marginBottom: 8,
    flexDirection: "row",
  },

  chatMessageContainerMine: {
    justifyContent: "flex-end",
  },

  chatMessageContainerOther: {
    justifyContent: "flex-start",
  },

  chatBubble: {
    maxWidth: "85%",
    minWidth: 0,
    paddingHorizontal: 13,
    paddingTop: 9,
    paddingBottom: 6,
    borderRadius: 16,
  },

  chatBubbleMine: {
    backgroundColor: "#DCF8C6",
    borderBottomRightRadius: 4,
  },

  chatBubbleOther: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },

  chatMessageText: {
    fontSize: 15,
    fontFamily: "FredokaLight",
  },

  chatMessageTextMine: {
    color: "#36502B",
  },

  chatMessageTextOther: {
    color: colors.text,
  },

  chatMessageTime: {
    fontSize: 10,
    fontFamily: "FredokaLight",
    alignSelf: "flex-end",
    marginTop: 3,
  },

  chatMessageTimeMine: {
    color: "#78936B",
  },

  chatMessageTimeOther: {
    color: colors.placeholder,
  },

  messageInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexShrink: 0,
  },

  messageInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    maxHeight: 110,
    backgroundColor: "#F5F5F5",
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 10,
    fontSize: 15,
    fontFamily: "FredokaLight",
    color: colors.text,
    marginRight: 8,
    textAlignVertical: "top",
  },

  sendMessageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.success,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  sendMessageButtonDisabled: {
    backgroundColor: colors.border,
  },

  sendMessageButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },

  chatDashboardButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    marginTop: 16,
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },

  chatDashboardButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  chatDashboardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  chatDashboardInfo: {
    flex: 1,
  },

  chatDashboardTitle: {
    fontSize: 16,
    fontFamily: "FredokaMedium",
    color: colors.heading,
    marginBottom: 3,
  },

  chatDashboardSubtitle: {
    fontSize: 13,
    fontFamily: "FredokaLight",
    color: colors.muted,
  },
  
    // --- RESPONSIVIDADE DA WELCOME ---

  welcomeLayout: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },

  welcomeHeader: {
    flexShrink: 0,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },

  welcomeHeaderCompact: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },

  welcomeLogoResponsive: {
    width: "100%",
    maxWidth: 400,
    height: 120,
    marginBottom: 20,
  },

  welcomeLogoCompact: {
    height: 80,
    marginBottom: 12,
  },

  welcomeLogoLandscape: {
    height: 48,
    marginBottom: 6,
  },

  welcomeTitleResponsive: {
    width: "100%",
    marginBottom: 0,
  },

  welcomeCardsScroll: {
    flex: 1,
    minHeight: 0,
    width: "100%",
  },

  welcomeCardsContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  welcomeCardsContentCompact: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  welcomeCardResponsive: {
    width: "100%",
  },

  welcomeCardCompact: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  welcomeCardColumn: {
    flexDirection: "column",
    gap: 10,
  },

  welcomeIconResponsive: {
    flexShrink: 0,
  },

  welcomeIconColumn: {
    marginRight: 0,
  },

  welcomeTextResponsive: {
    minWidth: 0,
  },

  welcomeTextColumn: {
    flex: 0,
    width: "100%",
  },

  welcomeTextCentered: {
    textAlign: "center",
  },

  welcomeFooterFixed: {
    flexShrink: 0,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },

  welcomeFooterCompact: {
    paddingTop: 4,
    paddingBottom: 4,
  },

  welcomeLoginButton: {
    minHeight: 48,
    maxWidth: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
});

export const signUpStyles = StyleSheet.create({
  keyboard: {
    flex: 1,
    minHeight: 0,
  },

  logoContainer: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    alignItems: "center",
    flexShrink: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },

  logoContainerCompacto: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },

  logo: {
    width: "100%",
    maxWidth: 400,
    height: 100,
  },

  logoCompacto: {
    height: 70,
  },

  logoPequeno: {
    height: 40,
  },

  scroll: {
    flex: 1,
    minHeight: 0,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },

  scrollContentCompacto: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },

  card: {
    width: "100%",
    maxWidth: 480,
    minWidth: 0,
  },

  cardCompacto: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  input: {
    height: "auto",
    paddingVertical: 12,
  },

  seletorTexto: {
    fontSize: 15,
    color: colors.text,
    flexShrink: 1,
  },

  placeholder: {
    color: colors.placeholder,
  },

  dicaEmail: {
    color: colors.text,
    fontSize: 12,
    marginTop: 5,
  },

  botoesEmColuna: {
    flexDirection: "column",
  },

  botao: {
    height: "auto",
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  botaoEmColuna: {
    flex: 0,
    width: "100%",
  },

  botaoTexto: {
    flexShrink: 1,
    textAlign: "center",
  },

  desativado: {
    opacity: 0.5,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "100%",
    maxWidth: 480,
    maxHeight: "100%",
    flexShrink: 1,
  },

  modalCompacto: {
    padding: 16,
  },

  modalHeader: {
    gap: 8,
    flexShrink: 0,
  },

  modalHeaderEmColuna: {
    flexDirection: "column",
    alignItems: "stretch",
  },

  modalTitulo: {
    flexShrink: 1,
    minWidth: 0,
  },

  modalFechar: {
    minHeight: 44,
    justifyContent: "center",
    alignSelf: "flex-end",
    paddingHorizontal: 8,
  },

  listaModal: {
    flexGrow: 0,
    flexShrink: 1,
    minHeight: 0,
  },

  modalItem: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 8,
  },

  modalItemSelecionado: {
    backgroundColor: "#F3EDF8",
  },

  campoSenhaContainer: {
    width: "100%",
    position: "relative",
  },

  inputSenhaComIcone: {
    paddingRight: 52,
  },

  botaoMostrarSenha: {
    position: "absolute",
    right: 6,
    top: 0,
    bottom: 0,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
export const esqueciSenhaStyles = StyleSheet.create({
  keyboard: {
    flex: 1,
    minHeight: 0,
  },

  conteudo: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  conteudoCompacto: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  logoContainer: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
    marginBottom: 20,
    flexShrink: 1,
    minHeight: 0,
  },

  logo: {
    width: "100%",
    maxWidth: 400,
    height: 100,
    flexShrink: 1,
  },

  logoCompacto: {
    height: 65,
  },

  card: {
    width: "100%",
    maxWidth: 480,
    minWidth: 0,
    flexShrink: 0,
  },

  cardCompacto: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  tituloCompacto: {
    marginBottom: 12,
  },

  descricao: {
    textAlign: "center",
    marginBottom: 20,
  },

  descricaoCompacta: {
    marginBottom: 12,
  },

  input: {
    height: "auto",
    paddingVertical: 10,
  },

  botao: {
    height: "auto",
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  rodape: {
    alignItems: "center",
    marginTop: 8,
  },

  botaoVoltar: {
    minHeight: 48,
    maxWidth: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },

  textoCentralizado: {
    textAlign: "center",
    flexShrink: 1,
  },

  desativado: {
    opacity: 0.5,
  },
});
export const resetPasswordStyles = StyleSheet.create({
  keyboard: {
    flex: 1,
    minHeight: 0,
  },

  conteudo: {
    flex: 1,
    minHeight: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  conteudoCompacto: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  logoContainer: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
    flexShrink: 0,
    marginBottom: 20,
  },

  logoContainerCompacto: {
    marginBottom: 10,
  },

  logo: {
    width: "100%",
    maxWidth: 400,
    height: 100,
  },

  logoCompacto: {
    height: 65,
  },

  logoPequeno: {
    height: 36,
  },

  card: {
    width: "100%",
    maxWidth: 480,
    minWidth: 0,
    minHeight: 0,
    flexShrink: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: "hidden",
  },

  scrollFormulario: {
    flexGrow: 0,
    flexShrink: 1,
    minHeight: 0,
  },

  formulario: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },

  formularioCompacto: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  tituloCompacto: {
    marginBottom: 12,
  },

  descricao: {
    textAlign: "center",
    marginBottom: 20,
  },

  input: {
    height: "auto",
    paddingVertical: 10,
  },

  botao: {
    height: "auto",
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  rodape: {
    alignItems: "center",
    marginTop: 8,
  },

  botaoVoltar: {
    minHeight: 48,
    maxWidth: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
  },

  textoCentralizado: {
    textAlign: "center",
    flexShrink: 1,
  },

  desativado: {
    opacity: 0.5,
  },
});
export const loginStyles = StyleSheet.create({
  keyboard: {
    flex: 1,
    minHeight: 0,
  },

  conteudo: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  conteudoCompacto: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  logoContainer: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
    flexShrink: 0,
    marginBottom: 20,
  },

  logoContainerCompacto: {
    marginBottom: 10,
  },

  logo: {
    width: "100%",
    maxWidth: 400,
    height: 100,
  },

  logoCompacto: {
    height: 65,
  },

  logoPequeno: {
    height: 36,
  },

  card: {
    width: "100%",
    maxWidth: 480,
    minWidth: 0,
    minHeight: 0,
    flexShrink: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
    overflow: "hidden",
  },

  scrollFormulario: {
    flexGrow: 0,
    flexShrink: 1,
    minHeight: 0,
  },

  formulario: {
    paddingHorizontal: 24,
    paddingVertical: 28,
  },

  formularioCompacto: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  tituloCompacto: {
    marginBottom: 16,
  },

  input: {
    height: "auto",
    paddingVertical: 10,
  },

  botao: {
    height: "auto",
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  rodape: {
    width: "100%",
    alignItems: "center",
    marginTop: 16,
    gap: 4,
  },

  linhaLinks: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 6,
  },

  linkBotao: {
    minHeight: 44,
    maxWidth: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 8,
  },

  textoCentralizado: {
    textAlign: "center",
    flexShrink: 1,
  },

  desativado: {
    opacity: 0.5,
  },

  campoSenhaContainer: {
    width: "100%",
    position: "relative",
  },

  inputSenhaComIcone: {
    paddingRight: 52,
  },

  botaoMostrarSenha: {
    position: "absolute",
    right: 6,
    top: 0,
    bottom: 0,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});