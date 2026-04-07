import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { useEffect } from "react";
import { View, useColorScheme } from "react-native";

// 🚫 Prevent auto hide
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  useEffect(() => {
    const prepare = async () => {
      try {
        // 🔥 Check for OTA update FIRST
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync(); // reloads app
          return; // stop here (app restarts)
        }

        // ⏱ Optional delay (branding splash feel)
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (e) {
        console.log("Startup error:", e);
      } finally {
        // ✅ Always hide splash
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
