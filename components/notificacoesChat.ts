import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { supabase } from '../bd/supabase';


function chaveTokensChat(usuarioId: string) {
  return `@paed:push-chat:${usuarioId}`;
}

async function lerTokensChat(usuarioId: string): Promise<string[]> {
  const valor = await AsyncStorage.getItem(chaveTokensChat(usuarioId));

  if (!valor) return [];

  const tokens: unknown = JSON.parse(valor);

  if (
    !Array.isArray(tokens) ||
    !tokens.every((token) => typeof token === 'string')
  ) {
    throw new Error('O registro local das notificações está inválido.');
  }

  return tokens;
}

async function guardarTokenChat(usuarioId: string, token: string) {
  const tokens = await lerTokensChat(usuarioId);
  const tokensAtualizados = [...new Set([...tokens, token])];

  await AsyncStorage.setItem(
    chaveTokensChat(usuarioId),
    JSON.stringify(tokensAtualizados)
  );
}

export async function registrarPushChat(usuarioId: string) {
  if (!Device.isDevice) {
    console.log('Push: teste em aparelho físico.');
    return;
  }

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("mensagens", {
        name: "Mensagens",
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    const permissaoAtual = await Notifications.getPermissionsAsync();
    let status = permissaoAtual.status;

    if (status !== "granted") {
      const solicitacao = await Notifications.requestPermissionsAsync();
      status = solicitacao.status;
    }

    if (status !== "granted") {
      console.log("Permissão de notificações não concedida.");
      return;
    }

    const projectId =
      Constants.easConfig?.projectId ??
      Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      throw new Error("EAS projectId não encontrado no app.json.");
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    // Guarda antes de enviar ao banco.
    // Se o envio falhar, ainda sabemos qual token tentar remover.
    await guardarTokenChat(usuarioId, token);

    const { error } = await supabase.from("push_tokens").upsert(
      {
        token,
        usuario_id: usuarioId,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "token" },
    );

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao registrar push do chat:', error);
  }
}
export async function removerPushChatDesteAparelho(usuarioId: string) {
  if (!Device.isDevice || Platform.OS === 'web') return;

  const tokens = await lerTokensChat(usuarioId);

  // Nenhum token foi guardado para esta conta neste aparelho.
  if (tokens.length === 0) return;

  const { error: erroRemocao } = await supabase
    .from('push_tokens')
    .delete()
    .eq('usuario_id', usuarioId)
    .in('token', tokens);

  if (erroRemocao) throw erroRemocao;

  // Confirma que os vínculos conhecidos não continuam no banco.
  const { data: restantes, error: erroConsulta } = await supabase
    .from('push_tokens')
    .select('token')
    .eq('usuario_id', usuarioId)
    .in('token', tokens);

  if (erroConsulta) throw erroConsulta;

  if (restantes?.length) {
    throw new Error(
      'Não foi possível remover o vínculo das notificações no banco.'
    );
  }

  // Mantém o histórico local para permitir novas tentativas,
  // inclusive se o encerramento da sessão falhar depois.
}