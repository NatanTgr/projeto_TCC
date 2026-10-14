
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { colors } from '../style';

const VERSAO_TERMO = '1.0';

export default function TermoAutorizacao() {
  const [aceitou, setAceitou] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const aceitarTermo = async () => {
    if (!aceitou) {
      Alert.alert(
        'Aceite necessário',
        'Marque a opção indicando que você leu e concorda com o termo para continuar.'
      );
      return;
    }

    try {
      setCarregando(true);

      // Guarda localmente que este dispositivo já passou pelo termo.
      await AsyncStorage.setItem(
        '@paed/termo_autorizacao',
        JSON.stringify({
          aceito: true,
          versao: VERSAO_TERMO,
        })
      );

      // Depois do aceite, segue para a tela inicial/login.
      router.replace('/welcome');
    } catch (error) {
      console.error('Erro ao salvar aceite:', error);

      Alert.alert(
        'Erro',
        'Não foi possível salvar sua autorização. Tente novamente.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons
            name="shield-checkmark-outline"
            size={42}
            color={colors.purple}
          />
        </View>

        <Text style={styles.titulo}>Termo de autorização</Text>

        <Text style={styles.subtitulo}>
          Antes de utilizar o PAED, leia as informações abaixo.
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.tituloSecao}>
            Uso de dados e participação
          </Text>

          <Text style={styles.texto}>
            O PAED — Plataforma de Apoio Educacional é um projeto desenvolvido
            com o objetivo de apoiar a organização da rotina escolar e a
            comunicação pedagógica de estudantes.
          </Text>

          <Text style={styles.texto}>
            Para o desenvolvimento e avaliação do aplicativo, algumas
            informações fornecidas pelos usuários poderão ser utilizadas.
          </Text>

          <Text style={styles.tituloSecao}>
            Para que os dados serão utilizados?
          </Text>

          <Text style={styles.texto}>
            As informações poderão ser utilizadas para:
          </Text>

          <Text style={styles.item}>
            • desenvolver e aprimorar o aplicativo;
          </Text>

          <Text style={styles.item}>
            • avaliar a facilidade de uso e a acessibilidade das telas;
          </Text>

          <Text style={styles.item}>
            • identificar dificuldades encontradas durante a utilização;
          </Text>

          <Text style={styles.item}>
            • analisar opiniões, sugestões e respostas fornecidas;
          </Text>

          <Text style={styles.item}>
            • contribuir para relatórios, documentação e avaliação acadêmica
            do projeto.
          </Text>

          <Text style={styles.tituloSecao}>
            Quais informações podem ser utilizadas?
          </Text>

          <Text style={styles.texto}>
            Poderão ser utilizadas informações fornecidas durante o cadastro,
            informações acadêmicas necessárias ao funcionamento do aplicativo
            e respostas ou opiniões fornecidas durante atividades de avaliação
            do projeto.
          </Text>

          <Text style={styles.tituloSecao}>
            Como os dados serão apresentados?
          </Text>

          <Text style={styles.texto}>
            Quando utilizados em trabalhos acadêmicos, apresentações ou
            relatórios, os dados serão apresentados, sempre que possível, de
            forma que não permita a identificação individual do participante.
          </Text>

          <Text style={styles.tituloSecao}>
            Participação voluntária
          </Text>

          <Text style={styles.texto}>
            A participação em formulários, avaliações e testes relacionados ao
            projeto é voluntária. O usuário poderá optar por não participar
            dessas atividades.
          </Text>

          <View style={styles.aviso}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={colors.purple}
            />

            <Text style={styles.avisoTexto}>
              Leia atentamente este termo antes de continuar utilizando o
              aplicativo.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.rodape}>
        <Pressable
          style={styles.checkboxContainer}
          onPress={() => setAceitou(!aceitou)}
        >
          <View
            style={[
              styles.checkbox,
              aceitou && styles.checkboxSelecionado,
            ]}
          >
            {aceitou && (
              <Ionicons
                name="checkmark"
                size={18}
                color="#FFFFFF"
              />
            )}
          </View>

          <Text style={styles.checkboxTexto}>
            Li e concordo com o Termo de Autorização para Uso de Dados.
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.botao,
            (!aceitou || carregando) && styles.botaoDesativado,
          ]}
          onPress={aceitarTermo}
          disabled={!aceitou || carregando}
        >
          <Text style={styles.botaoTexto}>
            {carregando ? 'Salvando...' : 'Aceitar e continuar'}
          </Text>

          {!carregando && (
            <Ionicons
              name="arrow-forward"
              size={21}
              color="#FFFFFF"
            />
          )}
        </Pressable>

        <Text style={styles.versao}>
          Termo versão {VERSAO_TERMO}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
  },

  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFE7F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  titulo: {
    fontSize: 25,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },

  subtitulo: {
    fontSize: 15,
    color: colors.text,
    opacity: 0.75,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 21,
  },

  scroll: {
    flex: 1,
  },

  conteudo: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  tituloSecao: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
    marginBottom: 10,
  },

  texto: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 23,
    marginBottom: 12,
  },

  item: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 23,
    marginBottom: 7,
    paddingLeft: 4,
  },

  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EDF8',
    borderRadius: 12,
    padding: 13,
    marginTop: 12,
  },

  avisoTexto: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 9,
  },

  rodape: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  checkboxSelecionado: {
    backgroundColor: colors.purple,
  },

  checkboxTexto: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },

  botao: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.purple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  botaoDesativado: {
    opacity: 0.45,
  },

  botaoTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  versao: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.text,
    opacity: 0.5,
    marginTop: 8,
  },
});