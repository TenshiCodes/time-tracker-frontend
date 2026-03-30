import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { API_BASE } from "../../config";

export default function Admin() {
  const router = useRouter(); // ✅ MUST be inside component

  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchTickets();
    }, []),
  );

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_BASE}/tickets`);

      console.log("STATUS:", res.status);

      const data = await res.json();
      console.log("DATA:", data);

      setTickets(
        Array.isArray(data) ? data.filter((t) => t.status === "pending") : [],
      );
    } catch (err) {
      console.error("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };
  const handleApprove = async (item) => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const user = JSON.parse(storedUser);
      await fetch(
        `${API_BASE}/tickets/${item.id}/approve?username=${encodeURIComponent(user.username)}`,
        {
          method: "POST",
        },
      );

      // ✅ REMOVE FROM UI IMMEDIATELY
      setTickets((prev) => prev.filter((t) => t.id !== item.id));
    } catch (err) {
      console.error(err);
    }
  };
  // 🔴 REJECT FUNCTION
  const rejectTicket = async (id) => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const user = JSON.parse(storedUser);
      await fetch(
        `${API_BASE}/tickets/${id}/reject?username=${encodeURIComponent(user.username)}`,
        {
          method: "POST",
        },
      );

      fetchTickets(); // 🔄 refresh list
    } catch (err) {
      console.error(err);
    }
  };

  // ⏳ LOADING STATE
  if (loading) {
    return <ActivityIndicator style={{ marginTop: 50 }} />;
  }

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
        Tickets
      </Text>

      {/* 🚨 EMPTY STATE */}
      {tickets.length === 0 ? (
        <Text style={{ color: isDark ? "#fff" : "#000" }}>
          No tickets found
        </Text>
      ) : (
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
              <Text style={{ color: "#888", marginTop: 5 }}>
                Submitted by: {item.username || "Unknown"}
              </Text>

              <Text style={{ color: isDark ? "#fff" : "#000" }}>
                {item.description}
              </Text>

              <Text style={{ color: "#4CAF50", marginTop: 5 }}>
                {item.status}
              </Text>

              {/* ✅ ACTION BUTTONS */}
              {item.status === "pending" && (
                <View style={{ flexDirection: "row", marginTop: 10 }}>
                  {/* APPROVE */}
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/create",
                        params: {
                          description: item.description,
                          ticketId: item.id,
                        },
                      })
                    }
                    style={{
                      backgroundColor: "#4CAF50",
                      padding: 10,
                      borderRadius: 8,
                      marginRight: 10,
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Approve</Text>
                  </TouchableOpacity>

                  {/* REJECT */}
                  <TouchableOpacity
                    onPress={() => rejectTicket(item.id)}
                    style={{
                      backgroundColor: "#f44336",
                      padding: 10,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}
