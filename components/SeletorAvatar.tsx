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
} from "react-native";

import { useTheme } from "../context/ThemeContext";
import { useFontSize } from "../context/FontSizeContext";

import AvatarImagem from "./AvatarImagem";
import { AVATARES, buscarAvatar } from "./avatares";

type Props = {
  visivel: boolean;
  avatarAtual: string | null;
  aoFechar: () => void;
  aoSalvar: (url: string) => Promise<void>;
};

export default function SeletorAvatar({
  visivel,
  avatarAtual,
  aoFechar,
  aoSalvar,
}: Props) {
  const { tema } = useTheme();
  const { escalaFonte } = useFontSize();

  const [avatarSelecionado, setAvatarSelecionado] =
    useState<string | null>(null);

  const [salvando, setSalvando] = useState(false);

  const salvamentoBloqueado = useRef(false);

  const escolhido = AVATARES.find(
    (avatar) => avatar.id === avatarSelecionado,
  );

  useEffect(() => {
    if (visivel) {
      const avatarSalvo = buscarAvatar(avatarAtual);

      setAvatarSelecionado(avatarSalvo?.id ?? null);
    }
  }, [visivel, avatarAtual]);

  function fecharModal() {
    if (!salvamentoBloqueado.current) {
      aoFechar();
    }
  }

  async function salvarAvatar() {
    if (!escolhido || salvamentoBloqueado.current) {
      return;
    }

    salvamentoBloqueado.current = true;
    setSalvando(true);

    try {
      await aoSalvar(escolhido.url);
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
          style={[
            estilos.modal,
            {
              backgroundColor: tema.modal,
            },
          ]}
        >
          <ScrollView
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
              Escolha uma das 30 opções geradas pelo DiceBear.
            </Text>

            {escolhido && (
              <View style={estilos.previa}>
                <AvatarImagem
                  uri={escolhido.url}
                  tamanho={104}
                />

                <Text
                  accessibilityLiveRegion="polite"
                  style={{
                    color: tema.text,
                    fontSize: 14 * escalaFonte,
                    textAlign: "center",
                  }}
                >
                  {escolhido.nome}
                </Text>
              </View>
            )}

            <View style={estilos.grade}>
              {AVATARES.map((avatar) => {
                const selecionado =
                  avatar.id === avatarSelecionado;

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
                        backgroundColor: tema.card,
                        borderColor: selecionado
                          ? "#4CAF50"
                          : tema.border,
                      },
                    ]}
                  >
                    <AvatarImagem
                      uri={avatar.url}
                      tamanho={64}
                    />

                    <View style={estilos.nomeAvatar}>
                      <Text
                        style={{
                          color: tema.text,
                          fontSize: 12 * escalaFonte,
                          fontWeight: selecionado
                            ? "bold"
                            : "normal",
                          textAlign: "center",
                        }}
                      >
                        {selecionado ? "✓ " : ""}
                        {avatar.nome}
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
                disabled: !escolhido || salvando,
                busy: salvando,
              }}
              disabled={!escolhido || salvando}
              onPress={salvarAvatar}
              style={[
                estilos.botaoSalvar,
                {
                  opacity:
                    !escolhido || salvando ? 0.5 : 1,
                },
              ]}
            >
              {salvando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 16 * escalaFonte,
                  }}
                >
                  Salvar avatar
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              disabled={salvando}
              onPress={fecharModal}
              style={estilos.botaoCancelar}
            >
              <Text
                style={{
                  color: tema.text,
                  fontSize: 16 * escalaFonte,
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
    maxHeight: "100%",
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

  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },

  opcao: {
    width: "30%",
    minWidth: 76,
    borderWidth: 2,
    borderRadius: 12,
    paddingTop: 8,
    alignItems: "center",
  },

  nomeAvatar: {
    width: "100%",
    minHeight: 48,
    padding: 4,
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