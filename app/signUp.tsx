import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { styles, colors } from '../style';

// Função utilitária para converter mensagens de erro do Supabase para Português
const traduzirErroSupabase = (mensagem: string) => {
  if (mensagem.includes('User already registered')) {
    return 'Este e-mail já está cadastrado no sistema.';
  }
  if (mensagem.includes('Password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (mensagem.includes('Invalid email')) {
    return 'Por favor, insira um endereço de e-mail válido.';
  }
  if (mensagem.includes('Signup requires a valid password')) {
    return 'Informe uma senha válida.';
  }
  return mensagem;
};

export default function SignUp() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [campus, setCampus] = useState('');
  const [curso, setCurso] = useState('');
  const [turno, setTurno] = useState('');
  const [turma, setTurma] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [areaAtuacao, setAreaAtuacao] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedRole = role || 'Estudante';

  const getTipoUsuario = () => {
    const tipo = selectedRole.toLowerCase();

    if (tipo.includes('aluno') || tipo.includes('estudante')) {
      return 'estudante';
    }

    if (tipo.includes('professor')) {
      return 'professor';
    }

    if (tipo.includes('tutor')) {
      return 'tutor';
    }

    return 'estudante';
  };

  const tipoUsuario = getTipoUsuario();

  const handleSignUp = async () => {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !campus.trim()
    ) {
      Alert.alert(
        'Atenção',
        'Preencha nome, email, senha e campus.'
      );
      return;
    }

    if (
      tipoUsuario === 'estudante' &&
      (!curso.trim() || !turno.trim() || !turma.trim())
    ) {
      Alert.alert(
        'Atenção',
        'Preencha curso, turno e turma.'
      );
      return;
    }

    if (tipoUsuario === 'tutor' && !departamento.trim()) {
      Alert.alert(
        'Atenção',
        'Preencha o departamento do tutor.'
      );
      return;
    }

    if (tipoUsuario === 'professor' && !areaAtuacao.trim()) {
      Alert.alert(
        'Atenção',
        'Preencha a área de atuação do professor.'
      );
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              campus: campus.trim(),
              role: tipoUsuario,
            },
          },
        });

      if (authError) {
        Alert.alert(
          'Erro ao cadastrar',
          traduzirErroSupabase(authError.message)
        );
        return;
      }

      const userId = authData.user?.id;

      if (!userId) {
        Alert.alert(
          'Erro',
          'Não foi possível obter o ID do usuário.'
        );
        return;
      }

      const { error: usuarioError } = await supabase
        .from('usuarios')
        .insert({
          id: userId,
          nome: fullName.trim(),
          email: email.trim(),
          campus: campus.trim(),
          tipo: tipoUsuario,
        });

      if (usuarioError) {
        Alert.alert(
          'Erro ao criar perfil',
          traduzirErroSupabase(usuarioError.message)
        );
        return;
      }

      if (tipoUsuario === 'estudante') {
        const { error: alunoError } = await supabase
          .from('alunos')
          .insert({
            id: userId,
            curso: curso.trim(),
            turno: turno.trim(),
            turma: turma.trim(),
          });

        if (alunoError) {
          Alert.alert(
            'Erro ao criar aluno',
            traduzirErroSupabase(alunoError.message)
          );
          return;
        }
      }

      if (tipoUsuario === 'tutor') {
        const { error: tutorError } = await supabase
          .from('tutores')
          .insert({
            id: userId,
            departamento: departamento.trim(),
          });

        if (tutorError) {
          Alert.alert(
            'Erro ao criar tutor',
            traduzirErroSupabase(tutorError.message)
          );
          return;
        }
      }

      if (tipoUsuario === 'professor') {
        const { error: professorError } = await supabase
          .from('professores')
          .insert({
            id: userId,
            area_atuacao: areaAtuacao.trim(),
          });

        if (professorError) {
          Alert.alert(
            'Erro ao criar professor',
            traduzirErroSupabase(professorError.message)
          );
          return;
        }
      }

      Alert.alert(
        'Cadastro realizado!',
        'Sua conta foi criada com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Erro',
        'Ocorreu um erro inesperado ao realizar o cadastro.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo_PAED.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.signUpCardTitle}>
              Criar conta - {selectedRole}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome completo"
                placeholderTextColor={colors.placeholder}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Campus</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex.: Curitiba, Pinhais..."
                placeholderTextColor={colors.placeholder}
                value={campus}
                onChangeText={setCampus}
              />
            </View>

            {tipoUsuario === 'estudante' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Curso</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex.: Informática"
                    placeholderTextColor={colors.placeholder}
                    value={curso}
                    onChangeText={setCurso}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Turno</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex.: Manhã, Tarde ou Noite"
                    placeholderTextColor={colors.placeholder}
                    value={turno}
                    onChangeText={setTurno}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Turma</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex.: 3ºA"
                    placeholderTextColor={colors.placeholder}
                    value={turma}
                    onChangeText={setTurma}
                  />
                </View>
              </>
            )}

            {tipoUsuario === 'tutor' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Departamento</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex.: NAPNE, Seção Pedagógica..."
                  placeholderTextColor={colors.placeholder}
                  value={departamento}
                  onChangeText={setDepartamento}
                />
              </View>
            )}

            {tipoUsuario === 'professor' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Área de atuação</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex.: Letras, Informática..."
                  placeholderTextColor={colors.placeholder}
                  value={areaAtuacao}
                  onChangeText={setAreaAtuacao}
                />
              </View>
            )}

            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => router.back()}
                disabled={loading}
              >
                <Text style={styles.backButtonText}>Voltar</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>
                    Criar conta
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}