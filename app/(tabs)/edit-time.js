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
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // ✅ REAL DATE OBJECTS (CRITICAL)
  const [startDateObj, setStartDateObj] = useState(null);
  const [endDateObj, setEndDateObj] = useState(null);

  const [showDate, setShowDate] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

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

    if (data.date) setDate(data.date);

    // ✅ CLOCK IN (UTC → LOCAL)
    if (data.clock_in) {
      const local = new Date(data.clock_in);

      setStartDateObj(local);

      const timeStr = local.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setStartTime(timeStr);
      console.log("⏱ CLOCK IN (LOCAL):", timeStr);
    }

    // ✅ CLOCK OUT
    if (data.clock_out) {
      const local = new Date(data.clock_out);

      setEndDateObj(local);
      console.log("⏱ CLOCK OUT (LOCAL):", local);

      const timeStr = local.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setEndTime(timeStr);
      console.log("⏱ CLOCK OUT TIME (LOCAL):", timeStr);
      const d = local.toLocaleDateString("en-CA");
      setEndDate(d);
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

  // 💾 SAVE
  const saveChanges = async () => {
    const payload = {
      date,
      clock_in: startDateObj ? startDateObj.toISOString() : null,
      clock_out: endDateObj ? endDateObj.toISOString() : null,
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
                  const formatted = selected.toLocaleDateString("en-CA");
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
              value={startDateObj || new Date()}
              mode="time"
              onChange={(e, selected) => {
                setShowStart(false);
                if (selected) {
                  setStartDateObj(selected);

                  const timeStr = selected.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  setStartTime(timeStr);
                }
              }}
            />
          )}
        </>
      ) : (
        (console.log(startTime),
        (
          <TextInput
            placeholder="Start (HH:MM)"
            value={startTime}
            onChangeText={(text) => {
              setStartTime(text);

              if (date && text) {
                const local = new Date(`${date}T${text}`);
                if (!isNaN(local)) {
                  setStartDateObj(local);
                }
              }
            }}
            style={{
              backgroundColor: isDark ? "#1e1e1e" : "#fff",
              color: isDark ? "#fff" : "#000",
              padding: 12,
              borderRadius: 8,
              marginBottom: 10,
            }}
          />
        ))
      )}

      {/* 📅 END DATE */}
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
                  const formatted = selected.toLocaleDateString("en-CA");
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
              value={endDateObj || new Date()}
              mode="time"
              onChange={(e, selected) => {
                setShowEnd(false);
                if (selected) {
                  setEndDateObj(selected);

                  const timeStr = selected.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  setEndTime(timeStr);
                }
              }}
            />
          )}
        </>
      ) : (
        (console.log(endTime),
        (
          <TextInput
            placeholder="End (HH:MM)"
            value={endTime}
            onChangeText={(text) => {
              setEndTime(text);

              if (endDate && text) {
                const local = new Date(`${endDate}T${text}`);
                if (!isNaN(local)) {
                  setEndDateObj(local);
                }
              }
            }}
            style={{
              backgroundColor: isDark ? "#1e1e1e" : "#fff",
              color: isDark ? "#fff" : "#000",
              padding: 12,
              borderRadius: 8,
              marginBottom: 20,
            }}
          />
        ))
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
