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

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const [startDateObj, setStartDateObj] = useState(null);
  const [endDateObj, setEndDateObj] = useState(null);

  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [showDate, setShowDate] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  useEffect(() => {
    if (id) loadEntry();
  }, [id]);

  const parseUTC = (str) => {
    if (!str) return null;
    return new Date(str.replace(" ", "T"));
  };

  const loadEntry = async () => {
    const res = await fetch(`${API_BASE}/time/entry/${id}`);
    const data = await res.json();

    setEntry(data);

    // START
    if (data.clock_in) {
      const d = parseUTC(data.clock_in);
      setStartDateObj(d);

      setDate(d.toLocaleDateString("en-CA"));
      setStartTime(
        `${d.getHours().toString().padStart(2, "0")}:${d
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      );
    }

    // END
    if (data.clock_out) {
      const d = parseUTC(data.clock_out);
      setEndDateObj(d);

      setEndDate(d.toLocaleDateString("en-CA"));
      setEndTime(
        `${d.getHours().toString().padStart(2, "0")}:${d
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      );
    }
  };

  // 🔍 SEARCH JOBS (FIXED)
  const searchJobs = async (text) => {
    setQuery(text);

    if (!text || !entry?.user_id) {
      setResults([]);
      return;
    }

    const res = await fetch(
      `${API_BASE}/search?q=${text}&user_id=${entry.user_id}`
    );
    const data = await res.json();

    setResults(data.slice(0, 3));
  };

  const formatForSQL = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;

    const [y, mo, d] = dateStr.split("-");
    const [h, m] = timeStr.split(":");

    return new Date(y, mo - 1, d, h, m).toISOString();
  };

  const saveChanges = async () => {
    const updated = {
      ...entry,
      date,
      clock_in: formatForSQL(date, startTime),
      clock_out: formatForSQL(endDate || date, endTime),
    };

    await fetch(`${API_BASE}/time/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    router.replace("/time");
  };

  if (!entry) return null;

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: isDark ? "#121212" : "#f2f2f2" }}>
      <Text style={{ fontSize: 22, marginBottom: 20, color: isDark ? "#fff" : "#000" }}>
        Edit Time Entry
      </Text>

      {/* START DATE */}
      <TouchableOpacity onPress={() => setShowDate(true)} style={{ padding: 15 }}>
        <Text style={{ color: isDark ? "#fff" : "#000" }}>
          Start Date: {date}
        </Text>
      </TouchableOpacity>

      {showDate && (
        <DateTimePicker
          value={startDateObj || new Date()}
          mode="date"
          onChange={(e, selected) => {
            setShowDate(false);
            if (!selected) return;

            const updated = new Date(startDateObj || new Date());
            updated.setFullYear(selected.getFullYear());
            updated.setMonth(selected.getMonth());
            updated.setDate(selected.getDate());

            setStartDateObj(updated);
            setDate(updated.toLocaleDateString("en-CA"));
          }}
        />
      )}

      {/* START TIME */}
      <TouchableOpacity onPress={() => setShowStart(true)} style={{ padding: 15 }}>
        <Text style={{ color: isDark ? "#fff" : "#000" }}>
          Start: {startTime}
        </Text>
      </TouchableOpacity>

      {showStart && (
        <DateTimePicker
          value={startDateObj || new Date()}
          mode="time"
          onChange={(e, selected) => {
            setShowStart(false);
            if (!selected) return;

            const updated = new Date(startDateObj || new Date());
            updated.setHours(selected.getHours());
            updated.setMinutes(selected.getMinutes());

            setStartDateObj(updated);
            setStartTime(
              `${updated.getHours().toString().padStart(2, "0")}:${updated
                .getMinutes()
                .toString()
                .padStart(2, "0")}`
            );
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

      {/* CURRENT JOB */}
      {entry?.job_code && (
        <Text style={{ color: "#4caf50", marginBottom: 10 }}>
          {entry.job_name} ({entry.job_code})
        </Text>
      )}

      {/* RESULTS (FIXED FIELD NAMES) */}
      {results.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => {
            setEntry({
              ...entry,
              job_code: item.job_code,
              job_name: item.job_name,
              item_id: item.id,
            });

            setQuery(`${item.job_name} (${item.job_code})`);
            setResults([]);
          }}
          style={{
            padding: 10,
            backgroundColor: isDark ? "#2a2a2a" : "#ddd",
            marginBottom: 5,
            borderRadius: 6,
          }}
        >
          <Text style={{ color: isDark ? "#fff" : "#000" }}>
            {item.job_name}
          </Text>
          <Text style={{ color: "#888" }}>{item.job_code}</Text>
        </TouchableOpacity>
      ))}

      {/* SAVE */}
      <TouchableOpacity
        onPress={saveChanges}
        style={{
          backgroundColor: "#4CAF50",
          padding: 15,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Save Changes
        </Text>
      </TouchableOpacity>
    </View>
  );
}