
import { StyleSheet, View } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";

type Props = {
  arquivo: number;
};

export default function ReprodutorTutorial({ arquivo }: Props) {
  const player = useVideoPlayer(arquivo, (player) => {
    player.loop = false;
    player.play();
  });

  return (
    <View style={estilos.container}>
      <VideoView
        player={player}
        style={estilos.video}
        contentFit="contain"
        nativeControls
        fullscreenOptions={{ enable: true }}
        surfaceType="textureView"
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: "#000000",
  },

  video: {
    width: "100%",
    aspectRatio: 16 / 9,
  },
});
