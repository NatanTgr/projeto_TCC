import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

import { supabase } from "../lib/supabase";
import {
  styles,
  colors,
  loginStyles as login,
} from "../style";

const traduzirErroSupabase = (mensagem?: string) => {
  if (!mensagem) return "Usuário ou senha incorretos.";

  if (mensagem.includes("Invalid login credentials")) {
    return "E-mail ou senha incorretos. Verifique seus dados e tente novamente.";
  }

  if (mensagem.includes("Email not confirmed")) {
    return "E-mail não confirmado. Por favor, verifique sua caixa de entrada.";
  }

  if (mensagem.includes("User not found")) {
    return "Usuário não encontrado.";
  }

  if (mensagem.includes("Too many requests")) {
    return "Muitas tentativas sem sucesso. Aguarde um momento e tente novamente.";
  }

  return mensagem;
};

export default function LoginScreen() {
  const router = useRouter();
  const senhaRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tecladoAberto, setTecladoAberto] = useState(false);

  const { width, height, fontScale } = useWindowDimensions();

  const telaCompacta = width < 360 || height < 700;
  const modoCompacto = telaCompacta || tecladoAberto;
  const logoPequeno = height < 500 || tecladoAberto;

  useEffect(() => {
    const eventoAbrir =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";

    const eventoFechar =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const abrir = Keyboard.addListener(eventoAbrir, () => {
      setTecladoAberto(true);
    });

    const fechar = Keyboard.addListener(eventoFechar, () => {
      setTecladoAberto(false);
    });

    return () => {
      abrir.remove();
      fechar.remove();
    };
  }, []);

  const estiloInput = [
    styles.input,
    login.input,
    {
      minHeight: Math.max(48, Math.ceil(24 * fontScale + 20)),
    },
  ];

  const handleLogin = async () => {
    if (loading) return;

    if (!email.trim() || !password) {
      Alert.alert("Atenção", "Por favor, preencha e-mail e senha.");
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        Alert.alert(
          "Erro ao entrar",
          traduzirErroSupabase(error?.message)
        );
        return;
      }

      const { data: usuario, error: usuarioError } = await supabase
        .from("usuarios")
        .select("tipo")
        .eq("id", data.user.id)
        .single();

      if (usuarioError || !usuario) {
        console.log("Erro ao buscar tipo do usuário:", usuarioError);

        Alert.alert(
          "Erro",
          "Não foi possível identificar o tipo de usuário."
        );
        return;
      }

            if (
        usuario.tipo === "tutor" ||
        usuario.tipo === "napne"
      ) {
        router.replace("/(tabs)/TelaTarefasTutor");
      } else if (usuario.tipo === "professor") {
        router.replace("/(tabs)/TelaChat");
      } else {
        router.replace("/(tabs)/TelaTarefas");
      }
    } catch (error) {
      console.error("Erro ao entrar:", error);

      Alert.alert(
        "Erro",
        "Não foi possível entrar. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={login.keyboard}
      >
        <View style={[login.conteudo, modoCompacto && login.conteudoCompacto]}>
          <View
            style={[
              login.logoContainer,
              modoCompacto && login.logoContainerCompacto,
            ]}
          >
            <Image
              source={require("../assets/images/logo_PAED.png")}
              style={[
                login.logo,
                telaCompacta && login.logoCompacto,
                logoPequeno && login.logoPequeno,
              ]}
              resizeMode="contain"
              accessible
              accessibilityLabel="PAED"
            />
          </View>

          <View style={[styles.card, login.card]}>
            <ScrollView
              style={login.scrollFormulario}
              contentContainerStyle={[
                login.formulario,
                modoCompacto && login.formularioCompacto,
              ]}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator
            >
              <Text
                style={[styles.cardTitle, modoCompacto && login.tituloCompacto]}
              >
                Bem-vindo de volta!
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>

                <TextInput
                  style={estiloInput}
                  accessibilityLabel="Email"
                  placeholder="seu@email.com"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  editable={!loading}
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => senhaRef.current?.focus()}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>

                <View style={login.campoSenhaContainer}>
                  <TextInput
                    ref={senhaRef}
                    style={[estiloInput, login.inputSenhaComIcone]}
                    accessibilityLabel="Senha"
                    placeholder="••••••••"
                    placeholderTextColor={colors.placeholder}
                    secureTextEntry={!mostrarSenha}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />

                  <Pressable
                    style={login.botaoMostrarSenha}
                    onPress={() => setMostrarSenha((visivel) => !visivel)}
                    accessibilityRole="button"
                    accessibilityLabel={
                      mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                    }
                    disabled={loading}
                    hitSlop={8}
                  >
                    <Feather
                      name={mostrarSenha ? "eye-off" : "eye"}
                      size={22}
                      color={colors.text}
                    />
                  </Pressable>
                </View>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityState={{
                  disabled: loading,
                  busy: loading,
                }}
                style={({ pressed }) => [
                  styles.button,
                  login.botao,
                  loading && login.desativado,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={[styles.buttonText, login.textoCentralizado]}>
                    Entrar
                  </Text>
                )}
              </Pressable>

              <View style={login.rodape}>
                <View style={login.linhaLinks}>
                  <Text
                    style={[styles.cardFooterText, login.textoCentralizado]}
                  >
                    Não tem uma conta?
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    disabled={loading}
                    style={({ pressed }) => [
                      login.linkBotao,
                      loading && login.desativado,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => {
                      Keyboard.dismiss();
                      router.push("/welcome");
                    }}
                  >
                    <Text style={[styles.signUpLink, login.textoCentralizado]}>
                      Criar conta
                    </Text>
                  </Pressable>
                </View>

                <View style={login.linhaLinks}>
                  <Text
                    style={[styles.cardFooterText, login.textoCentralizado]}
                  >
                    Esqueceu a senha?
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    disabled={loading}
                    style={({ pressed }) => [
                      login.linkBotao,
                      loading && login.desativado,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => {
                      Keyboard.dismiss();
                      router.push("/esqueciSenha");
                    }}
                  >
                    <Text style={[styles.signUpLink, login.textoCentralizado]}>
                      Redefinir senha
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}