import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { useEffect } from "react";
import { Platform, View, useColorScheme } from "react-native";

// 🚫 Prevent auto hide
if (Platform.OS !== "web") {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}
export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  useEffect(() => {
    if (Platform.OS === "web") {
      return; // 🚀 instant render on web
    }

    const prepare = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (e) {
        console.log("Startup error:", e);
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}
