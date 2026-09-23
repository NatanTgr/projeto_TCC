import AsyncStorage from "@react-native-async-storage/async-storage";

export type TipoNotificacao = "chat" | "tarefas";

function chave(usuarioId: string, tipo: TipoNotificacao) {
  return `notificacoes:${usuarioId}:${tipo}`;
}

export async function notificacaoAtiva(
  usuarioId: string,
  tipo: TipoNotificacao,
): Promise<boolean> {
  const valor = await AsyncStorage.getItem(chave(usuarioId, tipo));
  return valor !== "false"; // Ativa por padrão
}

export async function salvarPreferenciaNotificacao(
  usuarioId: string,
  tipo: TipoNotificacao,
  ativa: boolean,
): Promise<void> {
  await AsyncStorage.setItem(chave(usuarioId, tipo), String(ativa));
}