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
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [entry, setEntry] = useState(null);

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
  const searchJobs = async (text) => {
    setQuery(text);

    if (!text) {
      setResults([]);
      return;
    }

    if (!entry?.user_id) return;

      const res = await fetch(
        `${API_BASE}/search?q=${text}&user_id=${entry.user_id}`
      );
    const data = await res.json();

    setResults(data.slice(0, 3));
  };
  const parseUTC = (str) => {
    if (!str) return null;

    // normalize space → T (safe)
    const normalized = str.replace(" ", "T");

    const d = new Date(normalized);

    return d;
  };

  const loadEntry = async () => {
    const res = await fetch(`${API_BASE}/time/entry/${id}`);
    const data = await res.json();

    setEntry(data);
    // 🔍 SEARCH JOBS

    // ✅ START DATE
    if (data.clock_in) {
      const local = parseUTC(data.clock_in);

      setStartDateObj(local);

      const d = local.toLocaleDateString("en-CA");
      setDate(d);

      const h = local.getHours().toString().padStart(2, "0");
      const m = local.getMinutes().toString().padStart(2, "0");

      setStartTime(`${h}:${m}`);
    }

    // ✅ END DATE
    if (data.clock_out) {
      const local = parseUTC(data.clock_out);

      setEndDateObj(local);

      const d = local.toLocaleDateString("en-CA");
      setEndDate(d);

      const h = local.getHours().toString().padStart(2, "0");
      const m = local.getMinutes().toString().padStart(2, "0");

      setEndTime(`${h}:${m}`);
    }
  };

  // 💾 SAVE
  const formatForSQL = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return null;

    const [y, mo, d] = dateStr.split("-");
    const [h, m] = timeStr.split(":");

    const local = new Date(y, mo - 1, d, h, m);

    return local.toISOString();
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
              Start Date: {date || "Select Date"}
            </Text>
          </TouchableOpacity>

          {showDate && (
            <DateTimePicker
              value={startDateObj || new Date()}
              mode="date"
              onChange={(e, selected) => {
                setShowDate(false);
                if (selected && startDateObj) {
                  // 🔥 MERGE date into existing Date
                  const updated = new Date(startDateObj);
                  updated.setFullYear(selected.getFullYear());
                  updated.setMonth(selected.getMonth());
                  updated.setDate(selected.getDate());

                  setStartDateObj(updated);

                  const d = updated.toLocaleDateString("en-CA");
                  setDate(d);
                }
              }}
            />
          )}
        </>
      ) : (
        <TextInput
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={(text) => {
            setDate(text);

            if (!startDateObj || !text.includes("-")) return;

            const [y, m, d] = text.split("-");

            const updated = new Date(startDateObj);
            updated.setFullYear(Number(y));
            updated.setMonth(Number(m) - 1);
            updated.setDate(Number(d));

            setStartDateObj(updated);
          }}
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
                if (selected && startDateObj) {
                  // 🔥 MERGE time into existing date
                  const updated = new Date(startDateObj);
                  updated.setHours(selected.getHours());
                  updated.setMinutes(selected.getMinutes());

                  setStartDateObj(updated);

                  const h = updated.getHours().toString().padStart(2, "0");
                  const m = updated.getMinutes().toString().padStart(2, "0");

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
          onChangeText={(text) => {
            setStartTime(text);

            if (!text.includes(":") || !startDateObj) return;

            const [h, m] = text.split(":");

            const updated = new Date(startDateObj);
            updated.setHours(Number(h));
            updated.setMinutes(Number(m));

            setStartDateObj(updated);
          }}
          style={{
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            color: isDark ? "#fff" : "#000",
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
          }}
        />
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
              value={endDateObj || new Date()}
              mode="date"
              onChange={(e, selected) => {
                setShowEndDate(false);
                if (selected && endDateObj) {
                  const updated = new Date(endDateObj);
                  updated.setFullYear(selected.getFullYear());
                  updated.setMonth(selected.getMonth());
                  updated.setDate(selected.getDate());

                  setEndDateObj(updated);

                  const d = updated.toLocaleDateString("en-CA");
                  setEndDate(d);
                }
              }}
            />
          )}
        </>
      ) : (
        <TextInput
          placeholder="YYYY-MM-DD"
          value={endDate}
          onChangeText={(text) => {
            setEndDate(text);

            if (!endDateObj || !text.includes("-")) return;

            const [y, m, d] = text.split("-");

            const updated = new Date(endDateObj);
            updated.setFullYear(Number(y));
            updated.setMonth(Number(m) - 1);
            updated.setDate(Number(d));

            setEndDateObj(updated);
          }}
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
                if (selected && endDateObj) {
                  // 🔥 MERGE time into existing date
                  const updated = new Date(endDateObj);
                  updated.setHours(selected.getHours());
                  updated.setMinutes(selected.getMinutes());

                  setEndDateObj(updated);

                  const h = updated.getHours().toString().padStart(2, "0");
                  const m = updated.getMinutes().toString().padStart(2, "0");

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
          onChangeText={(text) => {
            setEndTime(text);

            if (!text.includes(":") || !endDateObj) return;

            const [h, m] = text.split(":");

            const updated = new Date(endDateObj);
            updated.setHours(Number(h));
            updated.setMinutes(Number(m));

            setEndDateObj(updated);
          }}
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

        <TouchableOpacity
          onPress={() => {
            const normalized = {
              job_code: item.job_code ?? item.code ?? "",
              job_name: item.job_name ?? item.name ?? "",
              item_id: item.id ?? null,
            };

            setEntry({
              ...(entry || {}),
              ...normalized,
            });

            setQuery(
              `${normalized.job_name} (${normalized.job_code})`,
            );

            setResults([]);
          }}
          style={{
            backgroundColor: "#999",
            padding: 8,
            borderRadius: 6,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            Clear Job
          </Text>
        </TouchableOpacity>
      
      {Array.isArray(results) &&
        results.length > 0 &&
        results.map((item, index) => {
          if (!item) return null;

          return (
            <TouchableOpacity
              key={item.id ?? index}
              onPress={() => {
                setEntry({
                  ...(entry || {}),
                  job_code: null,
                  job_name: null,
                  item_id: null,
                })

                setQuery(
                  `${item.job_name || "Unknown"} (${item.job_code || "No Code"})`,
                );

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
                {item.job_name || "No Name"}
              </Text>
              <Text style={{ color: "#888" }}>{item.job_code || "No Code"}</Text>
            </TouchableOpacity>
          );
        })}
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
