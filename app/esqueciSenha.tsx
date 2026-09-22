import React, { useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  Pressable,
  View,
  ActivityIndicator,
  Image,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { supabase } from '../lib/supabase';
import { styles, colors } from '../style';

export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const enviarEmail = async () => {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Digite seu e-mail.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: 'meuapp://reset-password',
      }
    );

    setLoading(false);

    if (error) {
      Alert.alert('Erro', error.message);
      return;
    }

    Alert.alert(
      'E-mail enviado',
      'Se o e-mail estiver cadastrado, você receberá um link para recuperação da senha.',
      [
        {
          text: 'OK',
          onPress: () => router.replace('/login'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo_PAED.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Esqueci minha senha
            </Text>

            <Text
              style={[
                styles.cardFooterText,
                {
                  textAlign: 'center',
                  marginBottom: 20,
                },
              ]}
            >
              Digite o e-mail cadastrado para receber o link
              de recuperação da senha.
            </Text>

            {/* E-mail */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Email
              </Text>

              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Botão */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={enviarEmail}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>
                  Enviar link
                </Text>
              )}
            </Pressable>

            {/* Voltar */}
            <View style={styles.cardFooter}>
              <Pressable
                onPress={() => router.replace('/login')}
              >
                <Text style={styles.signUpLink}>
                  Voltar para o login
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}