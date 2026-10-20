import { useEffect, useState } from "react";

import {
  View,
  Image,
  StyleSheet,
  Linking,
  AppState,
} from "react-native";

import { Stack, router } from "expo-router";
import type { Session } from "@supabase/supabase-js";
import { useFonts } from "expo-font";
import AsyncStorage from "@react-native-async-storage/async-storage";

import * as Notifications from "expo-notifications";

import { registrarPushChat } from "../components/notificacoesChat";
import { obterConversaAtiva } from "../components/conversaAtiva";

import { supabase } from "../lib/supabase";
import { styles as globalStyles, colors } from "../style";

import {
  ThemeProvider,
  useTheme,
} from "../context/ThemeContext";

import { FontSizeProvider } from "../context/FontSizeContext";

// =====================================================
// CONSTANTES
// =====================================================

const VERSAO_TERMO = "1.0";
const TERMO_STORAGE_KEY = "@paed:termo_autorizacao";

// =====================================================
// NAVEGAÇÃO COM TEMA
// =====================================================

function NavegacaoComTema() {
  const { tema, tipoTema } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        statusBarStyle: "dark",
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          statusBarStyle:
            tipoTema === "claro" ? "dark" : "light",

          contentStyle: {
            backgroundColor: tema.background,
          },
        }}
      />
    </Stack>
  );
}

// =====================================================
// VERIFICAR ACEITE LOCAL DOS TERMOS
// =====================================================

async function verificarTermoLocal(): Promise<boolean> {
  try {
    const termoSalvo = await AsyncStorage.getItem(
      TERMO_STORAGE_KEY
    );

    if (!termoSalvo) {
      return false;
    }

    const termo = JSON.parse(termoSalvo);

    return (
      termo?.aceito === true &&
      termo?.versao === VERSAO_TERMO
    );
  } catch (error) {
    console.error(
      "Erro ao verificar aceite do termo:",
      error
    );

    return false;
  }
}

// =====================================================
// REGISTRAR ACEITE NO SUPABASE
// =====================================================

async function registrarAceiteNoSupabase(
  session: Session
): Promise<void> {
  try {
    const {
      data: aceiteExistente,
      error: erroConsulta,
    } = await supabase
      .from("aceites_termos")
      .select("id")
      .eq("usuario_id", session.user.id)
      .eq("versao_termo", VERSAO_TERMO)
      .maybeSingle();

    if (erroConsulta) {
      console.error(
        "Erro ao verificar aceite do termo:",
        erroConsulta
      );

      return;
    }

    if (!aceiteExistente) {
      const { error } = await supabase
        .from("aceites_termos")
        .insert({
          usuario_id: session.user.id,
          versao_termo: VERSAO_TERMO,
        });

      if (error) {
        console.error(
          "Erro ao registrar aceite do termo:",
          error
        );
      }
    }
  } catch (error) {
    console.error(
      "Erro ao registrar aceite no Supabase:",
      error
    );
  }
}

// =====================================================
// NAVEGAÇÃO INICIAL
// =====================================================

async function handleNavigation(
  session: Session | null
): Promise<void> {
  // Verifica se o usuário aceitou os termos.

  const termoAceito = await verificarTermoLocal();

  if (!termoAceito) {
    router.replace("/TelaTermo");
    return;
  }

  // Sem sessão, abre as boas-vindas.

  if (!session) {
    router.replace("/welcome");
    return;
  }

  // Registra o aceite no Supabase.

  await registrarAceiteNoSupabase(session);

  // Busca o tipo do usuário.

  const { data: usuario, error } = await supabase
    .from("usuarios")
    .select("tipo")
    .eq("id", session.user.id)
    .single();

  if (error || !usuario) {
    console.error(
      "Erro ao buscar tipo do usuário:",
      error
    );

    return;
  }

  // Tutora/Tutor e NAPNE

  if (
    usuario.tipo === "tutor" ||
    usuario.tipo === "napne"
  ) {
    router.replace("/(tabs)/TelaTarefasTutor");
    return;
  }

  // Professora/Professor

  if (usuario.tipo === "professor") {
    router.replace("/(tabs)/TelaChat");
    return;
  }

  // Estudante

  router.replace("/(tabs)/TelaTarefas");
}

// =====================================================
// LAYOUT PRINCIPAL
// =====================================================

export default function RootLayout() {
  const [loading, setLoading] = useState(true);

  const [fontesCarregadas, erroFontes] = useFonts({
    FredokaLight: require("../assets/fonts/Fredoka-Light.ttf"),
    FredokaMedium: require("../assets/fonts/Fredoka-Medium.ttf"),
  });

  // =====================================================
  // SESSÃO, RECUPERAÇÃO E NOTIFICAÇÕES
  // =====================================================

  useEffect(() => {
    let ativo = true;
    let isPasswordRecovery = false;

    // ===================================================
    // AGENDAR NAVEGAÇÃO SEM BLOQUEAR A TELA
    // ===================================================

    const agendarNavegacao = (
      session: Session | null
    ) => {
      // Libera a tela da logo antes de navegar.
      setLoading(false);

      // Aguarda a próxima atualização da interface
      // para permitir que o Expo Router monte o Stack.

      requestAnimationFrame(() => {
        if (!ativo || isPasswordRecovery) {
          return;
        }

        void handleNavigation(session).catch((error) => {
          console.error(
            "Erro ao executar navegação inicial:",
            error
          );
        });
      });
    };

    // ===================================================
    // PROCESSAR LINK DE RECUPERAÇÃO
    // ===================================================

    const handleRecoveryUrl = async (
      url: string | null
    ): Promise<void> => {
      if (!url || !ativo) {
        return;
      }

      if (
        !url.startsWith("meuapp://reset-password")
      ) {
        return;
      }

      try {
        const hashIndex = url.indexOf("#");

        if (hashIndex === -1) {
          return;
        }

        const hash = url.substring(hashIndex + 1);

        const params: Record<string, string> = {};

        hash.split("&").forEach((item) => {
          const [key, ...valueParts] = item.split("=");

          if (!key) {
            return;
          }

          const value = valueParts.join("=");

          params[key] = decodeURIComponent(value);
        });

        const accessToken = params.access_token;
        const refreshToken = params.refresh_token;

        if (!accessToken || !refreshToken) {
          console.log(
            "Link de recuperação não possui os tokens necessários."
          );

          return;
        }

        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!ativo) {
          return;
        }

        if (error) {
          console.error(
            "Erro ao criar sessão de recuperação:",
            error.message
          );

          return;
        }

        isPasswordRecovery = true;

        setLoading(false);

        requestAnimationFrame(() => {
          if (ativo) {
            router.replace("/reset-password");
          }
        });
      } catch (error) {
        console.error(
          "Erro ao processar link de recuperação:",
          error
        );
      }
    };

    // ===================================================
    // VERIFICAR LINK INICIAL
    // ===================================================

    void Linking.getInitialURL()
      .then(async (url) => {
        if (!ativo) {
          return;
        }

        await handleRecoveryUrl(url);
      })
      .catch((error) => {
        console.error(
          "Erro ao verificar link inicial:",
          error
        );
      });

    // ===================================================
    // OUVIR LINKS RECEBIDOS
    // ===================================================

    const linkingSubscription = Linking.addEventListener(
      "url",
      ({ url }) => {
        void handleRecoveryUrl(url).catch((error) => {
          console.error(
            "Erro ao processar link recebido:",
            error
          );
        });
      }
    );

    // ===================================================
    // CARREGAR SESSÃO INICIAL
    // ===================================================

    const carregarSessaoInicial =
      async (): Promise<void> => {
        try {
          const { data, error } =
            await supabase.auth.getSession();

          if (!ativo) {
            return;
          }

          if (error) {
            console.error(
              "Erro ao recuperar sessão:",
              error
            );
          }

          if (!isPasswordRecovery) {
            // Não aguardamos as consultas de navegação
            // para liberar a tela da logo.

            agendarNavegacao(data.session);
          }
        } catch (error) {
          console.error(
            "Erro inesperado ao recuperar sessão:",
            error
          );

          if (ativo && !isPasswordRecovery) {
            agendarNavegacao(null);
          }
        }
      };

    // Mantém o intervalo original do PAED.

    const timer = setTimeout(() => {
      void carregarSessaoInicial().catch((error) => {
        console.error(
          "Falha ao iniciar a sessão:",
          error
        );

        if (ativo && !isPasswordRecovery) {
          agendarNavegacao(null);
        }
      });
    }, 1100);

    // ===================================================
    // MONITORAR AUTENTICAÇÃO
    // ===================================================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session: Session | null) => {
        if (!ativo) {
          return;
        }

        // Registrar push quando entrar na conta.

        if (
          session?.user &&
          event === "SIGNED_IN"
        ) {
          void registrarPushChat(
            session.user.id
          ).catch((error) => {
            console.error(
              "Erro ao registrar push após login:",
              error
            );
          });
        }

        // Recuperação de senha.

        if (event === "PASSWORD_RECOVERY") {
          isPasswordRecovery = true;

          setLoading(false);

          requestAnimationFrame(() => {
            if (ativo) {
              router.replace("/reset-password");
            }
          });
        }
      }
    );

    // ===================================================
    // REGISTRAR PUSH DO USUÁRIO ATUAL
    // ===================================================

    const registrarUsuarioAtual =
      async (): Promise<void> => {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!ativo) {
          return;
        }

        if (error) {
          throw error;
        }

        if (user) {
          await registrarPushChat(user.id);
        }
      };

    void registrarUsuarioAtual().catch((error) => {
      console.error(
        "Erro ao registrar push do usuário atual:",
        error
      );
    });

    // ===================================================
    // NOTIFICAÇÕES RECEBIDAS
    // ===================================================

    const notificacaoRecebida =
      Notifications.addNotificationReceivedListener(
        () => {
          // A apresentação das notificações
          // é controlada pelo handler global.
        }
      );

    // ===================================================
    // NOTIFICAÇÕES TOCADAS
    // ===================================================

    const notificacaoTocada =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          if (!ativo) {
            return;
          }

          const dados =
            response.notification.request.content.data;

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
        }
      );

    // ===================================================
    // LIMPEZA DOS LISTENERS
    // ===================================================

    return () => {
      ativo = false;

      clearTimeout(timer);

      subscription.unsubscribe();

      linkingSubscription.remove();

      notificacaoRecebida.remove();

      notificacaoTocada.remove();
    };
  }, []);

  // =====================================================
  // TELA DE CARREGAMENTO
  // =====================================================

  if (loading) {
    return (
      <View style={localStyles.splashContainer}>
        <Image
          source={require("../assets/images/logo_PAED.png")}
          style={globalStyles.logoImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Aguarda o carregamento das fontes.

  if (!fontesCarregadas && !erroFontes) {
    return null;
  }

  // =====================================================
  // PROVIDERS E NAVEGAÇÃO
  // =====================================================

  return (
    <ThemeProvider>
      <FontSizeProvider>
        <NavegacaoComTema />
      </FontSizeProvider>
    </ThemeProvider>
  );
}

// =====================================================
// CONFIGURAÇÃO GLOBAL DAS NOTIFICAÇÕES
// =====================================================

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const dados = notification.request.content.data;

    // Pessoa com quem estamos conversando.

    const conversaAtiva = obterConversaAtiva();

    // Verifica se o aplicativo está aberto.

    const aplicativoAberto =
      AppState.currentState === "active";

    // Verifica se é uma notificação de mensagem.

    const notificacaoDeMensagem =
      dados?.tipo === "mensagem";

    // Identifica quem enviou.

    const remetenteId =
      typeof dados?.remetenteId === "string"
        ? dados.remetenteId
        : null;

    // Oculta a notificação se o usuário
    // já está na conversa correspondente.

    const ocultarNotificacao =
      aplicativoAberto &&
      notificacaoDeMensagem &&
      remetenteId !== null &&
      remetenteId === conversaAtiva;

    if (ocultarNotificacao) {
      return {
        shouldShowBanner: false,
        shouldShowList: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      };
    }

    // Mantém as demais notificações normalmente.

    return {
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

// =====================================================
// ESTILOS
// =====================================================

const localStyles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
});