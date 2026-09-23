import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from '../bd/supabase';

export async function registrarPushChat(usuarioId: string) {
  if (!Device.isDevice) {
    console.log('Push: teste em aparelho físico.');
    return;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('mensagens', {
        name: 'Mensagens',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    const permissaoAtual = await Notifications.getPermissionsAsync();
    let status = permissaoAtual.status;

    if (status !== 'granted') {
      const solicitacao = await Notifications.requestPermissionsAsync();
      status = solicitacao.status;
    }

    if (status !== 'granted') {
      console.log('Permissão de notificações não concedida.');
      return;
    }

    const projectId =
      Constants.easConfig?.projectId ??
      Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      throw new Error('EAS projectId não encontrado no app.json.');
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const { error } = await supabase.from('push_tokens').upsert(
      {
        token,
        usuario_id: usuarioId,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: 'token' }
    );

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao registrar push do chat:', error);
  }
}
export async function removerPushChatDesteAparelho(usuarioId: string) {
  if (!Device.isDevice) return;

  const projectId =
    Constants.easConfig?.projectId ??
    Constants.expoConfig?.extra?.eas?.projectId;

  if (!projectId) {
    throw new Error('EAS projectId não encontrado no app.json.');
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  const { data: removidos, error } = await supabase
  .from('push_tokens')
  .delete()
  .eq('token', token)
  .eq('usuario_id', usuarioId)
  .select('token');

if (error) throw error;

if (!removidos?.length) {
  throw new Error(
    'Nenhum token deste aparelho foi encontrado para a conta atual.'
  );
}
}