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
import { SafeAreaView } from "react-native-safe-area-context";
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
    button: "#1F9BB7",
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
        {/* 🔥 HEADER (LOGO) */}
        <View
          style={{
            height: 80,
            justifyContent: "center",
            alignItems: "center",
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
              source={require("../assets/images/pbe_small.png")}
              style={{ width: 50, height: 50, resizeMode: "contain" }}
            />
          </TouchableOpacity>
        </View>

        {/* 🔙 FLOATING BACK BUTTON */}
        <TouchableOpacity
          onPress={() => router.replace("/login")}
          style={{
            position: "absolute",
            top: 50,
            right: 20,
            zIndex: 10,
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            borderRadius: 20,
            padding: 4,
          }}
        >
          <Ionicons
            name="arrow-back-circle"
            size={34}
            color={isDark ? "#fff" : "#000"}
          />
        </TouchableOpacity>

        {/* 🔥 CONTENT */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
            width: "100%",
            maxWidth: 650, // 👈 perfect balance for web + mobile
            alignSelf: "center",
          }}
        >
          <Text
            style={{
              fontSize: 28,
              color: colors.text,
              marginBottom: 25,
              textAlign: "left",
            }}
          >
            Forgot Password
          </Text>

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
              width: "100%",
            }}
          />

          {error ? (
            <Text style={{ color: colors.error, marginBottom: 10 }}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={handleReset}
            style={{
              backgroundColor: colors.button,
              padding: 16,
              borderRadius: 12,
              marginTop: 10,
              width: "100%",
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              Send Reset
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
