import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function TelaCalendarioTemporaria() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="calendar-outline" size={64} color="#94C0DF" />
        <Text style={styles.title}>Calendário</Text>
        <Text style={styles.subtitle}>Em breve, o calendário completo estará aqui!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDD0',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5C4E42',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#8A7A68',
    textAlign: 'center',
    marginTop: 6,
  },
});