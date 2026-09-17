import { useEffect, useState } from 'react';
import { View, Image, StatusBar, StyleSheet } from 'react-native';
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

    // Inicia o timer
    const timer = setTimeout(() => {
      handleNavigation(currentSession);
      setLoading(false);
    }, 1100);

    // Busca a sessão atual no Supabase
    supabase.auth.getSession().then(({ data }) => {
      currentSession = data.session;
    });

    // Ouve alterações de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_, session: Session | null) => {
        currentSession = session;
      }
    );

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleNavigation = (session: Session | null) => {
    if (session) {
      router.replace('/(tabs)/TelaTarefas');
    } else {
      router.replace('/welcome');
    }
  };

  // Exibe a SplashScreen enquanto carrega
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