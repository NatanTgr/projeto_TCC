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

import * as Notifications from 'expo-notifications';
import { registrarPushChat } from '../components/notificacoesChat';

import { supabase } from '../lib/supabase';
import { styles as globalStyles, colors } from '../style';

import { ThemeProvider } from '../context/ThemeContext';
import { FontSizeProvider } from '../context/FontSizeContext';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let currentSession: Session | null = null;
    let isPasswordRecovery = false;

    // ---------------------------------------------------------
    // Processa o link de recuperação de senha
    // ---------------------------------------------------------
    const handleRecoveryUrl = async (url: string | null) => {
      if (!url) return;

      // Verifica se é o link da redefinição de senha
      if (!url.startsWith('meuapp://reset-password')) {
        return;
      }

      try {
        // O Supabase envia os tokens depois do "#"
        //
        // Exemplo:
        // meuapp://reset-password#access_token=...&refresh_token=...
        const hashIndex = url.indexOf('#');

        if (hashIndex === -1) {
          return;
        }

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

        // Cria a sessão de recuperação no Supabase
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

        // A sessão de recuperação foi criada.
        // Agora podemos abrir a tela para criar a nova senha.
        setLoading(false);

        router.replace('/reset-password');
      } catch (error) {
        console.error(
          'Erro ao processar link de recuperação:',
          error
        );
      }
    };

    // ---------------------------------------------------------
    // Verifica se o aplicativo foi aberto pelo link
    // ---------------------------------------------------------
    Linking.getInitialURL().then((url) => {
      handleRecoveryUrl(url);
    });

    // ---------------------------------------------------------
    // Detecta link quando o aplicativo já está aberto
    // ---------------------------------------------------------
    const linkingSubscription = Linking.addEventListener(
      'url',
      ({ url }) => {
        handleRecoveryUrl(url);
      }
    );

    // ---------------------------------------------------------
    // Timer original do seu projeto
    // ---------------------------------------------------------
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.log('Erro ao recuperar sessão:', error);
        currentSession = data.session;
        if (!isPasswordRecovery) {
          handleNavigation(currentSession);
          setLoading(false);
        }
      } catch (error) {
        console.log('Erro ao recuperar sessão:', error);
        if (!isPasswordRecovery) {
          handleNavigation(null);
          setLoading(false);
        }
      }
    }, 1100);

    // ---------------------------------------------------------
    // Ouve alterações de autenticação
    // ---------------------------------------------------------
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session: Session | null) => {
        currentSession = session;

        if (session?.user && event === "SIGNED_IN") {
          registrarPushChat(session.user.id);
        }

        // O Supabase também pode informar diretamente
        // que a sessão é de recuperação de senha.
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

    const notificacaoRecebida = Notifications.addNotificationReceivedListener(
      () => {
        // O sistema mostra a notificação; a conversa já usa Realtime.
      },
    );

    const notificacaoTocada =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const dados = response.notification.request.content.data;

        if (
          dados?.tipo !== "mensagem" ||
          typeof dados.remetenteId !== "string"
        ) {
          return;
        }

        router.push({
          pathname: "/TelaConversa" as any,
          params: {
            usuarioId: dados.remetenteId,
            usuarioNome:
              typeof dados.remetenteNome === "string"
                ? dados.remetenteNome
                : "Usuário",
            usuarioTipo:
              typeof dados.remetenteTipo === "string"
                ? dados.remetenteTipo
                : "estudante",
          },
        });
      });

    // ---------------------------------------------------------
    // Limpeza
    // ---------------------------------------------------------
    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
      linkingSubscription.remove();
      notificacaoRecebida.remove();
      notificacaoTocada.remove();
    };
  }, []);

  const handleNavigation = async (session: Session | null) => {
    if (!session) {
      router.replace("/welcome");
      return;
    }

    const resposta = await Notifications.getLastNotificationResponseAsync();
    const dados = resposta?.notification.request.content.data;

    if (dados?.tipo === "mensagem" && typeof dados.remetenteId === "string") {
      await Notifications.clearLastNotificationResponseAsync();

      router.replace({
        pathname: "/TelaConversa" as any,
        params: {
          usuarioId: dados.remetenteId,
          usuarioNome:
            typeof dados.remetenteNome === "string"
              ? dados.remetenteNome
              : "Usuário",
          usuarioTipo:
            typeof dados.remetenteTipo === "string"
              ? dados.remetenteTipo
              : "estudante",
        },
      });
      return;
    }

    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select("tipo")
      .eq("id", session.user.id)
      .single();

    if (error || !usuario) {
      console.log("Erro ao buscar tipo do usuário:", error);
      return;
    }

    if (usuario.tipo === "tutor") {
      router.replace("/(tabs)/TelaTarefasTutor");
    } else if (usuario.tipo === "professor") {
      router.replace("/(tabs)/TelaChat");
    } else {
      router.replace("/(tabs)/TelaTarefas");
    }
  };

  // ---------------------------------------------------------
  // SplashScreen enquanto carrega
  // ---------------------------------------------------------
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