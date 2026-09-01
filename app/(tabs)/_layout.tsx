import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";

export default function TabLayout() {

  const { tipoTema, tema } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle:{
                    backgroundColor: tema.card,
                    borderTopColor: tema.border,
                },

                tabBarActiveTintColor: tema.primary,
                tabBarInactiveTintColor:
                    tipoTema === "escuro" ? "#888" : "#999",
      }}
    >
      <Tabs.Screen
        name="TelaCalendario"
        options={{
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
          title: "Config",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="settings-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}