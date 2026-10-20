
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import { supabase } from "../bd/supabase";

export async function registrarNotificacoes(): Promise<string | null> {
  // Não registra push Expo na versão web.
  if (Platform.OS === "web") {
    return null;
  }

  // Push deve ser testado em dispositivo físico.
  if (!Device.isDevice) {
    console.log(
      "As notificações devem ser testadas em um dispositivo."
    );
    return null;
  }

  // Verifica se existe uma sessão autenticada.
  const {
    data: { session: sessaoInicial },
    error: erroSessao,
  } = await supabase.auth.getSession();

  if (erroSessao) {
    throw erroSessao;
  }

  if (!sessaoInicial?.user) {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(
      "tarefas",
      {
        name: "Tarefas e reuniões",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      }
    );
  }

  // Verifica a permissão das notificações.
  const permissaoAtual =
    await Notifications.getPermissionsAsync();

  let statusFinal = permissaoAtual.status;

  if (statusFinal !== "granted") {
    const permissaoSolicitada =
      await Notifications.requestPermissionsAsync();

    statusFinal = permissaoSolicitada.status;
  }

  if (statusFinal !== "granted") {
    console.log(
      "Permissão de notificações recusada."
    );
    return null;
  }

  // Identifica o projeto EAS.
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error(
      "projectId do EAS não encontrado."
    );
  }

  // Obtém o Expo Push Token.
  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;

  // Confere a sessão novamente, pois o usuário
  // pode ter saído da conta durante a operação.
  const {
    data: { session: sessaoAtual },
    error: erroSessaoAtual,
  } = await supabase.auth.getSession();

  if (erroSessaoAtual) {
    throw erroSessaoAtual;
  }

  if (
    !sessaoAtual?.user ||
    sessaoAtual.user.id !== sessaoInicial.user.id
  ) {
    console.log(
      "Registro de notificações cancelado: sessão alterada."
    );
    return null;
  }

  // Registra o token no Supabase.
  // A política RLS deve restringir o registro
  // ao usuário autenticado.
  const { error } = await supabase
    .from("dispositivos_push")
    .upsert(
      {
        usuario_id: sessaoAtual.user.id,
        expo_push_token: token,
        plataforma: Platform.OS,
        atualizado_em: new Date().toISOString(),
      },
      {
        onConflict: "usuario_id,expo_push_token",
      }
    );

  if (error) {
    throw error;
  }

  return token;
}
