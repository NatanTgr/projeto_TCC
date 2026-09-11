import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { styles, colors } from '../../style';

export default function DashboardProfessor() {
  const router = useRouter();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserName(
        data.user?.user_metadata?.full_name || 'Professor'
      );
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
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
            { backgroundColor: colors.professor },
          ]}
        >
          <Ionicons name="person" size={32} color={colors.white} />
        </View>

        <Text style={styles.welcomeText}>
          Olá, Prof. {userName}!
        </Text>

        <Text style={styles.roleBadgeProfessor}>
          Perfil: Professor
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          Gestão de Turmas
        </Text>

        <View style={styles.dashboardCard}>
          <Ionicons
            name="people-outline"
            size={24}
            color={colors.professor}
          />

          <Text style={styles.dashboardCardText}>
            Gerencie e acompanhe seus alunos.
          </Text>
        </View>
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
