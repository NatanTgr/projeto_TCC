import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useEffect, useState, useRef } from "react";
import * as Notifications from "expo-notifications";
import { supabase } from "../../bd/supabase";
import { registrarNotificacoes } from "../../services/notificacoes";

export default function TabLayout() {
  const { tipoTema, tema } = useTheme();

  const [carregandoTipoUsuario, setCarregandoTipoUsuario] = useState(true);

  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);

  const usuarioRegistradoRef = useRef<string | null>(null);

useEffect(() => {
  const registrarDispositivo = async (userId: string) => {
    if (usuarioRegistradoRef.current === userId) {
      return;
    }

    usuarioRegistradoRef.current = userId;

    try {
      const token = await registrarNotificacoes();

      if (token) {
        console.log("Notificações registradas:", token);
      }
    } catch (erro) {
      usuarioRegistradoRef.current = null;
      console.log("Erro ao registrar notificações:", erro);
    }
  };

  const carregarTipoUsuario = async (userId: string) => {
    console.log("Buscando tipo do usuário:", userId);

    const { data, error } = await supabase
      .from("usuarios")
      .select("tipo")
      .eq("id", userId)
      .single();

    if (error) {
      console.log("Erro ao buscar tipo do usuário:", error);
      setCarregandoTipoUsuario(false);
      return;
    }

    console.log("Tipo do usuário:", data.tipo);

    setTipoUsuario(data.tipo);
    setCarregandoTipoUsuario(false);

    // Solicita a permissão e salva o token no Supabase
    await registrarDispositivo(userId);
  };

  const verificarSessao = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.log("Erro ao recuperar sessão:", error);
      setCarregandoTipoUsuario(false);
      return;
    }

    if (session?.user) {
      await carregarTipoUsuario(session.user.id);
    } else {
      setTipoUsuario(null);
      setCarregandoTipoUsuario(false);
    }
  };

  verificarSessao();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      carregarTipoUsuario(session.user.id);
    } else {
      usuarioRegistradoRef.current = null;
      setTipoUsuario(null);
      setCarregandoTipoUsuario(false);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

useEffect(() => {
  const abrirNotificacao = (notification: Notifications.Notification) => {
    const rota = notification.request.content.data?.rota;

    if (typeof rota === "string") {
      router.push(rota as never);
    }
  };

  // Notificação que abriu o aplicativo
  Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      if (response?.notification) {
        abrirNotificacao(response.notification);
      }
    })
    .catch((erro) => {
      console.log("Erro ao verificar última notificação:", erro);
    });

  // Notificação tocada enquanto o aplicativo está aberto
  // ou executando em segundo plano
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      abrirNotificacao(response.notification);
    },
  );

  return () => {
    subscription.remove();
  };
}, []);

if (carregandoTipoUsuario) {
  return null;
}

  return (
    <Tabs
      initialRouteName={
        tipoUsuario === "tutor" ? "TelaTarefasTutor" : "TelaCalendario"
      }
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: tema.card,
          borderTopColor: tema.border,
        },

        tabBarActiveTintColor: tema.primary,

        tabBarInactiveTintColor: tipoTema === "escuro" ? "#888" : "#999",
      }}
    >
      <Tabs.Screen
        name="TelaChat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="TelaCalendario"
        options={{
          title: "Calendário",

          href: tipoUsuario === "tutor" ? null : "/TelaCalendario",

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="TelaTarefas"
        options={{
          title: "Tarefas",

          href: tipoUsuario === "tutor" ? null : "/TelaTarefas",

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="TelaTarefasTutor"
        options={{
          title: "Tarefas",

          href: tipoUsuario === "tutor" ? "/TelaTarefasTutor" : null,

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="TelaConfig"
        options={{
          title: "Config",

          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}