import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { API_BASE } from "../config";

export default function ResetPassword() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const [confirmPassword, setConfirmPassword] = useState("");

  const [password, setPassword] = useState("");
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
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Something went wrong");
        return;
      }

      setError("");
      alert("Password updated!");
      router.replace("/login");
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
        Reset Password
      </Text>

      <TextInput
        placeholder="New Password"
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
      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor={colors.placeholder}
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
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
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Reset Password
        </Text>
      </TouchableOpacity>
    </View>
  );
}
