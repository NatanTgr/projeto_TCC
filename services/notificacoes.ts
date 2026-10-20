
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
      "[Push] Notificações devem ser testadas em dispositivo físico."
    );
    return null;
  }

  // Verifica se existe uma sessão.
  const {
    data: { session: sessaoInicial },
    error: erroSessao,
  } = await supabase.auth.getSession();

  if (erroSessao) {
    console.error("[Push] Erro ao recuperar sessão:", erroSessao);
    throw erroSessao;
  }

  if (!sessaoInicial?.user) {
    console.log("[Push] Registro ignorado: usuário sem sessão.");
    return null;
  }

  const usuarioInicialId = sessaoInicial.user.id;

  // Configura o canal de notificações do Android.
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("tarefas", {
      name: "Tarefas e reuniões",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
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
    console.log("[Push] Permissão de notificações recusada.");
    return null;
  }

  // Identifica o projeto EAS.
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error("[Push] projectId do EAS não encontrado.");
  }

  // Obtém o token Expo.
  const token = (
    await Notifications.getExpoPushTokenAsync({
      projectId,
    })
  ).data;

  // Verifica se a sessão continua sendo a mesma.
  const {
    data: { session: sessaoAtual },
    error: erroSessaoAtual,
  } = await supabase.auth.getSession();

  if (erroSessaoAtual) {
    throw erroSessaoAtual;
  }

  if (
    !sessaoAtual?.user ||
    sessaoAtual.user.id !== usuarioInicialId
  ) {
    console.log(
      "[Push] Registro cancelado: sessão ausente ou alterada."
    );
    return null;
  }

  // Confirma o usuário diretamente com o servidor Supabase Auth.
  const {
    data: { user },
    error: erroAuth,
  } = await supabase.auth.getUser();

  if (erroAuth || !user) {
    console.error(
      "[Push] Falha ao validar usuário:",
      erroAuth
    );

    throw erroAuth ?? new Error(
      "Não foi possível confirmar o usuário autenticado."
    );
  }

  // Evita registrar um token para outra conta.
  if (user.id !== usuarioInicialId) {
    console.error(
      "[Push] O usuário validado é diferente do usuário inicial."
    );

    return null;
  }

  console.log(
    "[Push] Usuário validado. Registrando dispositivo..."
  );

  // Registra o dispositivo usando o ID confirmado pelo Auth.
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
    console.error("[Push] Erro ao salvar dispositivo:", {
      codigo: error.code,
      mensagem: error.message,
      detalhes: error.details,
      dica: error.hint,
    });

    throw error;
  }

  console.log(
    "[Push] Dispositivo registrado com sucesso."
  );

  return token;
}
