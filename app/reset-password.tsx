import React, { useRef, useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  Pressable,
  View,
  ActivityIndicator,
  Image,
  ScrollView,
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
  resetPasswordStyles as redefinicao,
} from "../style";

export default function ResetPassword() {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  const confirmarSenhaRef = useRef<TextInput>(null);

  const { width, height, fontScale } = useWindowDimensions();

  const telaCompacta = width < 360 || height < 700;
  const telaBaixa = height < 500;

  const estiloInput = [
    styles.input,
    redefinicao.input,
    {
      minHeight: Math.max(48, Math.ceil(24 * fontScale + 20)),
    },
  ];

  const alterarSenha = async () => {
    if (carregando) return;

    if (!senha || !confirmarSenha) {
      Alert.alert("Atenção", "Preencha os dois campos de senha.");
      return;
    }

    if (senha.length < 6) {
      Alert.alert(
        "Senha inválida",
        "A senha deve possuir pelo menos 6 caracteres."
      );
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert(
        "Senhas diferentes",
        "A confirmação da senha não é igual à nova senha."
      );
      return;
    }

    Keyboard.dismiss();

    try {
      setCarregando(true);

      const { error } = await supabase.auth.updateUser({
        password: senha,
      });

      if (error) {
        Alert.alert(
          "Erro",
          "Não foi possível alterar a senha.\n\n" + error.message
        );
        return;
      }

      Alert.alert(
        "Senha alterada",
        "Sua senha foi alterada com sucesso.",
        [
          {
            text: "OK",
            onPress: async () => {
              await supabase.auth.signOut();
              router.replace("/login");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erro ao alterar senha:", error);

      Alert.alert(
        "Erro",
        "Ocorreu um erro ao tentar alterar sua senha."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={redefinicao.keyboard}
      >
        <View
          style={[
            redefinicao.conteudo,
            telaCompacta && redefinicao.conteudoCompacto,
          ]}
        >
          <View
            style={[
              redefinicao.logoContainer,
              telaCompacta && redefinicao.logoContainerCompacto,
            ]}
          >
            <Image
              source={require("../assets/images/logo_PAED.png")}
              style={[
                redefinicao.logo,
                telaCompacta && redefinicao.logoCompacto,
                telaBaixa && redefinicao.logoPequeno,
              ]}
              resizeMode="contain"
              accessible
              accessibilityLabel="PAED"
            />
          </View>

          <View
            style={[
              styles.card,
              redefinicao.card,
            ]}
          >
            <ScrollView
              style={redefinicao.scrollFormulario}
              contentContainerStyle={[
                redefinicao.formulario,
                telaCompacta && redefinicao.formularioCompacto,
              ]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            >
              <Text
                style={[
                  styles.cardTitle,
                  telaCompacta && redefinicao.tituloCompacto,
                ]}
              >
                Redefinir senha
              </Text>

              <Text
                style={[
                  styles.cardFooterText,
                  redefinicao.descricao,
                ]}
              >
                Digite sua nova senha abaixo.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nova senha</Text>

                <TextInput
                  style={estiloInput}
                  accessibilityLabel="Nova senha"
                  placeholder="Digite sua nova senha"
                  placeholderTextColor={colors.placeholder}
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!carregando}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => {
                    confirmarSenhaRef.current?.focus();
                  }}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar senha</Text>

                <TextInput
                  ref={confirmarSenhaRef}
                  style={estiloInput}
                  accessibilityLabel="Confirmar nova senha"
                  placeholder="Digite a senha novamente"
                  placeholderTextColor={colors.placeholder}
                  value={confirmarSenha}
                  onChangeText={setConfirmarSenha}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!carregando}
                  returnKeyType="done"
                  onSubmitEditing={alterarSenha}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  disabled: carregando,
                  busy: carregando,
                }}
                style={({ pressed }) => [
                  styles.button,
                  redefinicao.botao,
                  carregando && redefinicao.desativado,
                  pressed && styles.buttonPressed,
                ]}
                onPress={alterarSenha}
                disabled={carregando}
              >
                {carregando ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text
                    style={[
                      styles.buttonText,
                      redefinicao.textoCentralizado,
                    ]}
                  >
                    Alterar senha
                  </Text>
                )}
              </Pressable>

              <View style={redefinicao.rodape}>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    redefinicao.botaoVoltar,
                    carregando && redefinicao.desativado,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => {
                    Keyboard.dismiss();
                    router.replace("/login");
                  }}
                  disabled={carregando}
                >
                  <Text
                    style={[
                      styles.signUpLink,
                      redefinicao.textoCentralizado,
                    ]}
                  >
                    Voltar para o login
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}