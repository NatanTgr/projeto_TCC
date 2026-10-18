import React, { useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  Pressable,
  View,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { supabase } from "../lib/supabase";
import {
  styles,
  colors,
  esqueciSenhaStyles as recuperacao,
} from "../style";

export default function EsqueciSenha() {
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [campoEmFoco, setCampoEmFoco] = useState(false);

  const { width, height, fontScale } = useWindowDimensions();

  const telaCompacta = width < 360 || height < 700;
  const modoCompacto = telaCompacta || campoEmFoco;
  const mostrarLogo = !campoEmFoco && height >= 500;

  const enviarEmail = async () => {
    if (loading) return;

    if (!email.trim()) {
      Alert.alert("Atenção", "Digite seu e-mail.");
      return;
    }

    Keyboard.dismiss();
    setCampoEmFoco(false);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: "meuapp://reset-password",
        }
      );

      if (error) {
        Alert.alert("Erro", error.message);
        return;
      }

      Alert.alert(
        "E-mail enviado",
        "Se o e-mail estiver cadastrado, você receberá um link para recuperação da senha.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error) {
      console.error("Erro ao solicitar recuperação de senha:", error);

      Alert.alert(
        "Erro",
        "Não foi possível enviar o link. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={recuperacao.keyboard}
      >
        <View
          style={[
            recuperacao.conteudo,
            modoCompacto && recuperacao.conteudoCompacto,
          ]}
        >
          {mostrarLogo && (
            <View style={recuperacao.logoContainer}>
              <Image
                source={require("../assets/images/logo_PAED.png")}
                style={[
                  recuperacao.logo,
                  telaCompacta && recuperacao.logoCompacto,
                ]}
                resizeMode="contain"
                accessible
                accessibilityLabel="PAED"
              />
            </View>
          )}

          <View
            style={[
              styles.card,
              recuperacao.card,
              modoCompacto && recuperacao.cardCompacto,
            ]}
          >
            <Text
              style={[
                styles.cardTitle,
                modoCompacto && recuperacao.tituloCompacto,
              ]}
            >
              Esqueci minha senha
            </Text>

            <Text
              style={[
                styles.cardFooterText,
                recuperacao.descricao,
                modoCompacto && recuperacao.descricaoCompacta,
              ]}
            >
              Digite o e-mail cadastrado para receber o link de
              recuperação da senha.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>

              <TextInput
                style={[
                  styles.input,
                  recuperacao.input,
                  {
                    minHeight: Math.max(
                      48,
                      Math.ceil(24 * fontScale + 20)
                    ),
                  },
                ]}
                accessibilityLabel="Email cadastrado"
                placeholder="seu@email.com"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                returnKeyType="done"
                onFocus={() => setCampoEmFoco(true)}
                onBlur={() => setCampoEmFoco(false)}
                onSubmitEditing={enviarEmail}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Enviar link de recuperação"
              accessibilityState={{
                disabled: loading,
                busy: loading,
              }}
              style={({ pressed }) => [
                styles.button,
                recuperacao.botao,
                loading && recuperacao.desativado,
                pressed && styles.buttonPressed,
              ]}
              onPress={enviarEmail}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    recuperacao.textoCentralizado,
                  ]}
                >
                  Enviar link
                </Text>
              )}
            </Pressable>

            <View style={recuperacao.rodape}>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [
                  recuperacao.botaoVoltar,
                  loading && recuperacao.desativado,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  router.replace("/login");
                }}
                disabled={loading}
              >
                <Text
                  style={[
                    styles.signUpLink,
                    recuperacao.textoCentralizado,
                  ]}
                >
                  Voltar para o login
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}