import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      <Image
        source={require('../assets/images/logo_PAED.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.content}>
        <Text style={styles.title}>Quem somos?</Text>

        <Text style={styles.text}>
          Somos um projeto desenvolvido no IFPR – Campus Pinhais,
          criado com o objetivo de auxiliar estudantes com TEA na
          organização de suas atividades acadêmicas e na comunicação
          com professores e tutores.
        </Text>

        <Text style={styles.text}>
          O aplicativo reúne recursos para facilitar a organização
          das tarefas, calendário e comunicação, buscando oferecer
          uma experiência simples, acessível e acolhedora.
        </Text>
      </View>

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },

  logo: {
  width: 350,
  height: 180,
  marginTop: 20,
  marginBottom: -20,
},

content: {
  width: '100%',
  alignItems: 'center',
  flex: 1,
  justifyContent: 'flex-start',
  paddingTop: 5,
},

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 25,
    textAlign: 'left',
    width: '100%',
  },

  text: {
  fontSize: 17,
  lineHeight: 27,
  color: colors.text,
  textAlign: 'justify',
  marginBottom: 20,
},

  button: {
    width: '100%',
    backgroundColor: '#FFAA56',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});