import { Stack, useRouter } from "expo-router";
import { Image, TouchableOpacity, View } from "react-native";

export default function RootLayout() {
  const router = useRouter();

  return (
    <View style={{ flex: 1 }}>
      {/* 🔥 HEADER (LOGO ONLY) */}
      <View
        style={{
          height: 70,
          justifyContent: "center",
          paddingHorizontal: 15,
          backgroundColor: "#0b0b0b",
        }}
      >
        <TouchableOpacity onPress={() => router.push("/")}>
          <Image
            source={require("../assets/logo_white_pbe.png")}
            style={{ width: 45, height: 45, resizeMode: "contain" }}
          />
        </TouchableOpacity>
      </View>

      {/* 🔥 YOUR STACK */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}
