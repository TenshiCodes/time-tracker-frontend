import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { API_BASE } from "../../config";

export default function Create() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const router = useRouter();
  const { description, ticketId } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (description) {
      setName(description);
    } else {
      setName("");
      setCode("");
    }
  }, [description]);

  const handleCreate = async () => {
    if (!name || !code) {
      Alert.alert("Error", "Fill all fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, code }),
      });

      if (!res.ok) {
        Alert.alert("Error", "Failed to create item");
        return;
      }

      if (ticketId) {
        const storedUser = await AsyncStorage.getItem("user");
        const user = JSON.parse(storedUser);
        await fetch(
          `${API_BASE}/tickets/${ticketId}/approve?username=${encodeURIComponent(user.username)}`,
          { method: "POST" },
        );
      }

      Alert.alert("Success", "Item created!");

      setName("");
      setCode("");

      if (ticketId) {
        router.back();
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something failed");
    }
  };

  // 🎨 THEME COLORS
  const styles = {
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: isDark ? "#121212" : "#f2f2f2",
    },
    title: {
      fontSize: 24,
      marginBottom: 20,
      color: isDark ? "#fff" : "#000",
      fontWeight: "600",
    },
    input: {
      backgroundColor: isDark ? "#1e1e1e" : "#fff",
      color: isDark ? "#fff" : "#000",
      padding: 12,
      marginBottom: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#ddd",
    },
    button: {
      backgroundColor: "#1F9BB7",
      padding: 15,
      borderRadius: 10,
      marginTop: 10,
    },
    buttonText: {
      color: "#fff",
      textAlign: "center",
      fontWeight: "600",
      fontSize: 16,
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Item</Text>

      <TextInput
        placeholder="Name"
        placeholderTextColor={isDark ? "#aaa" : "#666"} // ✅ FIX
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Code"
        placeholderTextColor={isDark ? "#aaa" : "#666"} // ✅ FIX
        value={code}
        onChangeText={setCode}
        style={styles.input}
      />

      <TouchableOpacity onPress={handleCreate} style={styles.button}>
        <Text style={styles.buttonText}>Create</Text>
      </TouchableOpacity>
    </View>
  );
}
