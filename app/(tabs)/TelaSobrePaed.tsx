import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../../context/ThemeContext";
import { useFontSize } from "../../context/FontSizeContext";
import criarEstilos from "../../Estilos/TelaSobrePaedEstilo";
import AvatarImagem from "../../components/AvatarImagem";

type CaracteristicasAvatar = {
  nome: string;
  cabelo: string;
  corCabelo: string;
  corPele: string;
  corRoupa: string;
  oculos?: string;
  corOculos?: string;
};

function criarAvatarEquipe({
  nome,
  cabelo,
  corCabelo,
  corPele,
  corRoupa,
  oculos,
  corOculos = "262e33",
}: CaracteristicasAvatar) {
  const parametros = new URLSearchParams({
    seed: `paed-equipe-${nome}-v1`,

    topVariant: cabelo,
    topProbability: "100",
    hairColor: corCabelo,
    skinColor: corPele,

    clothesVariant: "shirtCrewNeck",
    clothesColor: corRoupa,

    eyesVariant: "default",
    eyebrowsVariant: "default",
    mouthVariant: "smile",

    facialHairProbability: "0",

    accessoriesProbability: oculos ? "100" : "0",
    accessoriesVariant: oculos ?? "round",
    accessoriesColor: corOculos,
  });

  return `https://api.dicebear.com/10.x/avataaars/svg?${parametros.toString()}`;
}

const AVATARES_EQUIPE = {
  maria: criarAvatarEquipe({
    nome: "maria",
    cabelo: "curvy",
    corCabelo: "2c1b18",
    corPele: "ffdbb4",
    corRoupa: "c43c3c",
  }),

  natan: criarAvatarEquipe({
    nome: "natan",
    cabelo: "shortCurly",
    corCabelo: "2c1b18",
    corPele: "d08b5b",
    corRoupa: "88c688",
  }),

  joao: criarAvatarEquipe({
    nome: "joao",
    cabelo: "dreads01",
    corCabelo: "2c1b18",
    corPele: "925c3e",
    corRoupa: "25557c",
  }),

  paula: criarAvatarEquipe({
    nome: "paula",
    cabelo: "bob",
    corCabelo: "2c1b18",
    corPele: "ffdbb4",
    corRoupa: "ffafb9",
    oculos: "round",
    corOculos: "71797e",
  }),

  lauriana: criarAvatarEquipe({
    nome: "lauriana",
    cabelo: "straight01",
    corCabelo: "c99b53",
    corPele: "ffdbb4",
    corRoupa: "929598",
    oculos: "prescription02",
    corOculos: "262e33",
  }),
};

export default function TelaSobrePaed() {
  const { tema } = useTheme();
  const { escalaFonte } = useFontSize();
  const { width } = useWindowDimensions();

  const styles = criarEstilos(tema, escalaFonte, width);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.replace("/(tabs)/TelaConfig")}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Voltar para configurações"
        >
          <Ionicons name="arrow-back" size={27} color={tema.text} />
        </Pressable>

        <Text style={styles.headerTitle}>Sobre o PAED</Text>

        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Image
          source={require("../../assets/images/logo_PAED.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Sobre o projeto */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nosso projeto</Text>

          <Text style={styles.text}>
            O PAED é um aplicativo desenvolvido no IFPR – Campus Pinhais, criado
            com o objetivo de auxiliar estudantes com TEA na organização de suas
            atividades acadêmicas e na comunicação com professores e tutores.
          </Text>

          <Text style={styles.text}>
            O aplicativo reúne recursos para facilitar a organização das
            tarefas, calendário e comunicação, buscando oferecer uma experiência
            simples, acessível e acolhedora.
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
        <Text style={styles.sectionTitle}>Quem faz o PAED</Text>

        <Text style={styles.subsectionTitle}>Desenvolvimento</Text>

        <View style={styles.teamRow}>
          {/* Maria */}
          <View style={styles.member}>
            <View
              style={styles.avatar}
              accessible
              accessibilityLabel="Avatar de Maria"
            >
              <AvatarImagem uri={AVATARES_EQUIPE.maria} tamanho={90} />
            </View>

            <Text style={styles.memberName}>Maria</Text>
          </View>

          {/* Natan */}
          <View style={styles.member}>
            <View
              style={styles.avatar}
              accessible
              accessibilityLabel="Avatar de Natan"
            >
              <AvatarImagem uri={AVATARES_EQUIPE.natan} tamanho={90} />
            </View>

            <Text style={styles.memberName}>Natan</Text>
          </View>

          {/* João */}
          <View style={styles.member}>
            <View
              style={styles.avatar}
              accessible
              accessibilityLabel="Avatar de João"
            >
              <AvatarImagem uri={AVATARES_EQUIPE.joao} tamanho={90} />
            </View>

            <Text style={styles.memberName}>João</Text>
          </View>
        </View>

        {/* Orientadoras */}
        <Text style={styles.subsectionTitle}>Orientadoras</Text>

        <View style={styles.teamRow}>
          {/* Paula */}
          <View style={styles.member}>
            <View
              style={styles.avatar}
              accessible
              accessibilityLabel="Avatar de Paula Cristina Stopa"
            >
              <AvatarImagem uri={AVATARES_EQUIPE.paula} tamanho={90} />
            </View>

            <Text style={styles.memberName}>Paula Cristina Stopa</Text>

            <Text style={styles.memberRole}>Orientadora</Text>
          </View>

          {/* Lauriana */}
          <View style={styles.member}>
            <View
              style={styles.avatar}
              accessible
              accessibilityLabel="Avatar de Lauriana Paludo"
            >
              <AvatarImagem uri={AVATARES_EQUIPE.lauriana} tamanho={90} />
            </View>

            <Text style={styles.memberName}>Lauriana Paludo</Text>

            <Text style={styles.memberRole}>Coorientadora</Text>
          </View>
        </View>

        {/* Instituição */}
        <View style={styles.institutionCard}>
          <Text style={styles.institutionTitle}>IFPR Campus Pinhais</Text>

          <Text style={styles.institutionText}>TCC Técnico em Informática</Text>
        </View>

        {/* Instagram */}
        <View style={styles.instagramContainer}>
          <FontAwesome name="instagram" size={22} color={tema.text} />

          <Text style={styles.instagram}>@paed.tcc</Text>
        </View>

        {/* Versão */}
        <Text style={styles.version}>PAED v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}