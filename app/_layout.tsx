import { useEffect, useState } from 'react';
import {
  View,
  Image,
  StatusBar,
  StyleSheet,
  Linking,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Notifications from 'expo-notifications';
import { registrarPushChat } from '../components/notificacoesChat';

import { supabase } from '../lib/supabase';
import { styles as globalStyles, colors } from '../style';

import { ThemeProvider } from '../context/ThemeContext';
import { FontSizeProvider } from '../context/FontSizeContext';

const VERSAO_TERMO = '1.0';
const TERMO_STORAGE_KEY = '@paed:termo_autorizacao';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  const [fontesCarregadas, erroFontes] = useFonts({
    FredokaLight: require("../assets/fonts/Fredoka-Light.ttf"),
    FredokaMedium: require("../assets/fonts/Fredoka-Medium.ttf"),
  });

  console.log("Fontes carregadas:", fontesCarregadas);
  console.log("Erro nas fontes:", erroFontes);

  useEffect(() => {
    let currentSession: Session | null = null;
    let isPasswordRecovery = false;

    const handleRecoveryUrl = async (url: string | null) => {
      if (!url) return;

      if (!url.startsWith('meuapp://reset-password')) return;

      try {
        const hashIndex = url.indexOf('#');

        if (hashIndex === -1) return;

        const hash = url.substring(hashIndex + 1);
        const params: Record<string, string> = {};

        hash.split('&').forEach((item) => {
          const [key, ...valueParts] = item.split('=');

          if (!key) return;

          const value = valueParts.join('=');
          params[key] = decodeURIComponent(value);
        });

        const accessToken = params.access_token;
        const refreshToken = params.refresh_token;

        if (!accessToken || !refreshToken) {
          console.log(
            'Link de recuperação não possui os tokens necessários.'
          );
          return;
        }

        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error(
            'Erro ao criar sessão de recuperação:',
            error.message
          );
          return;
        }

        isPasswordRecovery = true;
        setLoading(false);

        router.replace('/reset-password');
      } catch (error) {
        console.error(
          'Erro ao processar link de recuperação:',
          error
        );
      }
    };

    Linking.getInitialURL().then((url) => {
      handleRecoveryUrl(url);
    });

    const linkingSubscription = Linking.addEventListener(
      'url',
      ({ url }) => {
        handleRecoveryUrl(url);
      }
    );

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.log(
            'Erro ao recuperar sessão:',
            error
          );
        }

        currentSession = data.session;

        if (!isPasswordRecovery) {
          handleNavigation(currentSession);
          setLoading(false);
        }
      } catch (error) {
        console.log(
          'Erro ao recuperar sessão:',
          error
        );

        if (!isPasswordRecovery) {
          handleNavigation(null);
          setLoading(false);
        }
      }
    }, 1100);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session: Session | null) => {
        currentSession = session;

        if (session?.user && event === 'SIGNED_IN') {
          registrarPushChat(session.user.id);
        }

        if (event === 'PASSWORD_RECOVERY') {
          isPasswordRecovery = true;
          setLoading(false);

          router.replace('/reset-password');
        }
      }
    );

    const registrarUsuarioAtual = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await registrarPushChat(user.id);
      }
    };

    registrarUsuarioAtual();

    const notificacaoRecebida =
      Notifications.addNotificationReceivedListener(() => {});

    const notificacaoTocada =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const dados =
            response.notification.request.content.data;

          if (
            dados?.tipo !== 'mensagem' ||
            typeof dados.remetenteId !== 'string'
          ) {
            return;
          }

          router.push({
            pathname: '/TelaConversa' as any,
            params: {
              usuarioId: dados.remetenteId,

              usuarioNome:
                typeof dados.remetenteNome === 'string'
                  ? dados.remetenteNome
                  : 'Usuário',

              usuarioTipo:
                typeof dados.remetenteTipo === 'string'
                  ? dados.remetenteTipo
                  : 'estudante',
            },
          });
        }
      );

    return () => {
      clearTimeout(timer);

      subscription.unsubscribe();

      linkingSubscription.remove();

      notificacaoRecebida.remove();

      notificacaoTocada.remove();
    };
  }, []);

  const verificarTermoLocal = async (): Promise<boolean> => {
    try {
      const termoSalvo =
        await AsyncStorage.getItem(TERMO_STORAGE_KEY);

      if (!termoSalvo) {
        return false;
      }

      const termo = JSON.parse(termoSalvo);

      return (
        termo?.aceito === true &&
        termo?.versao === VERSAO_TERMO
      );
    } catch (error) {
      console.error(
        'Erro ao verificar aceite do termo:',
        error
      );

      return false;
    }
  };

  const registrarAceiteNoSupabase = async (
    session: Session
  ) => {
    try {
      const { data: aceiteExistente, error: erroConsulta } =
        await supabase
          .from('aceites_termos')
          .select('id')
          .eq('usuario_id', session.user.id)
          .eq('versao_termo', VERSAO_TERMO)
          .maybeSingle();

      if (erroConsulta) {
        console.log(
          'Erro ao verificar aceite do termo:',
          erroConsulta
        );

        return;
      }

      if (!aceiteExistente) {
        const { error } = await supabase
          .from('aceites_termos')
          .insert({
            usuario_id: session.user.id,
            versao_termo: VERSAO_TERMO,
          });

        if (error) {
          console.log(
            'Erro ao registrar aceite do termo:',
            error
          );
        }
      }
    } catch (error) {
      console.error(
        'Erro ao registrar aceite no Supabase:',
        error
      );
    }
  };

  const handleNavigation = async (
    session: Session | null
  ) => {
    /*
     * Primeiro verificamos se o usuário já aceitou
     * a versão atual do termo.
     *
     * Não existe mais nenhuma referência à tela
     * "quem-somos".
     */
    const termoAceito = await verificarTermoLocal();

    if (!termoAceito) {
      router.replace('/TelaTermo');
      return;
    }

    /*
     * Se o termo já foi aceito, mas não existe
     * sessão, o usuário vai para a tela inicial.
     */
    if (!session) {
      router.replace('/welcome');
      return;
    }

    /*
     * Usuário autenticado:
     * registramos o aceite no Supabase.
     */
    await registrarAceiteNoSupabase(session);

    /*
     * Buscamos o tipo do usuário para definir
     * qual tela deve abrir.
     */
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('tipo')
      .eq('id', session.user.id)
      .single();

    if (error || !usuario) {
      console.log(
        'Erro ao buscar tipo do usuário:',
        error
      );

      return;
    }

    /*
     * Tutor
     */
    if (usuario.tipo === 'tutor') {
      router.replace('/(tabs)/TelaTarefasTutor');
    }

    /*
     * Professor
     */
    else if (usuario.tipo === 'professor') {
      router.replace('/(tabs)/TelaChat');
    }

    /*
     * Estudante
     */
    else {
      router.replace('/(tabs)/TelaTarefas');
    }
  };

  if (loading) {
    return (
      <View style={localStyles.splashContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.background}
          translucent
        />

        <Image
          source={require('../assets/images/logo_PAED.png')}
          style={globalStyles.logoImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  if (!fontesCarregadas && !erroFontes) {
    return null;
  }

  return (
    <ThemeProvider>
      <FontSizeProvider>
        <Stack
          screenOptions={{
            headerShown: false,

            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          <Stack.Screen name="(tabs)" />
        </Stack>
      </FontSizeProvider>
    </ThemeProvider>
  );
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const localStyles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});