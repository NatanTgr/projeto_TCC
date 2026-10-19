let conversaAtivaId: string | null = null;

// Registra a pessoa com quem estamos conversando.
export function definirConversaAtiva(usuarioId: string) {
  conversaAtivaId = usuarioId;
}

// Limpa quando saímos da conversa.
export function limparConversaAtiva(usuarioId: string) {
  if (conversaAtivaId === usuarioId) {
    conversaAtivaId = null;
  }
}

// Permite que o sistema de notificações consulte
// qual conversa está aberta.
export function obterConversaAtiva() {
  return conversaAtivaId;
}