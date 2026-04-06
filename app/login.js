import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
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
    disabled: "#888",
  };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef(null);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);
    setError("");

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

      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        {/* HEADER */}
        <View
          style={{
            height: 90,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={async () => {
              const url = "https://pacificblueengineering.com";
              if (await Linking.canOpenURL(url)) {
                await Linking.openURL(url);
              }
            }}
          >
            <Image
              source={require("../assets/images/logo_white_pbe.png")}
              style={{ width: 55, height: 55, resizeMode: "contain" }}
            />
          </TouchableOpacity>
        </View>

        {/* CARD */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              padding: 20,
              borderRadius: 15,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 26,
                marginBottom: 20,
                textAlign: "center",
                color: colors.text,
                fontWeight: "600",
              }}
            >
              Welcome Back
            </Text>

            {/* USERNAME */}
            <TextInput
              placeholder="Username"
              placeholderTextColor={colors.placeholder}
              value={username}
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              onChangeText={(text) => {
                setUsername(text);
                setError("");
              }}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                padding: 12,
                marginBottom: 12,
                borderRadius: 10,
                color: colors.text,
                backgroundColor: colors.background,
              }}
            />

            {/* PASSWORD */}
            <View style={{ position: "relative" }}>
              <TextInput
                ref={passwordRef}
                placeholder="Password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setError("");
                }}
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 12,
                  borderRadius: 10,
                  color: colors.text,
                  backgroundColor: colors.background,
                }}
              />

              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: 12,
                }}
              >
                <Text>{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            {/* FORGOT */}
            <TouchableOpacity
              onPress={() => router.push("/forgot-password")}
              style={{ alignSelf: "flex-end", marginTop: 10 }}
            >
              <Text style={{ color: colors.button }}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* ERROR */}
            {error ? (
              <Text
                style={{
                  color: "#ff6b6b",
                  marginTop: 10,
                  textAlign: "center",
                }}
              >
                {error}
              </Text>
            ) : null}

            {/* LOGIN BUTTON */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={{
                backgroundColor: loading ? colors.disabled : colors.button,
                padding: 15,
                borderRadius: 10,
                marginTop: 20,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center" }}>
                {loading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            {/* CREATE ACCOUNT */}
            <TouchableOpacity
              onPress={() => router.push("/create-user")}
              style={{ marginTop: 15 }}
            >
              <Text style={{ color: colors.button, textAlign: "center" }}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
