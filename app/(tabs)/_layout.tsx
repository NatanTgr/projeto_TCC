
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Redirect, Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../../context/ThemeContext";
import { useFontSize } from "../../context/FontSizeContext";
import { supabase } from "../../bd/supabase";
import { registrarNotificacoes } from "../../services/notificacoes";
import AlertaTutorGlobal from "../../components/AlertaTutorGlobal";
import ModalBoasVindas from "../../components/ModalBoasVindas";

function obterMensagemErro(erro: unknown): string {
  if (
    typeof erro === "object" &&
    erro !== null &&
    "message" in erro
  ) {
    return String(erro.message);
  }

  return "Não foi possível consultar seu perfil.";
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { tipoTema, tema } = useTheme();
  const { escalaFonte } = useFontSize();

  const [carregandoTipoUsuario, setCarregandoTipoUsuario] =
    useState(true);

  const [tipoUsuario, setTipoUsuario] =
    useState<string | null>(null);

  const [usuarioId, setUsuarioId] =
    useState<string | null>(null);

  const [erroPerfil, setErroPerfil] =
    useState<string | null>(null);

  const [tentativaPerfil, setTentativaPerfil] = useState(0);

  const usuarioRegistradoRef = useRef<string | null>(null);
  const usuarioAtualRef = useRef<string | null>(null);
  const perfilCarregadoRef = useRef(false);
  const consultaEmAndamentoRef = useRef<string | null>(null);

  useEffect(() => {
    let ativo = true;

    const carregarTipoUsuario = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("usuarios")
          .select("tipo")
          .eq("id", userId)
          .single();

        if (!ativo || usuarioAtualRef.current !== userId) {
          return;
        }

        if (error || !data?.tipo) {
          throw error ?? new Error(
            "O perfil não foi encontrado na tabela usuarios."
          );
        }

        perfilCarregadoRef.current = true;

        setTipoUsuario(data.tipo);
        setErroPerfil(null);
        setCarregandoTipoUsuario(false);

        if (
          Platform.OS !== "web" &&
          usuarioRegistradoRef.current !== userId
        ) {
          usuarioRegistradoRef.current = userId;

          void registrarNotificacoes().catch((erro) => {
            usuarioRegistradoRef.current = null;

            console.error(
              "[TabLayout] Erro ao registrar notificações:",
              erro
            );
          });
        }
      } catch (erro) {
        if (!ativo || usuarioAtualRef.current !== userId) {
          return;
        }

        console.error(
          "[TabLayout] Erro ao identificar perfil:",
          erro
        );

        perfilCarregadoRef.current = false;

        setTipoUsuario(null);
        setErroPerfil(obterMensagemErro(erro));
        setCarregandoTipoUsuario(false);
      } finally {
        if (consultaEmAndamentoRef.current === userId) {
          consultaEmAndamentoRef.current = null;
        }
      }
    };

    const atualizarUsuario = (userId: string | null) => {
      if (!ativo) return;

      if (!userId) {
        usuarioAtualRef.current = null;
        usuarioRegistradoRef.current = null;
        perfilCarregadoRef.current = false;
        consultaEmAndamentoRef.current = null;

        setUsuarioId(null);
        setTipoUsuario(null);
        setErroPerfil(null);
        setCarregandoTipoUsuario(false);
        return;
      }

      const mudouUsuario = usuarioAtualRef.current !== userId;

      if (
        !mudouUsuario &&
        (
          perfilCarregadoRef.current ||
          consultaEmAndamentoRef.current === userId
        )
      ) {
        return;
      }

      usuarioAtualRef.current = userId;

      if (mudouUsuario) {
        usuarioRegistradoRef.current = null;
        perfilCarregadoRef.current = false;
        setUsuarioId(userId);
        setTipoUsuario(null);
      }

      setErroPerfil(null);
      setCarregandoTipoUsuario(true);

      consultaEmAndamentoRef.current = userId;

      void carregarTipoUsuario(userId);
    };

    void supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!ativo) return;

        if (error) {
          throw error;
        }

        atualizarUsuario(session?.user?.id ?? null);
      })
      .catch((erro) => {
        if (!ativo) return;

        console.error(
          "[TabLayout] Erro ao recuperar sessão:",
          erro
        );

        setErroPerfil(obterMensagemErro(erro));
        setCarregandoTipoUsuario(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (!ativo) return;

      // Se a primeira consulta falhou, um novo evento de
      // autenticação poderá tentar carregar o perfil novamente.
      atualizarUsuario(session?.user?.id ?? null);
    });

    return () => {
      ativo = false;
      consultaEmAndamentoRef.current = null;
      subscription.unsubscribe();
    };
  }, [tentativaPerfil]);

  useEffect(() => {
    if (Platform.OS === "web") return;

    const abrirNotificacao = (
      notification: Notifications.Notification
    ) => {
      const rota = notification.request.content.data?.rota;

      if (typeof rota === "string") {
        router.push(rota as never);
      }
    };

    void Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response?.notification) {
          abrirNotificacao(response.notification);
        }
      })
      .catch((erro) => {
        console.error(
          "Erro ao verificar última notificação:",
          erro
        );
      });

    const subscription =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          abrirNotificacao(response.notification);
        }
      );

    return () => {
      subscription.remove();
    };
  }, []);

  if (carregandoTipoUsuario) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tema.background,
        }}
      >
        <ActivityIndicator
          size="large"
          color={tema.primary}
        />
        <Text
          style={{
            color: tema.text,
            fontFamily: "FredokaLight",
            fontSize: 16 * escalaFonte,
            marginTop: 12,
          }}
        >
          Carregando perfil...
        </Text>
      </View>
    );
  }

  if (erroPerfil) {
    return (
      <View
        style={{
          flex: 1,
          padding: 24,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: tema.background,
        }}
      >
        <Ionicons
          name="warning-outline"
          size={48}
          color={tema.primary}
        />

        <Text
          style={{
            fontFamily: "FredokaMedium",
            fontSize: 22 * escalaFonte,
            color: tema.text,
            textAlign: "center",
            marginTop: 16,
          }}
        >
          Não foi possível carregar seu perfil
        </Text>

        <Text
          style={{
            fontFamily: "FredokaLight",
            fontSize: 15 * escalaFonte,
            color: tema.text,
            textAlign: "center",
            marginVertical: 16,
          }}
        >
          {erroPerfil}
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: tema.primary,
            paddingVertical: 14,
            paddingHorizontal: 24,
            borderRadius: 12,
          }}
          onPress={() => {
            setTentativaPerfil((valor) => valor + 1);
          }}
        >
          <Text
            style={{
              color: tema.textoBotao,
              fontFamily: "FredokaMedium",
              fontSize: 16 * escalaFonte,
            }}
          >
            Tentar novamente
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!usuarioId && !erroPerfil) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Tabs
        initialRouteName={
          tipoUsuario === "tutor" || tipoUsuario === "napne"
            ? "TelaTarefasTutor"
            : tipoUsuario === "professor"
              ? "TelaChat"
              : "TelaTarefas"
        }
        screenOptions={{
          headerShown: false,

          tabBarStyle: {
            backgroundColor: tema.card,
            borderTopColor: tema.border,
            height: 70 + 20 * (escalaFonte - 1) + insets.bottom,
            paddingBottom: 8 + insets.bottom,
            paddingTop: 8,
          },

          tabBarActiveTintColor: tema.primary,

          tabBarInactiveTintColor:
            tipoTema === "escuro" ? "#888" : "#999",

          tabBarLabelStyle: {
            fontSize: 12 * escalaFonte,
            fontWeight: "500",
            fontFamily: "FredokaLight",
          },
        }}
      >
        <Tabs.Screen
          name="TelaChat"
          options={{
            title: "Chat",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="chatbubble-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="TelaCalendario"
          options={{
            href: tipoUsuario === "estudante" ? undefined : null,
            title: "Calendário",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="calendar-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="TelaTarefas"
          options={{
            href: tipoUsuario === "estudante" ? undefined : null,
            title: "Tarefas",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="list-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="TelaTarefasTutor"
          options={{
            href:
              tipoUsuario === "tutor" || tipoUsuario === "napne"
                ? undefined
                : null,
            title: "Tarefas",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="list-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="TelaConfig"
          options={{
            title: "Configurações",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="settings-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="TelaConversa"
          options={{
            href: null,
            headerShown: false,
            tabBarStyle: {
              display: "none",
            },
          }}
        />

        <Tabs.Screen
          name="TelaSobrePaed"
          options={{
            href: null,
            headerShown: false,
            tabBarStyle: {
              display: "none",
            },
          }}
        />
      </Tabs>

      <AlertaTutorGlobal
        usuarioId={usuarioId}
        tipoUsuario={tipoUsuario}
      />

      <ModalBoasVindas
        key={usuarioId ?? "sem-usuario"}
        usuarioId={usuarioId}
      />
    </>
  );
}
