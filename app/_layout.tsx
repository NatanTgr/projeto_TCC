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

        // O Supabase também pode informar diretamente
        // que a sessão é de recuperação de senha.
        if (event === 'PASSWORD_RECOVERY') {
          isPasswordRecovery = true;

          setLoading(false);

          router.replace('/reset-password');
        }
      }
    );

    // ---------------------------------------------------------
    // Limpeza
    // ---------------------------------------------------------
    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, []);

  const handleNavigation = (session: Session | null) => {
    if (session) {
      router.replace('/(tabs)/TelaTarefas');
    } else {
      router.replace('/welcome');
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

const localStyles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});