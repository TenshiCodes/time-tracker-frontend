console.log("🔥 SETTINGS SCREEN LOADED");
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
  Platform,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { API_BASE } from "../../config"; // ✅ ADD THIS

const exportData = async () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // ✅ GET USER OBJECT
    const userStr = await AsyncStorage.getItem("user");

    if (!userStr) {
      alert("User not logged in");
      return;
    }

    const user = JSON.parse(userStr);
    const userId = user.id;

    const url = `${API_BASE}/export/time?user_id=${userId}&tz=${encodeURIComponent(tz)}`;

    console.log("📤 EXPORT URL:", url);

    // 🌐 WEB
    if (Platform.OS === "web") {
      window.open(url, "_blank");
      return;
    }

    // 📱 MOBILE
    const fileUri = FileSystem.documentDirectory + "time_entries.xlsx";

    const download = await FileSystem.downloadAsync(url, fileUri);

    console.log("📥 DOWNLOAD RESULT:", download);

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      alert("Sharing not available on this device");
      return;
    }

    await Sharing.shareAsync(download.uri);
  } catch (err) {
    console.error("❌ Export failed:", err);
  }
};

export default function Settings() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null); // ✅ ADD
  const [emailNotif, setEmailNotif] = useState(false);
  const [phoneNotif, setPhoneNotif] = useState(false);

  // 🔥 LOAD USER + SETTINGS
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");

        if (storedUser) {
          const parsed = JSON.parse(storedUser);

          setRole(parsed.role);
          setUserId(parsed.id); // ✅ IMPORTANT

          // 🔥 FETCH CURRENT SETTINGS FROM BACKEND
          const res = await fetch(`${API_BASE}/users`);
          const users = await res.json();

          const currentUser = users.find((u) => u.id === parsed.id);
          console.log("👤 LOADED USER:", parsed);
          if (currentUser) {
            setEmailNotif(!!currentUser.email_notifications);
            setPhoneNotif(!!currentUser.sms_notifications);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadUser();
  }, []);

  const saveSettings = async (emailValue, phoneValue) => {
    try {
      const storedUser = await AsyncStorage.getItem("user");

      if (!storedUser) {
        console.log("❌ No user found in storage");
        return;
      }

      const parsed = JSON.parse(storedUser);
      const id = parsed.id;

      if (!id) {
        console.log("❌ Missing user ID:", parsed);
        return;
      }

      console.log("✅ USER ID:", id);
      console.log("Saving:", emailValue, phoneValue);

      await fetch(`${API_BASE}/users/${id}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_notifications: emailValue,
          sms_notifications: phoneValue,
        }),
      });
    } catch (err) {
      console.error("SAVE ERROR:", err);
    }
  };
  const emailExport = async () => {
    try {
      const storedUser = await AsyncStorage.getItem("user");
      const user = JSON.parse(storedUser);

      console.log("📧 USER:", user);

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const res = await fetch(
        `${API_BASE}/export/email/${user?.id}?tz=${encodeURIComponent(tz)}`,
        { method: "POST" },
      );

      const text = await res.text(); // 👈 important

      console.log("📧 RESPONSE STATUS:", res.status);
      console.log("📧 RESPONSE BODY:", text);

      if (!res.ok) {
        alert("Server error sending email");
        return;
      }

      alert("📧 Email sent!");
    } catch (err) {
      console.error("❌ Email export error:", err);
      alert("Failed to send email");
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
        Notification Settings
      </Text>

      {/* 📧 EMAIL */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ color: isDark ? "#fff" : "#000" }}>
          Email Notifications
        </Text>

        <Text
          style={{
            color: isDark ? "#ccc" : "#555",
            marginBottom: 10,
            fontSize: 13,
          }}
        >
          {role === "admin"
            ? "You will receive email alerts when new tickets are submitted."
            : "You will receive email updates when your ticket is approved or denied."}
        </Text>

        <Switch
          value={emailNotif}
          onValueChange={(value) => {
            console.log("📧 EMAIL TOGGLED:", value); // ✅ HERE
            setEmailNotif(value);
            saveSettings(value, phoneNotif); // make sure this exists
          }}
        />
      </View>

      {/* 📱 SMS 
      <View>
        <Text style={{ color: isDark ? "#fff" : "#000" }}>
          SMS Notifications
        </Text>

        <Text
          style={{
            color: isDark ? "#ccc" : "#555",
            marginBottom: 10,
            fontSize: 13,
          }}
        >
          {role === "admin"
            ? "You will receive SMS alerts when new tickets are submitted."
            : "You will receive SMS updates when your ticket is approved or denied."}
        </Text>
        
        <Switch
          value={phoneNotif}
          onValueChange={(value) => {
            console.log("📱 SMS TOGGLED:", value); 
            setPhoneNotif(value);
            saveSettings(emailNotif, value);
          }} 
        />
      </View>*/}
      <TouchableOpacity
        onPress={exportData}
        style={{
          backgroundColor: "#2196F3",
          padding: 15,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Export Time Entries
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={emailExport}
        style={{
          backgroundColor: "#FF9800",
          padding: 15,
          borderRadius: 10,
          marginTop: 10,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Email Time Entries
        </Text>
      </TouchableOpacity>
    </View>
  );
}
