
import { useEvent } from "expo";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";

import { supabase } from "../bd/supabase";
import { useFontSize } from "../context/FontSizeContext";

type Props = {
  arquivo: string;
};

const PROPORCAO_VIDEO = 864 / 1920;

export default function ReprodutorTutorial({ arquivo }: Props) {
  const { width, height } = useWindowDimensions();
  const { escalaFonte } = useFontSize();

  // Obtém a URL do vídeo no Supabase Storage.
  const { data } = supabase.storage
    .from("paed-tutoriais")
    .getPublicUrl(arquivo);

  const urlVideo = data.publicUrl;

  // Cria o player e inicia a reprodução.
  const player = useVideoPlayer(urlVideo, (player) => {
    player.loop = false;
    player.play();
  });

  // Acompanha o carregamento e possíveis erros.
  const { status, error } = useEvent(
    player,
    "statusChange",
    { status: player.status }
  );

  // Calcula o tamanho do vídeo sem deformar a imagem.
  const larguraDisponivel = Math.max(
    120,
    Math.min(width * 0.92, 520) - 36
  );

  const alturaMaxima = Math.max(
    160,
    height * 0.85 - 220
  );

  const alturaVideo = Math.min(
    larguraDisponivel / PROPORCAO_VIDEO,
    alturaMaxima
  );

  const larguraVideo = alturaVideo * PROPORCAO_VIDEO;

  const carregando = status === "idle" || status === "loading";
  const ocorreuErro = status === "error";

  return (
    <View style={estilos.container}>
      <View
        style={[
          estilos.areaVideo,
          {
            width: larguraVideo,
            height: alturaVideo,
          },
        ]}
      >
        {ocorreuErro ? (
          <View style={estilos.mensagemContainer}>
            <Text
              style={[
                estilos.mensagem,
                { fontSize: 14 * escalaFonte },
              ]}
            >
              Não foi possível carregar o vídeo.
              Verifique sua conexão com a internet
              e tente novamente.
            </Text>
            {__DEV__ && error ? (
              <Text style={estilos.detalheErro}>
                {error.message}
              </Text>
            ) : null}
          </View>
        ) : (
          <>
            <VideoView
              player={player}
              style={estilos.video}
              contentFit="contain"
              nativeControls
              fullscreenOptions={{ enable: true }}
              surfaceType="textureView"
            />

            {carregando && (
              <View
                style={estilos.carregamento}
                pointerEvents="none"
              >
                <ActivityIndicator
                  size="large"
                  color="#FFFFFF"
                />
                <Text
                  style={[
                    estilos.mensagem,
                    { fontSize: 14 * escalaFonte },
                  ]}
                >
                  Carregando vídeo...
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  areaVideo: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },

  video: {
    width: "100%",
    height: "100%",
  },

  carregamento: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  mensagemContainer: {
    width: "100%",
    height: "100%",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  mensagem: {
    color: "#FFFFFF",
    fontFamily: "FredokaLight",
    textAlign: "center",
  },

  detalheErro: {
    marginTop: 10,
    fontSize: 11,
    color: "#FFFFFF",
    textAlign: "center",
  },
});
