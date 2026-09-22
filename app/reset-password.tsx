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

export default function ResetPassword() {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const alterarSenha = async () => {
    if (!senha || !confirmarSenha) {
      Alert.alert(
        'Atenção',
        'Preencha os dois campos de senha.'
      );
      return;
    }

    if (senha.length < 6) {
      Alert.alert(
        'Senha inválida',
        'A senha deve possuir pelo menos 6 caracteres.'
      );
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert(
        'Senhas diferentes',
        'A confirmação da senha não é igual à nova senha.'
      );
      return;
    }

    try {
      setCarregando(true);

      const { error } = await supabase.auth.updateUser({
        password: senha,
      });

      if (error) {
        Alert.alert(
          'Erro',
          'Não foi possível alterar a senha.\n\n' + error.message
        );
        return;
      }

      Alert.alert(
        'Senha alterada',
        'Sua senha foi alterada com sucesso.',
        [
          {
            text: 'OK',
            onPress: async () => {
              await supabase.auth.signOut();
              router.replace('/login');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao alterar senha:', error);

      Alert.alert(
        'Erro',
        'Ocorreu um erro ao tentar alterar sua senha.'
      );
    } finally {
      setCarregando(false);
    }
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
              Redefinir senha
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
              Digite sua nova senha abaixo.
            </Text>

            {/* Nova senha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nova senha
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Digite sua nova senha"
                placeholderTextColor={colors.placeholder}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!carregando}
              />
            </View>

            {/* Confirmar senha */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Confirmar senha
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Digite a senha novamente"
                placeholderTextColor={colors.placeholder}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!carregando}
              />
            </View>

            {/* Botão */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={alterarSenha}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>
                  Alterar senha
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