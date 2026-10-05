import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";
import { useFontSize } from "../context/FontSizeContext";

import AvatarImagem from "./AvatarImagem";
import { AVATARES, buscarAvatar } from "./avatares";

type Props = {
  visivel: boolean;
  avatarAtual: string | null;
  aoFechar: () => void;
  aoSalvar: (url: string | null) => Promise<void>;
};

const SEM_AVATAR = "nenhum-avatar";

export default function SeletorAvatar({
  visivel,
  avatarAtual,
  aoFechar,
  aoSalvar,
}: Props) {
  const { tema } = useTheme();
  const { escalaFonte } = useFontSize();
  const { width, fontScale } = useWindowDimensions();

  const [larguraGrade, setLarguraGrade] = useState(0);
  const [avatarSelecionado, setAvatarSelecionado] =
    useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const salvamentoBloqueado = useRef(false);
  const espacoEntreAvatares = 8;

  const larguraDisponivel =
    larguraGrade || Math.max(1, Math.min(width * 0.92, 540) - 36);

  const larguraDesejada = Math.max(
    96,
    96 * escalaFonte * fontScale,
  );

  const quantidadeColunas = Math.max(
    1,
    Math.min(
      4,
      Math.floor(
        (larguraDisponivel + espacoEntreAvatares) /
          (larguraDesejada + espacoEntreAvatares),
      ),
    ),
  );

  const larguraOpcao = Math.floor(
    (larguraDisponivel -
      espacoEntreAvatares * (quantidadeColunas - 1)) /
      quantidadeColunas,
  );

  const escolhido = AVATARES.find(
    (avatar) => avatar.id === avatarSelecionado,
  );

  const nenhumAvatarSelecionado =
    avatarSelecionado === SEM_AVATAR;

  const podeSalvar =
    (nenhumAvatarSelecionado || Boolean(escolhido)) && !salvando;

  useEffect(() => {
    if (visivel) {
      if (!avatarAtual) {
        setAvatarSelecionado(SEM_AVATAR);
      } else {
        const avatarSalvo = buscarAvatar(avatarAtual);
        setAvatarSelecionado(avatarSalvo?.id ?? null);
      }
    }
  }, [visivel, avatarAtual]);

  function fecharModal() {
    if (!salvamentoBloqueado.current) {
      aoFechar();
    }
  }

  async function salvarAvatar() {
    if (
      salvamentoBloqueado.current ||
      (!nenhumAvatarSelecionado && !escolhido)
    ) {
      return;
    }

    const url = nenhumAvatarSelecionado
      ? null
      : escolhido!.url;

    salvamentoBloqueado.current = true;
    setSalvando(true);

    try {
      await aoSalvar(url);
      aoFechar();
    } catch (erro) {
      console.log("Erro ao salvar avatar:", erro);

      Alert.alert(
        "Não foi possível salvar",
        "Verifique sua conexão e tente novamente.",
      );
    } finally {
      salvamentoBloqueado.current = false;
      setSalvando(false);
    }
  }

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      onRequestClose={fecharModal}
    >
      <View style={estilos.fundo}>
        <View
          accessibilityViewIsModal
          style={[estilos.modal, { backgroundColor: tema.modal }]}
        >
          <ScrollView
            style={{ flexGrow: 0 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={estilos.conteudo}
          >
            <Text
              accessibilityRole="header"
              style={{
                color: tema.text,
                fontSize: 22 * escalaFonte,
                fontWeight: "bold",
              }}
            >
              Escolha seu avatar
            </Text>

            <Text
              style={{
                color: tema.text,
                fontSize: 14 * escalaFonte,
              }}
            >
              Escolha uma das {AVATARES.length} opções ou fique sem avatar.
            </Text>

            {(escolhido || nenhumAvatarSelecionado) && (
              <View style={estilos.previa}>
                {nenhumAvatarSelecionado ? (
                  <View
                    style={[
                      estilos.semAvatar,
                      {
                        width: 104,
                        height: 104,
                        borderRadius: 52,
                        backgroundColor: tema.card,
                      },
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={52}
                      color={tema.text}
                    />
                  </View>
                ) : (
                  <AvatarImagem uri={escolhido!.url} tamanho={104} />
                )}

                <Text
                  accessibilityLiveRegion="polite"
                  style={{
                    color: tema.text,
                    fontSize: 14 * escalaFonte,
                    textAlign: "center",
                  }}
                >
                  {nenhumAvatarSelecionado
                    ? "Nenhum avatar"
                    : escolhido!.nome.replace(/^Avatar\s*/i, "")}
                </Text>
              </View>
            )}

            <View
              style={estilos.grade}
              onLayout={({ nativeEvent }) => {
                setLarguraGrade(nativeEvent.layout.width);
              }}
            >
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Nenhum avatar"
                accessibilityState={{
                  selected: nenhumAvatarSelecionado,
                  disabled: salvando,
                }}
                disabled={salvando}
                onPress={() => {
                  setAvatarSelecionado(SEM_AVATAR);
                }}
                style={[
                  estilos.opcao,
                  {
                    width: larguraOpcao,
                    backgroundColor: tema.card,
                    borderColor: nenhumAvatarSelecionado
                      ? "#4CAF50"
                      : tema.border,
                  },
                ]}
              >
                <View
                  style={[
                    estilos.semAvatar,
                    {
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                    },
                  ]}
                >
                  <Ionicons name="person-outline" size={36} color={tema.text} />
                </View>

                <View style={estilos.nomeAvatar}>
                  <Text
                    style={{
                      color: tema.text,
                      fontSize: 12 * escalaFonte,
                      fontWeight: nenhumAvatarSelecionado ? "bold" : "normal",
                      textAlign: "center",
                    }}
                  >
                    {nenhumAvatarSelecionado ? "✓ " : ""}
                    Nenhum avatar
                  </Text>
                </View>
              </TouchableOpacity>

              {AVATARES.map((avatar) => {
                const selecionado = avatar.id === avatarSelecionado;

                return (
                  <TouchableOpacity
                    key={avatar.id}
                    accessibilityRole="button"
                    accessibilityLabel={avatar.nome}
                    accessibilityState={{
                      selected: selecionado,
                      disabled: salvando,
                    }}
                    disabled={salvando}
                    onPress={() => {
                      setAvatarSelecionado(avatar.id);
                    }}
                    style={[
                      estilos.opcao,
                      {
                        width: larguraOpcao,
                        backgroundColor: tema.card,
                        borderColor: selecionado ? "#4CAF50" : tema.border,
                      },
                    ]}
                  >
                    <AvatarImagem uri={avatar.url} tamanho={64} />

                    <View style={estilos.nomeAvatar}>
                      <Text
                        style={{
                          color: tema.text,
                          fontSize: 12 * escalaFonte,
                          fontWeight: selecionado ? "bold" : "normal",
                          textAlign: "center",
                        }}
                      >
                        {selecionado ? "✓ " : ""}
                        {avatar.nome.replace(/^Avatar\s*/i, "")}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text
              style={{
                color: tema.text,
                fontSize: 12 * escalaFonte,
                textAlign: "center",
              }}
            >
              Avatares gerados por DiceBear
            </Text>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{
                disabled: !podeSalvar,
                busy: salvando,
              }}
              disabled={!podeSalvar}
              onPress={salvarAvatar}
              style={[estilos.botaoSalvar, { opacity: podeSalvar ? 1 : 0.5 }]}
            >
              {salvando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 16 * escalaFonte,
                    textAlign: "center",
                  }}
                >
                  Salvar avatar
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ disabled: salvando }}
              disabled={salvando}
              onPress={fecharModal}
              style={estilos.botaoCancelar}
            >
              <Text
                style={{
                  color: tema.text,
                  fontSize: 16 * escalaFonte,
                  textAlign: "center",
                }}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },

  modal: {
    width: "92%",
    maxWidth: 540,
    maxHeight: "85%",
    borderRadius: 18,
    overflow: "hidden",
    flexShrink: 1,
  },

  conteudo: {
    padding: 18,
    gap: 16,
  },

  previa: {
    alignItems: "center",
    gap: 8,
  },

  semAvatar: {
    alignItems: "center",
    justifyContent: "center",
  },

  grade: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "stretch",
    gap: 8,
  },

  opcao: {
    borderWidth: 2,
    borderRadius: 12,
    paddingTop: 8,
    alignItems: "center",
  },

  nomeAvatar: {
    width: "100%",
    minHeight: 48,
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoSalvar: {
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    padding: 14,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  botaoCancelar: {
    padding: 14,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
});