import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_BASE } from "../config";

export default function CreateUser() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const generatedUsername = email.split("@")[0];

  const handleCreateUser = async () => {
    if (!firstName || !lastName || !email || !phone || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          username: generatedUsername,
          password,
        }),
      });

      if (res.ok) {
        if (Platform.OS === "web") {
          window.alert("User created successfully");
          router.replace("/login");
        } else {
          Alert.alert("Success", "User created", [
            { text: "OK", onPress: () => router.replace("/login") },
          ]);
        }
      }
    } catch (err) {
      console.error("ERROR:", err);
      Alert.alert("Error", "Something broke");
    }
  };

  const inputStyle = {
    backgroundColor: isDark ? "#1e1e1e" : "#fff",
    color: isDark ? "#fff" : "#000",
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
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
          padding: 20,
          paddingTop: 10, // small extra spacing under status bar
        }}
      >
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              color: isDark ? "#fff" : "#000",
            }}
          >
            Create User
          </Text>

          {/* BACK BUTTON (TOP RIGHT) */}
          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Ionicons
              name="arrow-back-circle"
              size={32}
              color={isDark ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        </View>

        {/* INPUTS */}
        <TextInput
          placeholder="First Name"
          placeholderTextColor={isDark ? "#aaa" : "#666"}
          value={firstName}
          onChangeText={setFirstName}
          style={inputStyle}
        />

        <TextInput
          placeholder="Last Name"
          placeholderTextColor={isDark ? "#aaa" : "#666"}
          value={lastName}
          onChangeText={setLastName}
          style={inputStyle}
        />

        <TextInput
          placeholder="Work Email"
          placeholderTextColor={isDark ? "#aaa" : "#666"}
          value={email}
          onChangeText={setEmail}
          style={inputStyle}
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Work Phone"
          placeholderTextColor={isDark ? "#aaa" : "#666"}
          value={phone}
          onChangeText={setPhone}
          style={inputStyle}
          keyboardType="phone-pad"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor={isDark ? "#aaa" : "#666"}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={inputStyle}
        />

        {/* BUTTON */}
        <TouchableOpacity
          onPress={handleCreateUser}
          style={{
            backgroundColor: "#4CAF50",
            padding: 15,
            borderRadius: 12,
            marginTop: 10,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
            Create User
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
