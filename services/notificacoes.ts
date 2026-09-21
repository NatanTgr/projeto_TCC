import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { supabase } from "../bd/supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registrarNotificacoes() {
  if (!Device.isDevice) {
    console.log("As notificações devem ser testadas em um dispositivo.");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("tarefas", {
      name: "Tarefas e reuniões",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const permissaoAtual =
    await Notifications.getPermissionsAsync();

  let statusFinal = permissaoAtual.status;

  if (statusFinal !== "granted") {
    const permissaoSolicitada =
      await Notifications.requestPermissionsAsync();

    statusFinal = permissaoSolicitada.status;
  }

  if (statusFinal !== "granted") {
    console.log("Permissão de notificações recusada.");
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error("projectId do EAS não encontrado.");
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Usuário não autenticado.");
  }

  const { error } = await supabase
    .from("dispositivos_push")
    .upsert(
      {
        usuario_id: user.id,
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