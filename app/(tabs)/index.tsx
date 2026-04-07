import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { API_BASE } from "../../config";

export default function Index() {
  const { mode } = useLocalSearchParams(); // ✅ mode detection

  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const styles = getStyles(isDark);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // 🔄 reset when screen refocuses
  useFocusEffect(
    useCallback(() => {
      setQuery("");
      setResults([]);
      setSelectedItem(null);
    }, []),
  );

  const handleSearch = async (text: string) => {
    setQuery(text);

    if (!text.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/search?q=${text}`);
      const data = await res.json();

      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return <Text style={styles.itemText}>{text}</Text>;

    const words = query.split(" ");
    const regex = new RegExp(`(${words.join("|")})`, "gi");
    const parts = text.split(regex);

    return (
      <Text style={styles.itemText}>
        {parts.map((part, index) =>
          words.some((w) => w.toLowerCase() === part.toLowerCase()) ? (
            <Text key={index} style={{ fontWeight: "bold", color: "#4CAF50" }}>
              {part}
            </Text>
          ) : (
            <Text key={index}>{part}</Text>
          ),
        )}
      </Text>
    );
  };

  const handleSelect = (item: any) => {
    setQuery(item.name);
    setSelectedItem(item);
    setResults([]);
  };

  // =====================================================
  // 🔥 CONDITIONAL UI BASED ON MODE
  // =====================================================

  if (mode === "search") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.searchContainer}>
          <Text style={styles.logo}>Search</Text>

          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Search..."
            placeholderTextColor={isDark ? "#aaa" : "#666"}
            style={styles.input}
          />

          {selectedItem && (
            <Text
              style={{
                marginTop: 15,
                fontSize: 32,
                fontWeight: "bold",
                color: isDark ? "#4CAF50" : "#2e7d32",
              }}
            >
              {selectedItem.code}
            </Text>
          )}

          {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

          {results.length > 0 && (
            <View style={styles.dropdown}>
              <FlatList
                data={results}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    style={styles.item}
                  >
                    {highlightText(item.name, query)}
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  } else {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.searchContainer}>
          <Text style={styles.logo}>Home</Text>

          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Search..."
            placeholderTextColor={isDark ? "#aaa" : "#666"}
            style={styles.input}
          />

          {selectedItem && (
            <Text
              style={{
                marginTop: 15,
                fontSize: 32,
                fontWeight: "bold",
                color: isDark ? "#4CAF50" : "#2e7d32",
              }}
            >
              {selectedItem.code}
            </Text>
          )}

          {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

          {results.length > 0 && (
            <View style={styles.dropdown}>
              <FlatList
                data={results}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    style={styles.item}
                  >
                    {highlightText(item.name, query)}
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================

// =====================================================
// 🎨 STYLES
// =====================================================

function getStyles(isDark: boolean) {
  return {
    container: {
      flex: 1,
      backgroundColor: isDark ? "#121212" : "#f2f2f2",
      justifyContent: "center",
      alignItems: "center",
    },

    searchContainer: {
      width: "90%",
      alignItems: "center",
    },

    logo: {
      fontSize: 32,
      marginBottom: 20,
      color: isDark ? "#fff" : "#000",
      fontWeight: "600",
    },

    input: {
      width: "100%",
      padding: 14,
      borderRadius: 25,
      backgroundColor: isDark ? "#1e1e1e" : "#fff",
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#ddd",
      color: isDark ? "#fff" : "#000",
      elevation: 3,
    },

    dropdown: {
      width: "100%",
      marginTop: 10,
      backgroundColor: isDark ? "#1e1e1e" : "#fff",
      borderRadius: 10,
      maxHeight: 250,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#ddd",
    },

    item: {
      padding: 14,
      borderBottomWidth: 1,
      borderColor: isDark ? "#333" : "#eee",
    },

    itemText: {
      color: isDark ? "#fff" : "#000",
    },
  };
}
