import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '../style';

export default function QuemSomos() {
  const continuar = async () => {
    try {
      await AsyncStorage.setItem('@meu_app:quem_somos_visto', 'true');
      router.replace('/welcome');
    } catch (error) {
      console.error('Erro ao salvar apresentação:', error);
      router.replace('/welcome');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Image
          source={require('../assets/images/logo_PAED.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Título */}
        <Text style={styles.title}>Sobre o PAED</Text>

        {/* Sobre o projeto */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sobre o projeto</Text>

          <Text style={styles.text}>
            O PAED é um aplicativo desenvolvido no IFPR – Campus Pinhais,
            criado com o objetivo de auxiliar estudantes com TEA na
            organização de suas atividades acadêmicas e na comunicação
            com professores e tutores.
          </Text>

          <Text style={styles.text}>
            O aplicativo reúne recursos para facilitar a organização das
            tarefas, calendário e comunicação, buscando oferecer uma
            experiência simples, acessível e acolhedora.
          </Text>
        </View>

        {/* Nossa missão */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Nossa missão</Text>

          <Text style={styles.text}>
            Tornar a rotina escolar mais organizada, acessível e acolhedora,
            oferecendo ferramentas que auxiliem estudantes, professores e
            tutores no dia a dia acadêmico.
          </Text>
        </View>

        {/* Equipe */}
        <Text style={styles.sectionTitle}>Nossa equipe</Text>

        <Text style={styles.subsectionTitle}>Integrantes</Text>

        <View style={styles.teamRow}>
          {/* Natan */}
          <View style={styles.member}>
            <Image
              source={require('../assets/images/equipe/sabido.jpg')}
              style={styles.avatar}
            />

            <Text style={styles.memberName}>Natan </Text>
            <Text style={styles.memberRole}>Desenvolvimento</Text>
          </View>

          {/* João */}
          <View style={styles.member}>
            <Image
              source={require('../assets/images/equipe/sabido.jpg')}
              style={styles.avatar}
            />

            <Text style={styles.memberName}>João</Text>
            <Text style={styles.memberRole}>Desenvolvimento</Text>
          </View>

          {/* Maria */}
          <View style={styles.member}>
            <Image
              source={require('../assets/images/equipe/sabido.jpg')}
              style={styles.avatar}
            />

            <Text style={styles.memberName}>Maria </Text>
            <Text style={styles.memberRole}>Desenvolvimento</Text>
          </View>
        </View>

        {/* Orientadoras */}
        <Text style={styles.subsectionTitle}>Orientadoras</Text>

        <View style={styles.teamRow}>
          {/* Orientadora 1 */}
          <View style={styles.member}>
            <Image
              source={require('../assets/images/equipe/sabido.jpg')}
              style={styles.avatar}
            />

            <Text style={styles.memberName}>Paula Cristina Stopa</Text>
            <Text style={styles.memberRole}>Orientadora</Text>
          </View>

          {/* Orientadora 2 */}
          <View style={styles.member}>
            <Image
              source={require('../assets/images/equipe/sabido.jpg')}
              style={styles.avatar}
            />

            <Text style={styles.memberName}>Lauriana Paludo</Text>
            <Text style={styles.memberRole}>Coorientadora</Text>
          </View>
        </View>

        {/* Instituição */}
        <View style={styles.institutionCard}>
          <Text style={styles.institutionTitle}>
            IFPR Campus Pinhais
          </Text>

          <Text style={styles.institutionText}>
            TCC Técnico em Informática
          </Text>
        </View>

        {/* Instagram */}
        <View style={styles.instagramContainer}>
  <FontAwesome
    name="instagram"
    size={22}
    color='#836F68'
  />
  <Text style={styles.instagram}>@paed.tcc</Text>
</View>

        {/* Versão */}
        <Text style={styles.version}>PAED v1.0.0</Text>
      </ScrollView>

      {/* Botão */}
      <Pressable
        style={styles.button}
        onPress={continuar}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 30,
    paddingTop: 20,
  },

  scrollContent: {
    alignItems: 'center',
    paddingBottom: 25,
  },

  logo: {
    width: 300,
    height: 140,
    marginTop: 5,
    marginBottom: 5,
  },

  title: {
    width: '100%',
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 22,
    textAlign: 'left',
  },

  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E8E2D5',
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },

  text: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'justify',
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginTop: 5,
    marginBottom: 15,
  },

  subsectionTitle: {
    width: '100%',
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 14,
    marginTop: 4,
  },

  teamRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 18,
    marginBottom: 22,
  },

  member: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 110,
  },

  avatar: {
    width: 98,
    height: 98,
    borderRadius: 49,
    backgroundColor: '#FFAA56',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
  },

  memberName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },

  memberRole: {
    color: colors.text,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 3,
  },

  institutionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 18,
    marginTop: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E8E2D5',
    alignItems: 'center',
  },

  institutionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },

  institutionText: {
    color: colors.text,
    fontSize: 15,
    textAlign: 'center',
  },

  instagramContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  marginBottom: 10,
},

instagram: {
  color: colors.text,
  fontSize: 16,
  fontWeight: '600',
},

  version: {
    color: colors.text,
    fontSize: 13,
    marginBottom: 5,
  },

  button: {
    width: '100%',
    backgroundColor: '#FFAA56',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});