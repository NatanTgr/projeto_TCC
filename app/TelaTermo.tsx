import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { colors } from "../style";

const VERSAO_TERMO = "1.0";

export default function TermoAutorizacao() {
  const [aceitou, setAceitou] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const { width, height, fontScale } = useWindowDimensions();

  const telaCompacta = width < 360 || height < 700;
  const telaBaixa = height < 500;

  const aceitarTermo = async () => {
    if (carregando) return;

    if (!aceitou) {
      Alert.alert(
        "Aceite necessário",
        "Marque a opção indicando que você leu e concorda com o termo para continuar."
      );
      return;
    }

    try {
      setCarregando(true);

      await AsyncStorage.setItem(
        "@paed/termo_autorizacao",
        JSON.stringify({
          aceito: true,
          versao: VERSAO_TERMO,
        })
      );

      router.replace("/welcome");
    } catch (error) {
      console.error("Erro ao salvar aceite:", error);

      Alert.alert(
        "Erro",
        "Não foi possível salvar sua autorização. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.areaCentral}>
        <View
          style={[
            styles.header,
            telaCompacta && styles.headerCompacto,
          ]}
        >
          {!telaBaixa && (
            <View
              style={[
                styles.logoContainer,
                telaCompacta && styles.logoCompacto,
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={telaCompacta ? 32 : 42}
                color={colors.purple}
              />
            </View>
          )}

          <Text
            style={[
              styles.titulo,
              telaCompacta && styles.tituloCompacto,
            ]}
          >
            Termo de autorização
          </Text>

          {!telaBaixa && (
            <Text style={styles.subtitulo}>
              Antes de utilizar o PAED, leia as informações abaixo.
            </Text>
          )}
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.conteudo,
            telaCompacta && styles.conteudoCompacto,
          ]}
          showsVerticalScrollIndicator
        >
          <View
            style={[
              styles.card,
              telaCompacta && styles.cardCompacto,
            ]}
          >
            <Text style={styles.tituloSecao}>
              Uso de dados e participação
            </Text>

            <Text style={styles.texto}>
              O PAED — Plataforma de Apoio Educacional é um projeto
              desenvolvido com o objetivo de apoiar a organização da
              rotina escolar e a comunicação pedagógica de estudantes.
            </Text>

            <Text style={styles.texto}>
              Para o desenvolvimento e avaliação do aplicativo,
              algumas informações fornecidas pelos usuários poderão
              ser utilizadas.
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
              • contribuir para relatórios, documentação e avaliação
              acadêmica do projeto.
            </Text>

            <Text style={styles.tituloSecao}>
              Quais informações podem ser utilizadas?
            </Text>

            <Text style={styles.texto}>
              Poderão ser utilizadas informações fornecidas durante o
              cadastro, informações acadêmicas necessárias ao
              funcionamento do aplicativo e respostas ou opiniões
              fornecidas durante atividades de avaliação do projeto.
            </Text>

            <Text style={styles.tituloSecao}>
              Como os dados serão apresentados?
            </Text>

            <Text style={styles.texto}>
              Quando utilizados em trabalhos acadêmicos, apresentações
              ou relatórios, os dados serão apresentados, sempre que
              possível, de forma que não permita a identificação
              individual do participante.
            </Text>

            <Text style={styles.tituloSecao}>
              Participação voluntária
            </Text>

            <Text style={styles.texto}>
              A participação em formulários, avaliações e testes
              relacionados ao projeto é voluntária. O usuário poderá
              optar por não participar dessas atividades.
            </Text>

            <View style={styles.aviso}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={colors.purple}
              />

              <Text style={styles.avisoTexto}>
                Leia atentamente este termo antes de continuar
                utilizando o aplicativo.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.rodape,
            telaCompacta && styles.rodapeCompacto,
          ]}
        >
          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel="Li e concordo com o Termo de Autorização para Uso de Dados."
            accessibilityState={{
              checked: aceitou,
              disabled: carregando,
            }}
            disabled={carregando}
            style={({ pressed }) => [
              styles.checkboxContainer,
              pressed && styles.pressionado,
            ]}
            onPress={() => setAceitou((valorAtual) => !valorAtual)}
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
                  color={colors.white}
                />
              )}
            </View>

            <Text style={styles.checkboxTexto}>
              Li e concordo com o Termo de Autorização para Uso de Dados.
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityState={{
              disabled: !aceitou || carregando,
              busy: carregando,
            }}
            style={({ pressed }) => [
              styles.botao,
              (!aceitou || carregando) && styles.botaoDesativado,
              pressed && styles.pressionado,
            ]}
            onPress={aceitarTermo}
            disabled={!aceitou || carregando}
          >
            <Text style={styles.botaoTexto}>
              {carregando ? "Salvando..." : "Aceitar e continuar"}
            </Text>

            {!carregando && fontScale < 1.5 && (
              <Ionicons
                name="arrow-forward"
                size={21}
                color={colors.white}
              />
            )}
          </Pressable>

          <Text style={styles.versao}>
            Termo versão {VERSAO_TERMO}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  areaCentral: {
    flex: 1,
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    minHeight: 0,
  },

  header: {
    flexShrink: 0,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },

  headerCompacto: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },

  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#EFE7F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  logoCompacto: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginBottom: 8,
  },

  titulo: {
    width: "100%",
    fontSize: 25,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },

  tituloCompacto: {
    fontSize: 22,
  },

  subtitulo: {
    width: "100%",
    fontSize: 15,
    color: colors.text,
    opacity: 0.75,
    textAlign: "center",
    marginTop: 6,
  },

  scroll: {
    flex: 1,
    minHeight: 0,
  },

  conteudo: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  conteudoCompacto: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  card: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardCompacto: {
    padding: 14,
  },

  tituloSecao: {
    fontSize: 18,
    fontWeight: "700",
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
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    backgroundColor: "#F3EDF8",
    borderRadius: 12,
    padding: 13,
    marginTop: 12,
  },

  avisoTexto: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: colors.text,
  },

  rodape: {
    flexShrink: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  rodapeCompacto: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
  },

  checkboxContainer: {
    width: "100%",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 8,
    marginBottom: 8,
  },

  checkbox: {
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.purple,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxSelecionado: {
    backgroundColor: colors.purple,
  },

  checkboxTexto: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    color: colors.text,
  },

  botao: {
    width: "100%",
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: colors.purple,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  botaoDesativado: {
    opacity: 0.45,
  },

  botaoTexto: {
    flexShrink: 1,
    minWidth: 0,
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  pressionado: {
    opacity: 0.8,
  },

  versao: {
    textAlign: "center",
    fontSize: 11,
    color: colors.text,
    opacity: 0.5,
    marginTop: 8,
  },
});