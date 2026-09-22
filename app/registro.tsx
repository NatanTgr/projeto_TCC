import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from '../style';

export default function RegisterScreen() {
  const router = useRouter();

  const handleRegister = () => {
    //router.replace('/trocar');
  };

  return (
    <View style={styles.registerContainer}>
      <Text style={styles.registerTitle}>Criar Conta</Text>

      <Button title="Cadastrar e Entrar" onPress={handleRegister} />

      <View style={styles.registerSpacer} />

      <Button
        title="Já tenho conta (Voltar)"
        color="#666"
        onPress={() => router.back()}
      />
    </View>
  );
}
