import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { API_BASE } from "../../config";
export default function History() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const formatDate = (dateString) => {
    if (!dateString) return "";

    // 👇 Force UTC parsing
    const date = new Date(dateString + "Z");

    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }); // 👈 simple + clean
  };
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/tickets/history`);
      const data = await res.json();

      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, []),
  );

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

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
        History
      </Text>

      <FlatList
        data={tickets}
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
              {item.description}
            </Text>

            <Text style={{ marginTop: 5, color: "#888" }}>
              Submitted by: {item.username || "Unknown"}
            </Text>

            <Text
              style={{
                marginTop: 5,
                color: item.status === "approved" ? "#4CAF50" : "#f44336",
              }}
            >
              {item.status} by {item.approved_by}
              {item.rejected_by}: {formatDate(item.approved_at)}
              {formatDate(item.rejected_at)}
            </Text>
            {/* 🕒 APPROVED TIME 
                {item.approved_at && (
                    <Text style={{ color: isDark ? "#aaa" : "#555", marginTop: 5 }}>
                    Approved: {formatDate(item.approved_at)}
                    </Text>
                )}

                {/* ❌ REJECTED TIME 
                {item.rejected_at && (
                    <Text style={{ color:  isDark ? "#aaa" : "#555", marginTop: 5 }}>
                    Rejected: {formatDate(item.rejected_at)}
                    </Text>
                )}*/}
          </View>
        )}
      />
    </View>
  );
}
