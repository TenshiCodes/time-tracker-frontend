import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Text,
  TextInput,
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

  const [startDateObj, setStartDateObj] = useState(new Date());
  const [endDateObj, setEndDateObj] = useState(new Date());

  const [showDate, setShowDate] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (id) loadEntry();
  }, [id]);

  const loadEntry = async () => {
    const res = await fetch(`${API_BASE}/time/entry/${id}`);
    const data = await res.json();

    setEntry(data);

    if (data.clock_in) {
      const local = new Date(data.clock_in);

      setStartDateObj(local);

      const d = local.toLocaleDateString("en-CA");
      setDate(d);

      const h = local.getHours().toString().padStart(2, "0");
      const m = local.getMinutes().toString().padStart(2, "0");
      setStartTime(`${h}:${m}`);
    }

    if (data.clock_out) {
      const local = new Date(data.clock_out);

      setEndDateObj(local);

      const d = local.toLocaleDateString("en-CA");
      setEndDate(d);

      const h = local.getHours().toString().padStart(2, "0");
      const m = local.getMinutes().toString().padStart(2, "0");
      setEndTime(`${h}:${m}`);
    }

    setQuery(data.job_code || "");
  };

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

  // 🔥 FIXED UTC HANDLING
  const formatForSQL = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;

    const [year, month, day] = dateStr.split("-");
    const [hour, minute] = timeStr.split(":");

    const local = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    );

    return local.toISOString(); // ✅ ALWAYS UTC
  };

  const saveChanges = async () => {
    const updated = {
      ...entry,
      clock_in: formatForSQL(date, startTime),
      clock_out: formatForSQL(endDate || date, endTime),
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

      {/* START DATE */}
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
          value={startDateObj}
          mode="date"
          onChange={(e, selected) => {
            setShowDate(false);
            if (selected) {
              setStartDateObj(selected);
              setDate(selected.toLocaleDateString("en-CA"));
            }
          }}
        />
      )}

      {/* START TIME */}
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
          value={startDateObj}
          mode="time"
          onChange={(e, selected) => {
            setShowStart(false);
            if (selected) {
              setStartDateObj(selected);

              const h = selected.getHours().toString().padStart(2, "0");
              const m = selected.getMinutes().toString().padStart(2, "0");

              setStartTime(`${h}:${m}`);
            }
          }}
        />
      )}

      {/* END DATE */}
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
          value={endDateObj}
          mode="date"
          onChange={(e, selected) => {
            setShowEndDate(false);
            if (selected) {
              setEndDateObj(selected);
              setEndDate(selected.toLocaleDateString("en-CA"));
            }
          }}
        />
      )}

      {/* END TIME */}
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
          value={endDateObj}
          mode="time"
          onChange={(e, selected) => {
            setShowEnd(false);
            if (selected) {
              setEndDateObj(selected);

              const h = selected.getHours().toString().padStart(2, "0");
              const m = selected.getMinutes().toString().padStart(2, "0");

              setEndTime(`${h}:${m}`);
            }
          }}
        />
      )}

      {/* JOB SEARCH */}
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
