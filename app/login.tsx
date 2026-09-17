import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { styles, colors } from '../style';

// Função utilitária para converter mensagens de erro do Supabase no Login para Português
const traduzirErroSupabase = (mensagem?: string) => {
  if (!mensagem) return 'Usuário ou senha incorretos.';
  
  if (mensagem.includes('Invalid login credentials')) {
    return 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.';
  }
  if (mensagem.includes('Email not confirmed')) {
    return 'E-mail não confirmado. Por favor, verifique sua caixa de entrada.';
  }
  if (mensagem.includes('User not found')) {
    return 'Usuário não encontrado.';
  }
  if (mensagem.includes('Too many requests')) {
    return 'Muitas tentativas sem sucesso. Aguarde um momento e tente novamente.';
  }

  return mensagem; // Retorna a mensagem original caso seja um erro customizado
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Atenção', 'Por favor, preencha e-mail e senha.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error || !data.user) {
      Alert.alert(
        'Erro ao entrar',
        traduzirErroSupabase(error?.message)
      );
      return;
    }

    const role = data.user.user_metadata?.role?.toLowerCase();

    if (role === 'professor') {
      router.replace('/(tabs)/professor');
    } else if (role === 'tutor') {
      router.replace('/(tabs)/tutor');
    } else {
      router.replace('/(tabs)/TelaTarefas');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo_PAED.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bem-vindo de volta!</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </Pressable>

            <View style={styles.cardFooter}>
              <Text style={styles.cardFooterText}>
                Não tem uma conta?
              </Text>

              <Pressable onPress={() => router.push('/welcome')}>
                <Text style={styles.signUpLink}> Criar conta</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}