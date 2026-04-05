import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    Linking,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { API_BASE } from "../config";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
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
    error: isDark ? "#ff6b6b" : "red",
  };

  const handleReset = async () => {
    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Something went wrong");
        return;
      }

      setError("");
      alert("Reset instructions sent!");
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center", // 👈 centers content on web
      }}
    >
      {/* 🔥 HEADER (LOGO) */}
      <View
        style={{
          height: 90,
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <TouchableOpacity
          onPress={async () => {
            const url = "https://pacificblueengineering.com";
            const supported = await Linking.canOpenURL(url);
            if (supported) await Linking.openURL(url);
          }}
        >
          <Image
            source={require("../assets/images/logo_white_pbe.png")}
            style={{ width: 55, height: 55, resizeMode: "contain" }}
          />
        </TouchableOpacity>
      </View>

      {/* 🔥 CONTENT CARD */}
      <View
        style={{
          width: "100%",
          maxWidth: 500, // 👈 keeps it clean on desktop
          paddingHorizontal: 20,
        }}
      >
        {/* HEADER ROW */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 25,
          }}
        >
          <Text
            style={{
              fontSize: 26,
              fontWeight: "600",
              color: colors.text,
            }}
          >
            Forgot Password
          </Text>

          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Ionicons name="arrow-back-circle" size={32} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* INPUT */}
        <TextInput
          placeholder="Username or Email"
          placeholderTextColor={colors.placeholder}
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setError("");
          }}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            padding: 14,
            marginBottom: 15,
            borderRadius: 10,
            color: colors.text,
            backgroundColor: colors.card,
          }}
        />

        {/* ERROR */}
        {error ? (
          <Text style={{ color: colors.error, marginBottom: 10 }}>{error}</Text>
        ) : null}

        {/* BUTTON */}
        <TouchableOpacity
          onPress={handleReset}
          style={{
            backgroundColor: colors.button,
            padding: 16,
            borderRadius: 10,
            marginTop: 10,
          }}
        >
          <Text
            style={{
              color: "#fff",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            Send Reset
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
