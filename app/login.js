import AsyncStorage from "@react-native-async-storage/async-storage";

import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
    button: "#1F9BB7",
    disabled: "#888", // ✅ added
  };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // ✅ added

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true); // ✅ added

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

        setError(message);
        Alert.alert("Login Failed", message);
        return;
      }

      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          username: data.username,
          role: data.role,
          id: data.id,
        }),
      );
      if (role === "admin") {
        router.replace("/(tabs)/admin-dashboard");
      } else {
        router.replace("/(tabs)");
      }
    } catch (err) {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false); // ✅ added
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDark ? "#121212" : "#f2f2f2",
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      >
        {/* HEADER */}
        <View
          style={{
            height: 80,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
          }}
        >
          <TouchableOpacity
            onPress={async () => {
              const url = "https://pacificblueengineering.com";
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                await Linking.openURL(url);
              } else {
                console.log("Can't open URL:", url);
              }
            }}
          >
            <Image
              source={require("../assets/images/pbe_small.png")}
              style={{ width: 50, height: 50, resizeMode: "contain" }}
            />
          </TouchableOpacity>
        </View>

        {/* CONTENT */}
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
            autoCapitalize="none" // ✅ mobile improvement
            returnKeyType="next" // ✅ mobile improvement
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
            returnKeyType="done" // ✅ mobile improvement
            onSubmitEditing={handleLogin} // ✅ mobile UX
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
            <Text
              style={{ color: isDark ? "#ff6b6b" : "red", marginBottom: 10 }}
            >
              {error}
            </Text>
          ) : null}

          {/* 🔥 LOGIN BUTTON */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.7} // ✅ better press feedback
            style={{
              backgroundColor: loading ? colors.disabled : colors.button,
              padding: 15,
              borderRadius: 8,
              marginTop: 10,
              opacity: loading ? 0.7 : 1, // ✅ visual feedback
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              {loading ? "Logging in..." : "Login"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/create-user")}
            style={{ marginTop: 15 }}
          >
            <Text style={{ color: "#1F9BB7", textAlign: "center" }}>
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
