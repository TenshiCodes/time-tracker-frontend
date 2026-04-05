import { Stack, useRouter } from "expo-router";
import { Image, TouchableOpacity, View, useColorScheme } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}>
      {/* 🔥 HEADER */}
      <View
        style={{
          height: 70,
          justifyContent: "center",
          paddingHorizontal: 15,
          backgroundColor: isDark ? "#fff" : "#000",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#fff" : "#000",
        }}
      >
        <TouchableOpacity onPress={() => router.push("/")}>
          <Image
            source={
              isDark
                ? require("../assets/images/logo_white_pbe.png") // white logo
                : require("../assets/images/logo_white_pbe.png") // swap later if you add dark logo
            }
            style={{ width: 45, height: 45, resizeMode: "contain" }}
          />
        </TouchableOpacity>
      </View>

      {/* 🔥 NAVIGATION */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}
