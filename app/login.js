import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert, Image, Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { API_BASE } from "../config";

export default function Login() {
  const router = useRouter();

  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const colors = {
    background: isDark ? "#121212" : "#f2f2f2",
    card: isDark ? "#1e1e1e" : "#ffffff",
    text: isDark ? "#ffffff" : "#000000",
    border: isDark ? "#333" : "#ccc",
    placeholder: isDark ? "#aaa" : "#666",
    button: "#4CAF50",
  };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.detail || "Login failed";

        setError(message); // ✅ shows on web + mobile UI
        Alert.alert("Login Failed", message); // ✅ still pops on mobile

        return;
      }

      // ✅ SAVE USER SESSION
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          username: data.username,
          role: data.role,
          id: data.id, // ✅ MUST MATCH BACKEND
        }),
      );
      console.log("STORING USER:", data);
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Error", "Network error");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      {/* 🔥 HEADER (LOGO) */}
      <View
        style={{
          height: 80,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background, // 👈 blends perfectly
        }}
      >
        <Image
          source={require("../assets/images/logo-white-pbe.png")}
          style={{ width: 50, height: 50, resizeMode: "contain" }}
        />
      </View>

      {/* 🔥 CONTENT */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 28,
            marginBottom: 20,
            color: colors.text,
          }}
        >
          Login
        </Text>

        <TextInput
          placeholder="Username"
          placeholderTextColor={colors.placeholder}
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setError("");
          }}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            padding: 12,
            marginBottom: 12,
            borderRadius: 8,
            color: colors.text,
            backgroundColor: colors.card,
          }}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor={colors.placeholder}
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError("");
          }}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            padding: 12,
            marginBottom: 12,
            borderRadius: 8,
            color: colors.text,
            backgroundColor: colors.card,
          }}
        />

        <TouchableOpacity
          onPress={() => router.push("/forgot-password")}
          style={{ alignSelf: "flex-end", marginBottom: 10 }}
        >
          <Text style={{ color: colors.button }}>Forgot Password?</Text>
        </TouchableOpacity>

        {error ? (
          <Text style={{ color: isDark ? "#ff6b6b" : "red", marginBottom: 10 }}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleLogin}
          style={{
            backgroundColor: colors.button,
            padding: 15,
            borderRadius: 8,
            marginTop: 10,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/create-user")}
          style={{ marginTop: 15 }}
        >
          <Text style={{ color: "#4CAF50", textAlign: "center" }}>
            Create Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
