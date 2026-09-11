import { useEffect, useState } from 'react';
import { View, Image, StatusBar, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { styles as globalStyles, colors } from '../style';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let currentSession: Session | null = null;

    // 1. Inicia o timer fixo de 3 segundos
    const timer = setTimeout(() => {
      handleNavigation(currentSession);
      setLoading(false);
    }, 1100);

    // 2. Busca a sessão atual no Supabase
    supabase.auth.getSession().then(({ data }) => {
      currentSession = data.session;
    });

    // 3. Ouve alterações de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session: Session | null) => {
      currentSession = session;
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleNavigation = (session: Session | null) => {
    if (session) {
      router.replace('/(tabs)/estudante');
    } else {
      router.replace('/welcome');
    }
  };

  // Exibe a SplashScreen ocupando 100% da tela enquanto carrega
  if (loading) {
    return (
      <View style={localStyles.splashContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent />
        <Image
          source={require('../assets/images/logo_PAED.png')}
          style={globalStyles.logoImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}

const localStyles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.background, // Fundo #FFFDD0 preenchendo a tela toda
    justifyContent: 'center',            // Centraliza no meio vertical
    alignItems: 'center',                // Centraliza no meio horizontal
  },
});