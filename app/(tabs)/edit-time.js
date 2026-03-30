import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from "react-native";
import { API_BASE } from "../../config";

export default function EditTime() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [entry, setEntry] = useState(null);

  // ✅ STATES
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState(""); // 🔥 NEW
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [showDate, setShowDate] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false); // 🔥 NEW

  // 🔍 JOB SEARCH
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (id) loadEntry();
  }, [id]);

  const loadEntry = async () => {
    const res = await fetch(`${API_BASE}/time/entry/${id}`);
    const data = await res.json();

    setEntry(data);

    // ✅ LOAD VALUES
    if (data.date) setDate(data.date);

    if (data.clock_in) {
      setStartTime(data.clock_in.slice(11, 16));
    }

    if (data.clock_out) {
      setEndTime(data.clock_out.slice(11, 16));
      setEndDate(data.clock_out.slice(0, 10)); // 🔥 NEW
    }

    setQuery(data.job_code || "");
  };

  // 🔍 SEARCH JOBS
  const searchJobs = async (text) => {
    setQuery(text);

    if (!text) {
      setResults([]);
      return;
    }

    const res = await fetch(`${API_BASE}/search?q=${text}`);
    const data = await res.json();

    setResults(data.slice(0, 3));
  };

  // 🧠 FORMAT FOR SQLITE
  const formatForSQL = (dateStr, timeStr) => {
    if (!dateStr || !timeStr || !timeStr.includes(":")) return null;

    const [h, m] = timeStr.split(":");

    if (h === "" || m === "") return null;

    const pad = (n) => n.toString().padStart(2, "0");

    return `${dateStr} ${pad(h)}:${pad(m)}:00`;
  };

  // 💾 SAVE
  const saveChanges = async () => {
    const updated = {
      ...entry,
      date: date,
      clock_in: formatForSQL(date, startTime),
      clock_out: formatForSQL(endDate || date, endTime), // 🔥 FIX
    };

    console.log("💾 SAVING:", updated);

    await fetch(`${API_BASE}/time/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    router.replace("/time");
  };

  if (!entry) return null;

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
          fontSize: 22,
          marginBottom: 20,
          color: isDark ? "#fff" : "#000",
        }}
      >
        Edit Time Entry
      </Text>

      {/* 📅 START DATE */}
      {Platform.OS !== "web" ? (
        <>
          <TouchableOpacity
            onPress={() => setShowDate(true)}
            style={{
              backgroundColor: isDark ? "#1e1e1e" : "#fff",
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: isDark ? "#fff" : "#000" }}>
              Date: {date || "Select Date"}
            </Text>
          </TouchableOpacity>

          {showDate && (
            <DateTimePicker
              value={date ? new Date(date) : new Date()}
              mode="date"
              onChange={(e, selected) => {
                setShowDate(false);
                if (selected) {
                  const formatted = selected.toISOString().split("T")[0];
                  setDate(formatted);
                }
              }}
            />
          )}
        </>
      ) : (
        <TextInput
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
          style={{
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            color: isDark ? "#fff" : "#000",
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
          }}
        />
      )}

      {/* ⏱ START TIME */}
      {Platform.OS !== "web" ? (
        <>
          <TouchableOpacity
            onPress={() => setShowStart(true)}
            style={{
              backgroundColor: isDark ? "#1e1e1e" : "#fff",
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: isDark ? "#fff" : "#000" }}>
              Start: {startTime || "Select Time"}
            </Text>
          </TouchableOpacity>

          {showStart && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              onChange={(e, selected) => {
                setShowStart(false);
                if (selected) {
                  const h = selected.getHours().toString().padStart(2, "0");
                  const m = selected.getMinutes().toString().padStart(2, "0");
                  setStartTime(`${h}:${m}`);
                }
              }}
            />
          )}
        </>
      ) : (
        <TextInput
          placeholder="Start (HH:MM)"
          value={startTime}
          onChangeText={setStartTime}
          style={{
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            color: isDark ? "#fff" : "#000",
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
          }}
        />
      )}

      {/* 📅 END DATE (NEW) */}
      {Platform.OS !== "web" ? (
        <>
          <TouchableOpacity
            onPress={() => setShowEndDate(true)}
            style={{
              backgroundColor: isDark ? "#1e1e1e" : "#fff",
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: isDark ? "#fff" : "#000" }}>
              End Date: {endDate || "Select Date"}
            </Text>
          </TouchableOpacity>

          {showEndDate && (
            <DateTimePicker
              value={endDate ? new Date(endDate) : new Date()}
              mode="date"
              onChange={(e, selected) => {
                setShowEndDate(false);
                if (selected) {
                  const formatted = selected.toISOString().split("T")[0];
                  setEndDate(formatted);
                }
              }}
            />
          )}
        </>
      ) : (
        <TextInput
          placeholder="End Date (YYYY-MM-DD)"
          value={endDate}
          onChangeText={setEndDate}
          style={{
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            color: isDark ? "#fff" : "#000",
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
          }}
        />
      )}

      {/* ⏱ END TIME */}
      {Platform.OS !== "web" ? (
        <>
          <TouchableOpacity
            onPress={() => setShowEnd(true)}
            style={{
              backgroundColor: isDark ? "#1e1e1e" : "#fff",
              padding: 15,
              borderRadius: 10,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: isDark ? "#fff" : "#000" }}>
              End: {endTime || "Select Time"}
            </Text>
          </TouchableOpacity>

          {showEnd && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              onChange={(e, selected) => {
                setShowEnd(false);
                if (selected) {
                  const h = selected.getHours().toString().padStart(2, "0");
                  const m = selected.getMinutes().toString().padStart(2, "0");
                  setEndTime(`${h}:${m}`);
                }
              }}
            />
          )}
        </>
      ) : (
        <TextInput
          placeholder="End (HH:MM)"
          value={endTime}
          onChangeText={setEndTime}
          style={{
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            color: isDark ? "#fff" : "#000",
            padding: 12,
            borderRadius: 8,
            marginBottom: 20,
          }}
        />
      )}

      {/* 🔍 JOB SEARCH */}
      <TextInput
        placeholder="Search Job..."
        value={query}
        onChangeText={searchJobs}
        style={{
          backgroundColor: isDark ? "#1e1e1e" : "#fff",
          color: isDark ? "#fff" : "#000",
          padding: 12,
          borderRadius: 8,
          marginBottom: 10,
        }}
      />

      {results.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => {
            setEntry({
              ...entry,
              job_code: item.code,
              item_id: item.id,
            });
            setQuery(`${item.name} (${item.code})`);
            setResults([]);
          }}
          style={{
            padding: 10,
            backgroundColor: isDark ? "#2a2a2a" : "#ddd",
            marginBottom: 5,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: isDark ? "#fff" : "#000" }}>{item.name}</Text>
          <Text style={{ color: "#888" }}>{item.code}</Text>
        </TouchableOpacity>
      ))}

      {/* SAVE */}
      <TouchableOpacity
        onPress={saveChanges}
        style={{
          backgroundColor: "#4CAF50",
          padding: 15,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}
