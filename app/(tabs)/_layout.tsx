
import { Platform } from "react-native";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useEffect, useState, useRef } from "react";
import * as Notifications from "expo-notifications";
import { supabase } from "../../bd/supabase";
import { registrarNotificacoes } from "../../services/notificacoes";
import AlertaTutorGlobal from "../../components/AlertaTutorGlobal";
import ModalBoasVindas from "../../components/ModalBoasVindas";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFontSize } from "../../context/FontSizeContext";

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

  const usuarioRegistradoRef = useRef<string | null>(null);
  const usuarioAtualRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    const carregarTipoUsuario = async (userId: string) => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("tipo")
        .eq("id", userId)
        .single();

      if (!active || usuarioAtualRef.current !== userId) return;

      if (error) {
        console.log("Erro ao buscar tipo do usuário:", error);
      }

      setTipoUsuario(data?.tipo ?? null);
      setCarregandoTipoUsuario(false);

      if (
        !error &&
        usuarioRegistradoRef.current !== userId
      ) {
        usuarioRegistradoRef.current = userId;

        try {
          await registrarNotificacoes();
        } catch (erro) {
          usuarioRegistradoRef.current = null;

          console.log(
            "Erro ao registrar notificações:",
            erro
          );
        }
      }
    };

    const atualizarUsuario = (userId: string | null) => {
      if (!active) return;

      if (!userId) {
        usuarioAtualRef.current = null;
        usuarioRegistradoRef.current = null;

        setUsuarioId(null);
        setTipoUsuario(null);
        setCarregandoTipoUsuario(false);
        return;
      }

      if (usuarioAtualRef.current === userId) return;

      usuarioAtualRef.current = userId;
      setUsuarioId(userId);
      setCarregandoTipoUsuario(true);

      void carregarTipoUsuario(userId);
    };

    supabase.auth.getSession().then(
      ({ data: { session }, error }) => {
        if (!active) return;

        if (error) {
          console.log("Erro ao recuperar sessão:", error);
        }

        atualizarUsuario(session?.user?.id ?? null);
      }
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;

        atualizarUsuario(session?.user?.id ?? null);
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

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

    Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response?.notification) {
          abrirNotificacao(response.notification);
        }
      })
      .catch((erro) => {
        console.log(
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

  if (carregandoTipoUsuario) return null;

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

          tabBarInactiveTintColor: tipoTema === "escuro" ? "#888" : "#999",

          tabBarLabelStyle: {
            fontSize: 12 * escalaFonte,
            fontWeight: "500",
            fontFamily: "FredokaLight",
          },
        }}
      >
        {/* CHAT */}
        <Tabs.Screen
          name="TelaChat"
          options={{
            title: "Chat",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubble-outline" color={color} size={size} />
            ),
          }}
        />

        {/* CALENDÁRIO */}
        <Tabs.Screen
          name="TelaCalendario"
          options={{
            href: tipoUsuario === "estudante" ? undefined : null,
            title: "Calendário",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" color={color} size={size} />
            ),
          }}
        />

        {/* TAREFAS */}
        <Tabs.Screen
          name="TelaTarefas"
          options={{
            href: tipoUsuario === "estudante" ? undefined : null,
            title: "Tarefas",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" color={color} size={size} />
            ),
          }}
        />

        {/* TAREFAS TUTOR */}
        <Tabs.Screen
          name="TelaTarefasTutor"
          options={{
            href:
              tipoUsuario === "tutor" || tipoUsuario === "napne"
                ? undefined
                : null,
            title: "Tarefas",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" color={color} size={size} />
            ),
          }}
        />

        {/* CONFIGURAÇÕES */}
        <Tabs.Screen
          name="TelaConfig"
          options={{
            title: "Configurações",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" color={color} size={size} />
            ),
          }}
        />

        {/* TELAS INTERNAS */}
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

      <AlertaTutorGlobal />

      <ModalBoasVindas key={usuarioId ?? "sem-usuario"} usuarioId={usuarioId} />
    </>
  );
}
