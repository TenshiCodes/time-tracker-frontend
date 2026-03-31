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

  // ✅ LOAD ENTRY (UTC → LOCAL)
  const loadEntry = async () => {
    const res = await fetch(`${API_BASE}/time/entry/${id}`);
    const data = await res.json();

    setEntry(data);

    if (data.date) setDate(data.date);

    if (data.clock_in) {
      const local = new Date(data.clock_in);
      setStartTime(
        local.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    }

    if (data.clock_out) {
      const local = new Date(data.clock_out);

      setEndTime(
        local.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );

      setEndDate(local.toLocaleDateString("en-CA"));
    }

    setQuery(data.job_code || "");
  };

  // 🔍 SEARCH JOBS
  const searchJobs = async (text) => {
    setQuery(text);
    if (!text) return setResults([]);

    const res = await fetch(`${API_BASE}/search?q=${text}`);
    const data = await res.json();
    setResults(data.slice(0, 3));
  };

  // ✅ BUILD LOCAL DATE (FIX)
  const buildDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;

    const [y, mo, d] = dateStr.split("-");
    const [h, m] = timeStr.split(":");

    return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(m));
  };

  // 💾 SAVE (FIXED)
  const saveChanges = async () => {
    const start = buildDateTime(date, startTime);
    const end = buildDateTime(endDate, endTime);

    const payload = {
      date,
      clock_in: start ? start.toISOString() : null,
      clock_out: end ? end.toISOString() : null,
    };

    console.log("💾 SAVING:", payload);

    await fetch(`${API_BASE}/time/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

      {/* DATE */}
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
                if (selected) setDate(selected.toLocaleDateString("en-CA"));
              }}
            />
          )}
        </>
      ) : (
        <TextInput
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

      {/* START TIME */}
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
                  const h = selected.getHours();
                  const m = selected.getMinutes();

                  const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                  setStartTime(timeStr);
                }
              }}
            />
          )}
        </>
      ) : (
        <TextInput
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

      {/* END DATE */}
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
                if (selected) setEndDate(selected.toLocaleDateString("en-CA"));
              }}
            />
          )}
        </>
      ) : (
        <TextInput
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

      {/* END TIME */}
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
                  const h = selected.getHours();
                  const m = selected.getMinutes();

                  const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                  setEndTime(timeStr);
                }
              }}
            />
          )}
        </>
      ) : (
        <TextInput
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

      {/* SAVE */}
      <TouchableOpacity
        onPress={saveChanges}
        style={{ backgroundColor: "#4CAF50", padding: 15, borderRadius: 10 }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}
