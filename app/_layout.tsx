import { Stack, useRouter } from "expo-router";
import * as Updates from "expo-updates";
import { useEffect } from "react";
import { View, useColorScheme } from "react-native";

useEffect(() => {
  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (e) {
      console.log("Update check failed:", e);
    }
  };

  checkForUpdates();
}, []);

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
