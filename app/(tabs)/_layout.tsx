import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../bd/supabase';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { tipoTema, tema } = useTheme();

  const [carregandoTipoUsuario, setCarregandoTipoUsuario] = useState(true);
  const [tipoUsuario, setTipoUsuario] = useState<string | null>(null);

  useEffect(() => {
    const carregarTipoUsuario = async (userId: string) => {
      console.log('Buscando tipo do usuário:', userId);

      const { data, error } = await supabase
        .from('usuarios')
        .select('tipo')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('Erro ao buscar tipo do usuário:', error);
        setCarregandoTipoUsuario(false);
        return;
      }

      console.log('Tipo do usuário:', data.tipo);

      setTipoUsuario(data.tipo);
      setCarregandoTipoUsuario(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        carregarTipoUsuario(session.user.id);
      } else {
        setTipoUsuario(null);
        setCarregandoTipoUsuario(false);
      }
    });

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
      initialRouteName="TelaTarefas"
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: tema.card,
          borderTopColor: tema.border,

          height: 50 + insets.bottom,

          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },

        tabBarActiveTintColor: tema.primary,
        tabBarInactiveTintColor:
          tipoTema === 'escuro' ? '#888' : '#999',

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      {/* CHAT */}
      <Tabs.Screen
        name="TelaChat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbubble-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* CALENDÁRIO */}
      <Tabs.Screen
        name="TelaCalendario"
        options={{
          title: 'Calendário',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="calendar-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* TAREFAS */}
      <Tabs.Screen
        name="TelaTarefas"
        options={{
          title: 'Tarefas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="list-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* CONFIGURAÇÕES */}
      <Tabs.Screen
        name="TelaConfig"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="settings-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* TELAS INTERNAS - NÃO APARECEM NA TAB BAR */}

      <Tabs.Screen
        name="TelaTarefasTutor"
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