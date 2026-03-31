import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from "react-native";
import { API_BASE } from "../../config";

export default function EditTime() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [entry, setEntry] = useState(null);

  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [showDate, setShowDate] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (id) loadEntry();
  }, [id]);

  // 🔥 LOAD ENTRY
  const loadEntry = async () => {
    console.log("🚀 Loading entry:", id);

    const res = await fetch(`${API_BASE}/time/entry/${id}`);
    const data = await res.json();

    console.log("📦 RAW DATA FROM BACKEND:", data);

    setEntry(data);

    if (data.date) {
      console.log("📅 Setting start date:", data.date);
      setDate(data.date);
    }

    // CLOCK IN (UTC → LOCAL)
    if (data.clock_in) {
      const local = new Date(data.clock_in);

      console.log("🕐 CLOCK IN RAW:", data.clock_in);
      console.log("🕐 CLOCK IN LOCAL:", local.toString());

      const h = local.getHours().toString().padStart(2, "0");
      const m = local.getMinutes().toString().padStart(2, "0");

      console.log("🕐 Parsed start time:", `${h}:${m}`);

      setStartTime(`${h}:${m}`);
    }

    // CLOCK OUT
    if (data.clock_out) {
      const local = new Date(data.clock_out);

      console.log("🕐 CLOCK OUT RAW:", data.clock_out);
      console.log("🕐 CLOCK OUT LOCAL:", local.toString());

      const h = local.getHours().toString().padStart(2, "0");
      const m = local.getMinutes().toString().padStart(2, "0");

      const d = local.toLocaleDateString("en-CA");

      console.log("🕐 Parsed end time:", `${h}:${m}`);
      console.log("📅 Parsed end date:", d);

      setEndTime(`${h}:${m}`);
      setEndDate(d);
    }

    setQuery(data.job_code || "");
  };

  // 🔍 SEARCH JOBS
  const searchJobs = async (text) => {
    console.log("🔍 Searching jobs:", text);

    setQuery(text);

    if (!text) {
      setResults([]);
      return;
    }

    const res = await fetch(`${API_BASE}/search?q=${text}`);
    const data = await res.json();

    console.log("📦 Job results:", data);

    setResults(data.slice(0, 3));
  };

  // 🧠 LOCAL → UTC
  const formatForSQL = (dateStr, timeStr) => {
    console.log("🧠 formatForSQL INPUT:", dateStr, timeStr);

    if (!dateStr || !timeStr || !timeStr.includes(":")) {
      console.log("❌ Invalid date/time input");
      return null;
    }

    const [year, month, day] = dateStr.split("-");
    const [hour, minute] = timeStr.split(":");

    const local = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    );

    console.log("🌍 LOCAL DATE OBJECT:", local.toString());
    console.log("🌍 UTC ISO:", local.toISOString());

    return local.toISOString();
  };

  // 💾 SAVE
  const saveChanges = async () => {
    const updated = {
      ...entry,
      date: date,
      clock_in: formatForSQL(date, startTime),
      clock_out: formatForSQL(endDate || date, endTime),
    };

    console.log("💾 FINAL PAYLOAD:", updated);

    await fetch(`${API_BASE}/time/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    console.log("✅ Saved successfully");

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
              const formatted = selected.toLocaleDateString("en-CA");
              console.log("📅 Selected start date:", formatted);
              setDate(formatted);
            }
          }}
        />
      )}

      {/* ⏱ START TIME */}
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
          value={startTime ? new Date(`${date}T${startTime}:00`) : new Date()}
          mode="time"
          onChange={(e, selected) => {
            setShowStart(false);
            if (selected) {
              const h = selected.getHours().toString().padStart(2, "0");
              const m = selected.getMinutes().toString().padStart(2, "0");

              console.log("🕐 Selected start time:", `${h}:${m}`);

              setStartTime(`${h}:${m}`);
            }
          }}
        />
      )}

      {/* 📅 END DATE */}
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
              const formatted = selected.toLocaleDateString("en-CA");
              console.log("📅 Selected end date:", formatted);
              setEndDate(formatted);
            }
          }}
        />
      )}

      {/* ⏱ END TIME */}
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
          value={
            endTime ? new Date(`${endDate || date}T${endTime}:00`) : new Date()
          }
          mode="time"
          onChange={(e, selected) => {
            setShowEnd(false);
            if (selected) {
              const h = selected.getHours().toString().padStart(2, "0");
              const m = selected.getMinutes().toString().padStart(2, "0");

              console.log("🕐 Selected end time:", `${h}:${m}`);

              setEndTime(`${h}:${m}`);
            }
          }}
        />
      )}

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
