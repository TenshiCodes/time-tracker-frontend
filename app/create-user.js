import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Linking,
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
      <View style={{ flex: 1 }}>
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
            maxWidth: 650,
            alignSelf: "center",
          }}
        >
          <Text
            style={{
              fontSize: 28,
              color: isDark ? "#fff" : "#000",
              marginBottom: 25,
              textAlign: "left",
            }}
          >
            Create User
          </Text>

          {/* INPUTS */}
          <TextInput
            placeholder="First Name"
            placeholderTextColor={isDark ? "#aaa" : "#666"}
            value={firstName}
            onChangeText={setFirstName}
            style={{ ...inputStyle, width: "100%" }}
          />

          <TextInput
            placeholder="Last Name"
            placeholderTextColor={isDark ? "#aaa" : "#666"}
            value={lastName}
            onChangeText={setLastName}
            style={{ ...inputStyle, width: "100%" }}
          />

          <TextInput
            placeholder="Work Email"
            placeholderTextColor={isDark ? "#aaa" : "#666"}
            value={email}
            onChangeText={setEmail}
            style={{ ...inputStyle, width: "100%" }}
            keyboardType="email-address"
          />

          <TextInput
            placeholder="Work Phone"
            placeholderTextColor={isDark ? "#aaa" : "#666"}
            value={phone}
            onChangeText={setPhone}
            style={{ ...inputStyle, width: "100%" }}
            keyboardType="phone-pad"
          />

          <TextInput
            placeholder="Password"
            placeholderTextColor={isDark ? "#aaa" : "#666"}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={{ ...inputStyle, width: "100%" }}
          />

          {/* BUTTON */}
          <TouchableOpacity
            onPress={handleCreateUser}
            style={{
              backgroundColor: "#1F9BB7",
              padding: 16,
              borderRadius: 12,
              marginTop: 10,
              width: "100%",
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>
              Create User
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
