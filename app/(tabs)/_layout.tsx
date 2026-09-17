import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8E2D5',

          // Altura normal + área dos botões/gestos do sistema
          height: 50 + insets.bottom,

          // Mantém os ícones/textos acima da navegação do Android
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },

        tabBarActiveTintColor: '#94C0DF',
        tabBarInactiveTintColor: '#A0A0A0',

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubble-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="calendario"
        options={{
          title: 'Calendário',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="calendar-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="estudante"
        options={{
          title: 'Tarefas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="list"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="professor"
        options={{
          title: 'Config',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="settings-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tutor"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="conversa"
        options={{
          href: null,
          headerShown: false,
          tabBarStyle: {
            display: 'none',
          },
        }}
      />
    </Tabs>
  );
}