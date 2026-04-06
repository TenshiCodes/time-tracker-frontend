import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { API_BASE } from "../../config";

export default function Users() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";

    try {
      await fetch(`${API_BASE}/users/${user.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      fetchUsers(); // refresh list
    } catch (err) {
      console.error("ROLE ERROR:", err);
    }
  };

  // 🔥 CONFIRM DELETE (WEB + MOBILE)
  const confirmDeleteUser = (userId) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this user? This cannot be undone.",
      );

      if (confirmed) {
        handleDelete(userId);
      }
      return;
    }

    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user? This cannot be undone.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => handleDelete(userId),
        },
      ],
      { cancelable: true },
    );
  };

  // 🔥 DELETE USER
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        let data;
        try {
          data = await res.json();
        } catch {
          data = { detail: "Unknown error" };
        }

        Alert.alert("Error", data.detail || "Failed to delete user");
        return;
      }

      // ✅ instant UI update (no refetch lag)
      setUsers((prev) => prev.filter((user) => user.id !== id));

      if (Platform.OS === "web") {
        window.alert("User deleted");
      } else {
        Alert.alert("Success", "User deleted");
      }
    } catch (err) {
      console.error("DELETE ERROR:", err);
      Alert.alert("Error", "Something broke");
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
        Users
      </Text>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 15,
              marginBottom: 10,
              backgroundColor: isDark ? "#1e1e1e" : "#fff",
              borderRadius: 10,
            }}
          >
            <Text style={{ color: isDark ? "#fff" : "#000" }}>
              {item.first_name} {item.last_name}
            </Text>

            <Text style={{ color: "#888" }}>{item.email}</Text>

            <Text style={{ color: "#4CAF50" }}>Role: {item.role}</Text>

            {/* 🔄 TOGGLE ROLE */}
            <TouchableOpacity
              onPress={() => toggleRole(item)}
              style={{
                marginTop: 10,
                backgroundColor: "#2196F3",
                padding: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center" }}>
                Toggle Role
              </Text>
            </TouchableOpacity>

            {/* 🗑 DELETE */}
            <TouchableOpacity
              onPress={() => confirmDeleteUser(item.id)}
              style={{
                marginTop: 10,
                backgroundColor: "#f44336",
                padding: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#fff", textAlign: "center" }}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
