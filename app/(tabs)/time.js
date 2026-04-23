import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
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
  const router = useRouter();

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

  // ✅ SINGLE SOURCE OF TRUTH FOR JOB SHAPE
  const normalizeJob = (item) => ({
    id: item?.id ?? null,
    name: item?.job_name ?? item?.name ?? "",
    code: item?.job_code ?? item?.code ?? "",
  });

  // ⏱ FORMAT TIMER
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 🔄 SYNC STATUS FROM BACKEND
  const syncStatus = async (userId) => {
    try {
      const res = await fetch(`${API_BASE}/time/status/${userId}`);
      if (!res.ok) return;

      const data = await res.json();

      if (data.clocked_in && data.clock_in) {
        const time = new Date(data.clock_in); // ✅ FIXED

        if (isNaN(time.getTime())) return;

        setClockedIn(true);
        setClockInTime(time);
        setActiveJob(normalizeJob(data));

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

  // 🔄 LOAD ENTRIES
  const loadEntries = async (userId) => {
    const res = await fetch(`${API_BASE}/time/${userId}`);
    const data = await res.json();
    setEntries(data);
  };

  // 🔄 RELOAD ON FOCUS
  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        syncStatus(user.id);
        loadEntries(user.id);
      }
    }, [user])
  );

  // 🔥 INIT
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

  // ⏱ LIVE TIMER
  useEffect(() => {
    if (!clockedIn || !clockInTime) return;

    const interval = setInterval(() => {
      const diff = Math.floor(
        (Date.now() - clockInTime.getTime()) / 1000
      );
      setTimer(formatTime(diff));
    }, 1000);

    return () => clearInterval(interval);
  }, [clockedIn, clockInTime]);

  // 🔍 SEARCH JOBS
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

    setResults(data.map(normalizeJob).slice(0, 3));
  };

  // 🟢 CLOCK IN
  const handleClockIn = async () => {
    if (!user) return;

    await fetch(`${API_BASE}/time/clock-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        item_id: job?.id ?? null,
      }),
    });

    // ✅ ALWAYS SYNC FROM BACKEND
    await syncStatus(user.id);
    await loadEntries(user.id);

    setJob(null);
    setQuery("");
    setResults([]);
  };

  // 🔴 CLOCK OUT
  const handleClockOut = async () => {
    if (!user) return;

    await fetch(`${API_BASE}/time/clock-out?user_id=${user.id}`, {
      method: "POST",
    });

    await syncStatus(user.id);
    await loadEntries(user.id);
  };

  // 📅 ADD TO CALENDAR
  const handleAddToCalendar = async (entryId) => {
    try {
      const url = `${API_BASE}/calendar/event/${entryId}`;

      if (Platform.OS === "web") {
        window.open(url, "_blank");
        return;
      }

      const fileUri = FileSystem.documentDirectory + `event_${entryId}.ics`;
      const { uri } = await FileSystem.downloadAsync(url, fileUri);

      if (!(await Sharing.isAvailableAsync())) {
        alert("Sharing not available");
        return;
      }

      await Sharing.shareAsync(uri);
    } catch (err) {
      console.error(err);
      alert("Failed to export calendar");
    }
  };

  // ✏️ SAVE EDIT
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
      style={{
        flex: 1,
        backgroundColor: isDark ? "#121212" : "#f2f2f2",
      }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text
        style={{
          fontSize: 26,
          textAlign: "center",
          marginBottom: 20,
          color: isDark ? "#fff" : "#000",
        }}
      >
        Time Tracking
      </Text>

      {/* SEARCH */}
      {!clockedIn && (
        <>
          <TextInput
            placeholder="Search Job Code (optional)..."
            placeholderTextColor="#888"
            value={query}
            editable={!job}
            onChangeText={searchJobs}
            style={{
              backgroundColor: isDark ? "#1e1e1e" : "#fff",
              color: isDark ? "#fff" : "#000",
              padding: 12,
              borderRadius: 10,
              marginBottom: 10,
            }}
          />

          {results.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                setJob(item);
                setActiveJob(item);
                setQuery(`${item.name} (${item.code})`);
                setResults([]);
              }}
              style={{
                padding: 10,
                backgroundColor: isDark ? "#2a2a2a" : "#ddd",
                marginBottom: 5,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: isDark ? "#fff" : "#000" }}>
                {item.name}
              </Text>
              <Text style={{ color: "#888" }}>{item.code}</Text>
            </TouchableOpacity>
          ))}

          {job && job.name && job.code && (
            <Text style={{ color: "#4caf50" }}>
              Selected: {job.name} ({job.code})
            </Text>
          )}
        </>
      )}

      {/* BUTTON */}
      {!clockedIn ? (
        <TouchableOpacity
          onPress={handleClockIn}
          style={{
            backgroundColor: "#4CAF50",
            padding: 15,
            borderRadius: 10,
            marginTop: 20,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            CLOCK IN
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleClockOut}
          style={{
            backgroundColor: "#E53935",
            padding: 15,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            CLOCK OUT
          </Text>
        </TouchableOpacity>
      )}

      {/* TIMER */}
      <Text style={{ fontSize: 32, textAlign: "center", color: isDark ? "#fff" : "#000" }}>
        {clockedIn ? `⏱ ${timer}` : ""}
      </Text>

      {/* ACTIVE JOB */}
      {clockedIn && activeJob?.code && (
        <Text style={{ textAlign: "center", color: "#4caf50" }}>
          {activeJob.name} ({activeJob.code})
        </Text>
      )}

      {/* ENTRIES */}
      <View style={{ marginTop: 20, height: 300 }}>
        <ScrollView>
          {entries.map((entry) => (
            <View key={entry.id} style={{ padding: 15 }}>
              <TouchableOpacity
                onPress={() => router.push(`/edit-time?id=${entry.id}`)}
              >
                <Text>{entry.date}</Text>
                <Text>
                  {new Date(entry.clock_in).toLocaleString()} →{" "}
                  {entry.clock_out
                    ? new Date(entry.clock_out).toLocaleString()
                    : "Active"}
                </Text>

                <Text style={{ color: "#4caf50" }}>
                  {entry.job_name
                    ? `${entry.job_name} (${entry.job_code})`
                    : entry.job_code || "No Job"}
                </Text>
              </TouchableOpacity>

              {entry.clock_out && (
                <TouchableOpacity
                  onPress={() => handleAddToCalendar(entry.id)}
                  style={{
                    marginTop: 10,
                    backgroundColor: "#319db6",
                    padding: 8,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>
                    📅 Add to Calendar
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}