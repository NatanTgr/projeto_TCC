import { StyleSheet } from 'react-native';

export const colors = {
  background: '#FFFDD0',
  white: '#FFFFFF',
  text: '#836F68',
  textSecondary: '#836F68',
  heading: '#836F68',
  muted: '#836F68',
  border: '#E8E2D5',
  placeholder: '#C4B8A9',
  primary: '#FFAA56',
  student: '#FFAA56',
  professor: '#88C688',
  tutor: '#94C0DF',
  purple: '#9E82C0',
  success: '#88C688',
  danger: '#E53935',
  dangerBackground: '#FFEBEE',
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
    justifyContent: 'space-between',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  // NOVO ESTILO ADICIONADO AQUI PARA A IMAGEM
  logoImage: {
    width: 400,
    height: 120,
    resizeMode: 'contain',
  },
  logoContainerWelcome: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  logoSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.heading,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: { marginBottom: 16 },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
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
    justifyContent: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPressed: { opacity: 0.9 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  cardFooter: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  cardFooterText: { fontSize: 14, color: colors.muted },

  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  backButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.muted,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  backButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: { color: colors.white, fontSize: 15, fontWeight: '600' },

  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.heading,
    textAlign: 'center',
    marginBottom: 28,
  },
  cardsContainer: { width: '100%', maxWidth: 380, gap: 16 },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: { flex: 1, justifyContent: 'center' },
  welcomeCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  cardSubtitle: { fontSize: 13, color: '#A39585' },
  footer: { marginTop: 36 },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
    textDecorationLine: 'underline',
  },

  header: { alignItems: 'center', marginTop: 20 },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  roleBadgeStudent: {
    fontSize: 14,
    color: colors.student,
    fontWeight: '600',
    marginTop: 4,
  },
  roleBadgeProfessor: {
    fontSize: 14,
    color: colors.professor,
    fontWeight: '600',
    marginTop: 4,
  },
  roleBadgeTutor: {
    fontSize: 14,
    color: colors.tutor,
    fontWeight: '600',
    marginTop: 4,
  },
  content: { flex: 1, marginTop: 40 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.heading,
    marginBottom: 12,
  },
  dashboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },
  dashboardCardText: { fontSize: 14, color: colors.textSecondary },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: colors.dangerBackground,
    borderRadius: 14,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 15,
  },

  registerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  registerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.text,
  },
  registerSpacer: { height: 15 },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- ESTILOS DE SIGNUP / CADASTRO ---
  signUpContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  signUpScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  signUpCardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.heading,
    textAlign: 'center',
    marginBottom: 24,
  },
  signUpSubtitle: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: -16,
    marginBottom: 20,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
    color: colors.success,
  },
  signUpStepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  signUpRoleOption: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  signUpRoleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15', // Transparência leve no fundo
  },
  signUpRoleOptionText: {
    fontSize: 13,
    fontWeight: '600',
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
    textAlign: 'center',
  },

  // --- ESTILOS DOS MODAIS DE SELEÇÃO ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.heading,
  },
  modalCloseText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },

  chatBackButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  chatHeaderTitleContainer: {
    flex: 1,
  },

  chatHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.heading,
  },

  chatHeaderSubtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },

  chatUsersList: {
    padding: 16,
    paddingBottom: 30,
  },

  chatUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000000',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  chatUserInfo: {
    flex: 1,
    marginRight: 8,
  },

  chatUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.heading,
    marginBottom: 3,
  },

  chatUserType: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },

  chatUserEmail: {
    fontSize: 12,
    color: colors.placeholder,
  },

  chatLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  chatLoadingText: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 12,
  },

  chatEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  chatEmptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.heading,
    marginTop: 16,
    textAlign: 'center',
  },

  chatEmptyText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },

  // --- CONVERSA ---

  conversationContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  conversationKeyboard: {
    flex: 1,
  },

  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
  },

  conversationBackButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },

  conversationAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },

  conversationHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  conversationHeaderName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.heading,
  },

  conversationHeaderStatus: {
    fontSize: 12,
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  conversationEmptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.heading,
    marginTop: 14,
  },

  conversationEmptyText: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },

  chatMessageContainer: {
    width: '100%',
    marginBottom: 8,
    flexDirection: 'row',
  },

  chatMessageContainerMine: {
    justifyContent: 'flex-end',
  },

  chatMessageContainerOther: {
    justifyContent: 'flex-start',
  },

  chatBubble: {
    maxWidth: '78%',
    paddingHorizontal: 13,
    paddingTop: 9,
    paddingBottom: 6,
    borderRadius: 16,
  },

  chatBubbleMine: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 4,
  },

  chatBubbleOther: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },

  chatMessageText: {
    fontSize: 15,
    lineHeight: 20,
  },

  chatMessageTextMine: {
    color: '#36502B',
  },

  chatMessageTextOther: {
    color: colors.text,
  },

  chatMessageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 3,
  },

  chatMessageTimeMine: {
    color: '#78936B',
  },

  chatMessageTimeOther: {
    color: colors.placeholder,
  },

  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  messageInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    backgroundColor: '#F5F5F5',
    borderRadius: 22,
    paddingHorizontal: 17,
    paddingTop: 11,
    paddingBottom: 10,
    fontSize: 15,
    color: colors.text,
    marginRight: 8,
  },

  sendMessageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendMessageButtonDisabled: {
    backgroundColor: colors.border,
  },

  sendMessageButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  chatDashboardButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.white,
  borderRadius: 18,
  padding: 14,
  marginTop: 16,
  elevation: 2,
  shadowColor: '#000000',
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
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 14,
},

chatDashboardInfo: {
  flex: 1,
},

chatDashboardTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: colors.heading,
  marginBottom: 3,
},

chatDashboardSubtitle: {
  fontSize: 13,
  color: colors.muted,
},


});