import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { styles, colors } from "../style";

const PERFIS = [
  {
    role: "Estudante",
    titulo: "Estudante",
    descricao: "Organize suas tarefas",
    icone: "school",
    cor: colors.student,
  },
  {
    role: "Professor",
    titulo: "Professor(a)",
    descricao: "Gerencie alunos",
    icone: "person",
    cor: colors.professor,
  },
  {
    role: "Tutor",
    titulo: "Tutor(a)",
    descricao: "Apoie alunos",
    icone: "people",
    cor: colors.tutor,
  },
  {
    role: "NAPNE",
    titulo: "NAPNE",
    descricao: "Apoie a inclusão dos alunos",
    icone: "heart",
    cor: colors.purple,
  },
] satisfies {
  role: string;
  titulo: string;
  descricao: string;
  icone: React.ComponentProps<typeof Ionicons>["name"];
  cor: string;
}[];

export default function Welcome() {
  const router = useRouter();
  const { width, height, fontScale } = useWindowDimensions();

  const telaCompacta = width < 360 || height < 700;
  const telaBaixa = height < 500;
  const cartaoEmColuna = width < 320 || fontScale >= 1.5;

  const handleSelectRole = (role: string) => {
    router.push({
      pathname: "/signUp",
      params: { role },
    });
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.welcomeLayout}>
        <View
          style={[
            styles.welcomeHeader,
            telaCompacta && styles.welcomeHeaderCompact,
          ]}
        >
          <Image
            source={require("../assets/images/logo_PAED.png")}
            style={[
              styles.welcomeLogoResponsive,
              telaCompacta && styles.welcomeLogoCompact,
              telaBaixa && styles.welcomeLogoLandscape,
            ]}
            resizeMode="contain"
            accessible
            accessibilityLabel="PAED"
          />

          <Text style={[styles.title, styles.welcomeTitleResponsive]}>
            Como você vai usar o PAED?
          </Text>
        </View>

        <ScrollView
          style={styles.welcomeCardsScroll}
          contentContainerStyle={[
            styles.welcomeCardsContent,
            telaCompacta && styles.welcomeCardsContentCompact,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardsContainer}>
            {PERFIS.map((perfil) => (
              <Pressable
                key={perfil.role}
                accessibilityRole="button"
                accessibilityLabel={`${perfil.titulo}. ${perfil.descricao}`}
                onPress={() => handleSelectRole(perfil.role)}
                style={({ pressed }) => [
                  styles.welcomeCard,
                  styles.welcomeCardResponsive,
                  telaCompacta && styles.welcomeCardCompact,
                  cartaoEmColuna && styles.welcomeCardColumn,
                  pressed && styles.cardPressed,
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    styles.welcomeIconResponsive,
                    { backgroundColor: perfil.cor },
                    cartaoEmColuna && styles.welcomeIconColumn,
                  ]}
                >
                  <Ionicons
                    name={perfil.icone}
                    size={28}
                    color={colors.white}
                  />
                </View>

                <View
                  style={[
                    styles.cardTextContainer,
                    styles.welcomeTextResponsive,
                    cartaoEmColuna && styles.welcomeTextColumn,
                  ]}
                >
                  <Text
                    style={[
                      styles.welcomeCardTitle,
                      cartaoEmColuna && styles.welcomeTextCentered,
                    ]}
                  >
                    {perfil.titulo}
                  </Text>

                  <Text
                    style={[
                      styles.cardSubtitle,
                      cartaoEmColuna && styles.welcomeTextCentered,
                    ]}
                  >
                    {perfil.descricao}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <View
          style={[
            styles.welcomeFooterFixed,
            telaCompacta && styles.welcomeFooterCompact,
          ]}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/login")}
            style={({ pressed }) => [
              styles.welcomeLoginButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.loginLink, styles.welcomeTextCentered]}>
              Já tem uma conta? Entre aqui
            </Text>
          </Pressable>
          <Pressable onPress={() => router.push("/registro")} style={({ pressed }) => [pressed && styles.buttonPressed]}>
  <Text>Abrir recuperação de senha</Text>
</Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}