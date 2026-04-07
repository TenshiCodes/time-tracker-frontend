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
    setUser(null);
    router.replace("/login");
  };

  const loadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setRole(parsed.role);
        console.log("Parsed User:", parsed);
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
    console.log("Role:", role);
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

        // 🌗 Theme
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
                marginTop: 2,
                resizeMode: "contain",
              }}
            />
          </TouchableOpacity>
        ),

        // 🔴 SIGN OUT BUTTON
        headerRight: () => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 10,
            }}
          >
            {/* ⚙️ Settings */}
            <TouchableOpacity
              onPress={() => {
                if (!user) return; // 🔒 only works if logged in
                router.replace("/settings");
              }}
              style={{ marginRight: 15, opacity: user ? 1 : 0.4 }} // 👈 visual disable
              disabled={!user}
            >
              <Ionicons
                name="settings-outline"
                size={24}
                color={isDark ? "#fff" : "#000"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              style={{ marginRight: 15 }}
            >
              <Ionicons
                name="log-out-outline"
                size={24}
                color={isDark ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          </View>
        ),

        // 🌗 Tabs
        tabBarStyle: {
          backgroundColor: isDark ? "#121212" : "#fff",
        },
        tabBarActiveTintColor: "#4CAF50",
        tabBarInactiveTintColor: isDark ? "#aaa" : "#555",

        // 🔹 Icons
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === "admin-dashboard") {
            iconName = focused ? "document" : "document-outline";
          } else if (route.name === "index") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "ticket") {
            iconName = focused ? "ticket" : "ticket-outline";
          } else if (route.name === "history") {
            iconName = focused ? "time" : "time-outline";
          } else if (route.name === "create") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "admin") {
            iconName = focused
              ? "shield-checkmark"
              : "shield-checkmark-outline";
          } else if (route.name === "create-user") {
            iconName = focused ? "person-add" : "person-add-outline";
          } else if (route.name === "users") {
            iconName = focused ? "people" : "people-outline";
          } else if (route.name === "time") {
            iconName = focused ? "alarm" : "alarm-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {role === "admin" && (
        <Tabs.Screen name="admin-dashboard" options={{ title: "Dashboard" }} />
      )}
      {/* 🔐 ADMIN ONLY */}
      <Tabs.Screen
        name="admin"
        options={{
          title: "Requests",
          href: role === "admin" ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="admin-dashboard"
        options={{
          title: "Dashboard",
          href: role === "admin" ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Create",
          href: role === "admin" ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          href: role === "admin" ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          href: role === "admin" ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          href: role ? undefined : null, // only show if logged in
          href: null,
          title: "Settings",
        }}
      />
      <Tabs.Screen
        name="edit-time"
        options={{ href: role ? undefined : null, href: null }}
      />
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="ticket" options={{ title: "Ticket" }} />
      <Tabs.Screen
        name="time"
        options={{ title: "Time", href: role === "user" ? undefined : null }}
      />
    </Tabs>
  );
}
