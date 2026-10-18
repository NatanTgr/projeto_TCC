
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { supabase } from "../bd/supabase";
import { useTheme } from "../context/ThemeContext";
import { useFontSize } from "../context/FontSizeContext";
import Estilos from "../Estilos/ModalBoasVindasEstilo";

type Props = {
  usuarioId: string | null;
};

export default function ModalBoasVindas({ usuarioId }: Props) {
  const { tipoTema, tema } = useTheme();
  const { escalaFonte } = useFontSize();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [visivel, setVisivel] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const temaEscuro = tipoTema === "escuro";
  const temaForte = tipoTema === "forte";

  const corTexto = temaEscuro
    ? "#F7F3E8"
    : temaForte
      ? "#111111"
      : "#836F68";

  const corSecundaria = temaEscuro
    ? "#E7D9C8"
    : temaForte
      ? "#222222"
      : "#836F68";

  const corIcone = temaEscuro ? "#FFD48D" : "#D68D42";

  const fundoIcone = temaEscuro
    ? "#48382D"
    : "#FFF3DF";

  const corTextoBotao = temaForte
    ? "#FFFFFF"
    : "#432D1C";

  useEffect(() => {
    let ativo = true;

    setVisivel(false);
    setMensagemErro(null);

    if (!usuarioId) {
      return () => {
        ativo = false;
      };
    }

    const verificarBoasVindas = async () => {
      const { data, error } = await supabase
        .from("usuarios")
        .select("boas_vindas_visualizadas")
        .eq("id", usuarioId)
        .maybeSingle();

      if (!ativo) return;

      if (error) {
        console.log("Erro ao verificar boas-vindas:", error);
        return;
      }

      if (!data) {
        console.log("Registro do usuário não encontrado.");
        return;
      }

      if (data.boas_vindas_visualizadas === false) {
        setVisivel(true);
      }
    };

    void verificarBoasVindas();

    return () => {
      ativo = false;
    };
  }, [usuarioId]);

  const concluirBoasVindas = async () => {
    if (!usuarioId || salvando) return;

    setSalvando(true);
    setMensagemErro(null);

    try {
      const { data, error } = await supabase
        .from("usuarios")
        .update({
          boas_vindas_visualizadas: true,
        })
        .eq("id", usuarioId)
        .select("id")
        .maybeSingle();

      if (error || !data) {
        console.log("Erro ao salvar boas-vindas:", error);

        setMensagemErro(
          "Não foi possível salvar sua confirmação. Tente novamente."
        );
        return;
      }

      setVisivel(false);

      router.replace("/(tabs)/TelaConfig");
    } catch (erro) {
      console.log("Erro ao concluir boas-vindas:", erro);

      setMensagemErro(
        "Ocorreu um erro. Verifique sua conexão e tente novamente."
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal
      visible={Boolean(usuarioId && visivel)}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={Estilos.overlay}>
        <View
          style={[
            Estilos.modal,
            {
              backgroundColor: tema.card,
              borderColor: tema.border,
              maxHeight: Math.max(
                240,
                height - insets.top - insets.bottom - 48
              ),
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={Estilos.conteudo}
            bounces={false}
          >
            <View
              style={[
                Estilos.iconeContainer,
                { backgroundColor: fundoIcone },
              ]}
            >
              <MaterialCommunityIcons
                name="hand-heart-outline"
                size={40}
                color={corIcone}
              />
            </View>

            <Text
              style={[
                Estilos.titulo,
                {
                  color: corTexto,
                  fontSize: 25 * escalaFonte,
                },
              ]}
            >
              Boas-vindas ao PAED!
            </Text>

            <Text
              style={[
                Estilos.subtitulo,
                {
                  color: corTexto,
                  fontSize: 17 * escalaFonte,
                },
              ]}
            >
              Estamos felizes em ter você aqui!
            </Text>

            <Text
              style={[
                Estilos.descricao,
                {
                  color: corSecundaria,
                  fontSize: 15 * escalaFonte,
                  lineHeight: 23 * escalaFonte,
                },
              ]}
            >
              O PAED foi desenvolvido para tornar sua rotina
              escolar mais acessível, organizada e acolhedora.
            </Text>

            <View
              style={[
                Estilos.divisor,
                { backgroundColor: tema.border },
              ]}
            />

            <Text
              style={[
                Estilos.orientacao,
                {
                  color: corTexto,
                  fontSize: 15 * escalaFonte,
                  lineHeight: 24 * escalaFonte,
                },
              ]}
            >
              Para entender melhor como o aplicativo funciona,
              ao tocar em "Vamos começar!" você será direcionado
              às Configurações, onde poderá assistir ao vídeo
              tutorial e personalizar o PAED de acordo com
              suas preferências e necessidades.
            </Text>

            {mensagemErro && (
              <Text
                style={[
                  Estilos.mensagemErro,
                  { fontSize: 14 * escalaFonte },
                ]}
              >
                {mensagemErro}
              </Text>
            )}

            <Pressable
              onPress={concluirBoasVindas}
              disabled={salvando}
              accessibilityRole="button"
              accessibilityLabel="Vamos começar, abrir configurações"
              style={[
                Estilos.botao,
                {
                  backgroundColor: temaForte
                    ? "#111111"
                    : temaEscuro
                      ? "#FFD48D"
                      : "#FFAA56",
                  opacity: salvando ? 0.7 : 1,
                },
              ]}
            >
              {salvando ? (
                <ActivityIndicator color={corTextoBotao} />
              ) : (
                <Text
                  style={[
                    Estilos.textoBotao,
                    {
                      color: corTextoBotao,
                      fontSize: 17 * escalaFonte,
                    },
                  ]}
                >
                  Vamos começar!
                </Text>
              )}
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
