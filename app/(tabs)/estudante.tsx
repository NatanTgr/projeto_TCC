import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  View,
  Text,
  Pressable,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { supabase } from '../../lib/supabase';
import { styles, colors } from '../../style';

export default function DashboardEstudante() {
  const router = useRouter();

  const [userName, setUserName] =
    useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserName(
        data.user?.user_metadata?.full_name ||
          'Estudante'
      );
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const abrirChat = () => {
    router.push('/chat' as any);
  };

  return (
    <SafeAreaView
      style={styles.dashboardContainer}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />

      <View style={styles.header}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor:
                colors.student,
            },
          ]}
        >
          <Ionicons
            name="school"
            size={32}
            color={colors.white}
          />
        </View>

        <Text
          style={styles.welcomeText}
        >
          Olá, {userName}!
        </Text>

        <Text
          style={
            styles.roleBadgeStudent
          }
        >
          Perfil: Estudante
        </Text>
      </View>

      <View style={styles.content}>
        <Text
          style={styles.sectionTitle}
        >
          Suas Atividades
        </Text>

        <View
          style={styles.dashboardCard}
        >
          <Ionicons
            name="journal-outline"
            size={24}
            color={colors.student}
          />

          <Text
            style={
              styles.dashboardCardText
            }
          >
            Nenhuma tarefa pendente para hoje.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.dashboardCard,
            {
              marginTop: 12,
            },
            pressed &&
              styles.cardPressed,
          ]}
          onPress={abrirChat}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={24}
            color={colors.student}
          />

          <Text
            style={
              styles.dashboardCardText
            }
          >
            Mensagens
          </Text>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.placeholder}
          />
        </Pressable>
      </View>

      <Pressable
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color={colors.danger}
        />

        <Text
          style={styles.logoutText}
        >
          Sair da conta
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}