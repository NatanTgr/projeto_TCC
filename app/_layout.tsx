import { Stack } from "expo-router";
import { ThemeProvider } from "../context/ThemeContext";
import { FontSizeProvider } from "../context/FontSizeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <FontSizeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </FontSizeProvider>
    </ThemeProvider>
  );
}