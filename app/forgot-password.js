import { useState } from "react";
import {
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
        justifyContent: "center",
        padding: 20,
        backgroundColor: colors.background,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          marginBottom: 20,
          color: colors.text,
        }}
      >
        Forgot Password
      </Text>
      {/* BACK BUTTON (TOP RIGHT) */}
      <TouchableOpacity onPress={() => router.replace("/login")}>
        <Ionicons
          name="arrow-back-circle"
          size={32}
          color={isDark ? "#fff" : "#000"}
        />
      </TouchableOpacity>
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
          padding: 12,
          marginBottom: 12,
          borderRadius: 8,
          color: colors.text,
          backgroundColor: colors.card,
        }}
      />

      {/* ✅ Error Message */}
      {error ? (
        <Text style={{ color: colors.error, marginBottom: 10 }}>{error}</Text>
      ) : null}

      <TouchableOpacity
        onPress={handleReset}
        style={{
          backgroundColor: colors.button,
          padding: 15,
          borderRadius: 8,
          marginTop: 10,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>Send Reset</Text>
      </TouchableOpacity>
    </View>
  );
}
