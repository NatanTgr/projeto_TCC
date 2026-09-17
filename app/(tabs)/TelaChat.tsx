import { View, Text } from "react-native";
import { useTheme } from "../../context/ThemeContext";

export default function TelaChat() {
  const { tema } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: tema.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: tema.text,
          fontSize: 22,
          fontWeight: "bold",
        }}
      >
        Chat
      </Text>

      <Text
        style={{
          color: tema.text,
          fontSize: 16,
          marginTop: 8,
        }}
      >
        Em breve...
      </Text>
    </View>
  );
}