import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { API_BASE } from "../../config";

export default function Time() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [user, setUser] = useState(null);
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [timer, setTimer] = useState("00:00:00");

  const [job, setJob] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const [entries, setEntries] = useState([]);
  const [editing, setEditing] = useState(null);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const syncStatus = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/time/status/${userId}`);
      if (!res.ok) return;

      const data = await res.json();

      if (data.clocked_in && data.clock_in) {
        const time = new Date(data.clock_in.replace(" ", "T"));
        if (isNaN(time.getTime())) return;

        setClockedIn(true);
        setClockInTime(time);

        setActiveJob({
          id: data.item_id,
          code: data.job_code,
          name: data.job_name,
        });

        const diff = Math.floor((Date.now() - time.getTime()) / 1000);
        setTimer(formatTime(diff));
      } else {
        setClockedIn(false);
        setClockInTime(null);
        setTimer("00:00:00");
        setActiveJob(null);
      }
    } catch (err) {
      console.log("Sync error:", err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        syncStatus(user.id);
        loadEntries(user.id);
      }
    }, [user])
  );

  useEffect(() => {
    const init = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (!storedUser) return;

      const parsed = JSON.parse(storedUser);
      setUser(parsed);

      await syncStatus(parsed.id);
      await loadEntries(parsed.id);
    };

    init();
  }, []);

  useEffect(() => {
    if (!clockedIn || !clockInTime) return;

    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - clockInTime.getTime()) / 1000);
      setTimer(formatTime(diff));
    }, 1000);

    return () => clearInterval(interval);
  }, [clockedIn, clockInTime]);

  const loadEntries = async (userId) => {
    const res = await fetch(`${API_BASE}/time/${userId}`);
    const data = await res.json();
    setEntries(data);
  };

  const searchJobs = async (text) => {
    setQuery(text);

    if (!text) {
      setResults([]);
      return;
    }

    const res = await fetch(
      `${API_BASE}/search?q=${text}&user_id=${user?.id}`
    );
    const data = await res.json();

    setResults(data.slice(0, 3));
  };

  const handleClockIn = async () => {
    if (!user) return;

    await fetch(`${API_BASE}/time/clock-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        item_id: job?.id ?? null,
      }),
    });

    const now = new Date();

    setActiveJob(job);
    setClockedIn(true);
    setClockInTime(now);
    setTimer("00:00:00");

    setJob(null);
    setQuery("");
    setResults([]);

    await loadEntries(user.id);
  };

  const handleClockOut = async () => {
    if (!user) return;

    await fetch(`${API_BASE}/time/clock-out?user_id=${user.id}`, {
      method: "POST",
    });

    setClockedIn(false);
    setClockInTime(null);
    setTimer("00:00:00");
    setActiveJob(null);

    await loadEntries(user.id);
  };

  const handleAddToCalendar = async (entryId) => {
    const url = `${API_BASE}/calendar/event/${entryId}`;

    if (Platform.OS === "web") {
      window.open(url, "_blank");
      return;
    }

    const fileUri = FileSystem.documentDirectory + `event_${entryId}.ics`;
    const { uri } = await FileSystem.downloadAsync(url, fileUri);
    await Sharing.shareAsync(uri);
  };

  const saveEdit = async () => {
    if (!editing) return;

    await fetch(`${API_BASE}/time/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });

    setEditing(null);
    await loadEntries(user.id);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDark ? "#121212" : "#f2f2f2" }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={{ fontSize: 26, textAlign: "center", color: isDark ? "#fff" : "#000" }}>
        Time Tracking
      </Text>

      {/* CLOCK BUTTON */}
      {!clockedIn ? (
        <TouchableOpacity onPress={handleClockIn} style={{ backgroundColor: "#4CAF50", padding: 15, borderRadius: 10 }}>
          <Text style={{ color: "#fff", textAlign: "center" }}>CLOCK IN</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={handleClockOut} style={{ backgroundColor: "#E53935", padding: 15, borderRadius: 10 }}>
          <Text style={{ color: "#fff", textAlign: "center" }}>CLOCK OUT</Text>
        </TouchableOpacity>
      )}

      {/* TIMER */}
      <Text style={{ fontSize: 32, textAlign: "center", color: isDark ? "#fff" : "#000" }}>
        {clockedIn ? `⏱ ${timer}` : ""}
      </Text>

      {/* ENTRIES */}
      {entries.map((entry) => (
        <View key={entry.id} style={{ padding: 15 }}>
          <TouchableOpacity onPress={() => setEditing(entry)}>
            <Text style={{ color: isDark ? "#fff" : "#000" }}>{entry.date}</Text>
          </TouchableOpacity>

          {entry.clock_out && (
            <TouchableOpacity onPress={() => handleAddToCalendar(entry.id)}>
              <Text style={{ color: "#4caf50" }}>Add to Calendar</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* ✅ EDIT PANEL RESTORED */}
      {editing && (
        <View style={{ marginTop: 20, padding: 15, borderRadius: 10, backgroundColor: isDark ? "#1e1e1e" : "#fff" }}>
          <Text style={{ color: isDark ? "#fff" : "#000" }}>Edit Entry</Text>

          <TextInput
            value={editing.clock_in || ""}
            onChangeText={(text) => setEditing({ ...editing, clock_in: text })}
            style={{ backgroundColor: "#ddd", marginBottom: 10 }}
          />

          <TextInput
            value={editing.clock_out || ""}
            onChangeText={(text) => setEditing({ ...editing, clock_out: text })}
            style={{ backgroundColor: "#ddd", marginBottom: 10 }}
          />

          <TouchableOpacity onPress={saveEdit} style={{ backgroundColor: "#4CAF50", padding: 10, borderRadius: 8 }}>
            <Text style={{ color: "#fff", textAlign: "center" }}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setEditing(null)} style={{ backgroundColor: "gray", padding: 10, borderRadius: 8 }}>
            <Text style={{ color: "#fff", textAlign: "center" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}