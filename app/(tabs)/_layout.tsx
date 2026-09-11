import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useEffect, useState } from "react";
import { supabase } from "../../bd/supabase";

export default function TabLayout() {
  const { tipoTema, tema } = useTheme();

  const [carregandoTipoUsuario, setCarregandoTipoUsuario] = useState(true);

  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);

useEffect(() => {

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
  };

  // Verifica se já existe uma sessão
  supabase.auth.getSession().then(({ data: { session } }) => {

    if (session?.user) {

      carregarTipoUsuario(session.user.id);

    } else {

      setTipoUsuario(null);
      setCarregandoTipoUsuario(false);

    }

  });

  // Fica observando login e logout
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {

    if (session?.user) {

      carregarTipoUsuario(session.user.id);

    } else {

      setTipoUsuario(null);
      setCarregandoTipoUsuario(false);

    }

  });

  return () => {

    subscription.unsubscribe();

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