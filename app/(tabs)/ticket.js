import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { API_BASE } from "../../config";
export default function Ticket() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [description, setDescription] = useState("");

  const submitTicket = async () => {
    if (!description.trim()) return;

    try {
      const user = await AsyncStorage.getItem("user");
      const parsed = JSON.parse(user);

      await fetch(`${API_BASE}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          username: parsed.username,
        }),
      });

      Alert.alert("Success", "Ticket submitted!");
      setDescription("");
    } catch (err) {
      Alert.alert("Error", "Failed to submit");
    }
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: isDark ? "#121212" : "#f2f2f2",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          marginBottom: 20,
          color: isDark ? "#fff" : "#000",
        }}
      >
        Submit Ticket
      </Text>

      <TextInput
        placeholder="Describe your request..."
        placeholderTextColor={isDark ? "#aaa" : "#666"}
        value={description}
        onChangeText={setDescription}
        multiline
        style={{
          height: 120,
          borderWidth: 1,
          borderColor: isDark ? "#333" : "#ccc",
          padding: 10,
          borderRadius: 10,
          color: isDark ? "#fff" : "#000",
          backgroundColor: isDark ? "#1e1e1e" : "#fff",
          marginBottom: 20,
        }}
      />

      <TouchableOpacity
        onPress={submitTicket}
        style={{
          backgroundColor: "#4CAF50",
          padding: 15,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}
