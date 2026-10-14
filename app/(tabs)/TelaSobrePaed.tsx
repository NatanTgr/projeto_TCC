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
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../style';

export default function TelaSobrePaed() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Ionicons
            name="arrow-back"
            size={27}
            color={colors.text}
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Sobre o PAED
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* Logo */}
        <Image
          source={require('../../assets/images/logo_PAED.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Título */}
        <Text style={styles.title}>
          Sobre o PAED
        </Text>

        {/* Sobre o projeto */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Sobre o projeto
          </Text>

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
          <Text style={styles.cardTitle}>
            🎯 Nossa missão
          </Text>

          <Text style={styles.text}>
            Tornar a rotina escolar mais organizada, acessível e acolhedora,
            oferecendo ferramentas que auxiliem estudantes, professores e
            tutores no dia a dia acadêmico.
          </Text>
        </View>

        {/* Equipe */}
        <Text style={styles.sectionTitle}>
          Nossa equipe
        </Text>

        <Text style={styles.subsectionTitle}>
          Integrantes
        </Text>

        <View style={styles.teamRow}>

          {/* Natan */}
          <View style={styles.member}>
            <Image
              source={require('../../assets/images/equipe/sabido.jpg')}
              style={styles.avatar}
            />

            <Text style={styles.memberName}>
              Natan
            </Text>

            <Text style={styles.memberRole}>
              Desenvolvimento
            </Text>
          </View>

          {/* João */}
          <View style={styles.member}>
            <Image
              source={require('../../assets/images/equipe/sabido.jpg')}
              style={styles.avatar}
            />

            <Text style={styles.memberName}>
              João
            </Text>

            <Text style={styles.memberRole}>
              Desenvolvimento
            </Text>
          </View>

          {/* Maria */}
          <View style={styles.member}>
            <Image
              source={require('../../assets/images/equipe/sabido.jpg')}
              style={styles.avatar}
            />

            <Text style={styles.memberName}>
              Maria
            </Text>

            <Text style={styles.memberRole}>
              Desenvolvimento
            </Text>
          </View>

        </View>

        {/* Orientadoras */}
        <Text style={styles.subsectionTitle}>
          Orientadoras
        </Text>

        <View style={styles.teamRow}>

          {/* Paula */}
          <View style={styles.member}>
            <Image
              source={require('../../assets/images/equipe/sabido.jpg')}
              style={styles.avatar}
            />

            <Text style={styles.memberName}>
              Paula Cristina Stopa
            </Text>

            <Text style={styles.memberRole}>
              Orientadora
            </Text>
          </View>

          {/* Lauriana */}
          <View style={styles.member}>
            <Image
              source={require('../../assets/images/equipe/sabido.jpg')}
              style={styles.avatar}
            />

            <Text style={styles.memberName}>
              Lauriana Paludo
            </Text>

            <Text style={styles.memberRole}>
              Coorientadora
            </Text>
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
            color="#836F68"
          />

          <Text style={styles.instagram}>
            @paed.tcc
          </Text>
        </View>

        {/* Versão */}
        <Text style={styles.version}>
          PAED v1.0.0
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ---------------------------------------------------------
  // CABEÇALHO
  // ---------------------------------------------------------

  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E2D5',
    backgroundColor: colors.background,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },

  headerSpacer: {
    width: 42,
  },

  // ---------------------------------------------------------
  // CONTEÚDO
  // ---------------------------------------------------------

  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 10,
    paddingBottom: 30,
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

  // ---------------------------------------------------------
  // CARDS
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // EQUIPE
  // ---------------------------------------------------------

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
    marginBottom: 8,
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

  // ---------------------------------------------------------
  // INSTITUIÇÃO
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // INSTAGRAM
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // VERSÃO
  // ---------------------------------------------------------

  version: {
    color: colors.text,
    fontSize: 13,
    marginBottom: 5,
  },
});