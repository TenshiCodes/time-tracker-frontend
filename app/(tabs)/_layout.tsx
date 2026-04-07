import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Tabs, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Image, TouchableOpacity, useColorScheme, View } from "react-native";

export default function TabsLayout() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("user");
    setRole(null); // ✅ prevent ghost admin
    router.replace("/login");
  };

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setRole(parsed.role);
        setUser(parsed); // 👈 ADD THIS
      } else {
        setRole(null);
        setUser(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 👇 RUN ON MOUNT (CRITICAL)
  useEffect(() => {
    loadUser();
  }, []);

  // 👇 RUN ON TAB FOCUS (GOOD)
  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, []),
  );

  if (loading) return null;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,

        headerStyle: {
          backgroundColor: isDark ? "#121212" : "#fff",
        },
        headerTitleStyle: {
          color: isDark ? "#fff" : "#000",
        },

        headerLeft: () => (
          <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
            <Image
              source={require("../../assets/images/pbe_large.png")}
              style={{
                width: 30,
                height: 30,
                marginLeft: 10,
                marginRight: 8,
                resizeMode: "contain",
              }}
            />
          </TouchableOpacity>
        ),

        headerRight: () => (
          <View style={{ flexDirection: "row", marginRight: 10 }}>
            <TouchableOpacity
              onPress={() => user && router.replace("/settings")}
              style={{ marginRight: 15, opacity: user ? 1 : 0.4 }}
              disabled={!user}
            >
              <Ionicons
                name="settings-outline"
                size={24}
                color={isDark ? "#fff" : "#000"}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout}>
              <Ionicons
                name="log-out-outline"
                size={24}
                color={isDark ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          </View>
        ),

        tabBarStyle: {
          backgroundColor: isDark ? "#121212" : "#fff",
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: isDark ? "#aaa" : "#555",

        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          switch (route.name) {
            case "index":
              iconName = focused ? "home" : "home-outline";
              break;
            case "ticket":
              iconName = focused ? "ticket" : "ticket-outline";
              break;
            case "time":
              iconName = focused ? "alarm" : "alarm-outline";
              break;
            case "admin-dashboard":
              iconName = focused ? "file" : "file-outline";
              break;
            case "create":
              iconName = focused ? "add-circle" : "add-circle-outline";
              break;
            case "history":
              iconName = focused ? "time" : "time-outline";
              break;
            case "users":
              iconName = focused ? "people" : "people-outline";
              break;
            default:
              iconName = "ellipse";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* ✅ ALWAYS */}
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="ticket" options={{ title: "Ticket" }} />

      {/* 👤 LOGGED IN USERS */}
      {role && <Tabs.Screen name="time" options={{ title: "Time" }} />}

      {/* 🔐 ADMIN ONLY */}
      {role === "admin" && (
        <>
          <Tabs.Screen
            name="admin-dashboard"
            options={{ title: "Dashboard" }}
          />
          <Tabs.Screen name="create" options={{ title: "Create" }} />
          <Tabs.Screen name="history" options={{ title: "History" }} />
          <Tabs.Screen name="users" options={{ title: "Users" }} />
        </>
      )}

      {/* 🚫 HIDDEN SCREENS (IMPORTANT) */}
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="edit-time" options={{ href: null }} />
    </Tabs>
  );
}
