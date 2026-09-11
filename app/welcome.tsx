import React from 'react';
import {
  View,
  Text,
  Pressable,
  StatusBar,
  ScrollView,
  Image, // Import do componente Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { styles, colors } from '../style';

export default function Welcome() {
  const router = useRouter();

  const handleSelectRole = (role: string) => {
    router.push({
      pathname: '/signUp',
      params: { role },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Bloco do logo atualizado para exibir a imagem */}
        <View style={styles.logoContainerWelcome}>
          <Image
            source={require('../assets/images/logo_PAED.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Como você vai usar o PAED?</Text>

        <View style={styles.cardsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.welcomeCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => handleSelectRole('Estudante')}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.student },
              ]}
            >
              <Ionicons name="school" size={28} color={colors.white} />
            </View>

            <View style={styles.cardTextContainer}>
              <Text style={styles.welcomeCardTitle}>Estudante</Text>
              <Text style={styles.cardSubtitle}>Organize suas tarefas</Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.welcomeCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => handleSelectRole('Professor')}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.professor },
              ]}
            >
              <Ionicons name="person" size={28} color={colors.white} />
            </View>

            <View style={styles.cardTextContainer}>
              <Text style={styles.welcomeCardTitle}>Professor</Text>
              <Text style={styles.cardSubtitle}>Gerencie alunos</Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.welcomeCard,
              pressed && styles.cardPressed,
            ]}
            onPress={() => handleSelectRole('Tutor')}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: colors.tutor },
              ]}
            >
              <Ionicons name="people" size={28} color={colors.white} />
            </View>

            <View style={styles.cardTextContainer}>
              <Text style={styles.welcomeCardTitle}>Tutor</Text>
              <Text style={styles.cardSubtitle}>Apoie alunos</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Pressable onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Já tem uma conta? Entre aqui</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}