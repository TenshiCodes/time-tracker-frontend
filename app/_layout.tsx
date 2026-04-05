import { Stack, useRouter } from "expo-router";
import { View, useColorScheme } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}>
      {/* 🔥 NAVIGATION */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}
