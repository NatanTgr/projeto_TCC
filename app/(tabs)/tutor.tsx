import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function DashboardTutor() {
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserName(
        data.user?.user_metadata?.full_name || 'Tutor'
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
    <SafeAreaView style={styles.dashboardContainer}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />

      <View style={styles.header}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.tutor },
          ]}
        >
          <Ionicons
            name="people"
            size={32}
            color={colors.white}
          />
        </View>

        <Text style={styles.welcomeText}>
          Olá, {userName}!
        </Text>

        <Text style={styles.roleBadgeTutor}>
          Perfil: Tutor
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          Apoio aos Alunos
        </Text>

        <View style={styles.dashboardCard}>
          <Ionicons
            name="people-outline"
            size={24}
            color={colors.tutor}
          />

          <Text style={styles.dashboardCardText}>
            Acompanhe e apoie os alunos.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.chatDashboardButton,
            pressed && styles.chatDashboardButtonPressed,
          ]}
          onPress={abrirChat}
        >
          <View style={styles.chatDashboardIcon}>
            <Ionicons
              name="chatbubbles-outline"
              size={25}
              color={colors.white}
            />
          </View>

          <View style={styles.chatDashboardInfo}>
            <Text style={styles.chatDashboardTitle}>
              Mensagens
            </Text>

            <Text style={styles.chatDashboardSubtitle}>
              Converse com outros usuários
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
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

        <Text style={styles.logoutText}>
          Sair da conta
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}