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

  // 🔥 FORCE UTC PARSE
  const parseUTC = (str) => {
    if (!str) return null;

    const fixed = str.endsWith("Z") ? str : str + "Z";
    const d = new Date(fixed);

    console.log("🧪 PARSE UTC");
    console.log("RAW:", str);
    console.log("FIXED:", fixed);
    console.log("LOCAL:", d.toString());

    return d;
  };

  const loadEntry = async () => {
    console.log("🚀 Loading entry:", id);

    const res = await fetch(`${API_BASE}/time/entry/${id}`);
    const data = await res.json();

    console.log("📦 BACKEND:", data);

    setEntry(data);
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
    // ✅ START DATE
    if (data.clock_in) {
      const local = parseUTC(data.clock_in);

      setStartDateObj(local);

      const d = local.toLocaleDateString("en-CA");
      console.log("📅 START DATE:", d);

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
      console.log("📅 END DATE:", d);

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

    console.log("💾 LOCAL:", local.toString());
    console.log("💾 UTC:", local.toISOString());

    return local.toISOString();
  };

  const saveChanges = async () => {
    const updated = {
      ...entry,
      date,
      clock_in: formatForSQL(date, startTime),
      clock_out: formatForSQL(endDate || date, endTime),
    };

    console.log("💾 FINAL:", updated);

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
                  console.log("📅 PICK START DATE:", selected.toString());

                  // 🔥 MERGE date into existing Date
                  const updated = new Date(startDateObj);
                  updated.setFullYear(selected.getFullYear());
                  updated.setMonth(selected.getMonth());
                  updated.setDate(selected.getDate());

                  console.log("✅ MERGED START DATE:", updated.toString());

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
            console.log("⌨️ WEB START DATE:", text);

            setDate(text);

            if (!startDateObj || !text.includes("-")) return;

            const [y, m, d] = text.split("-");

            const updated = new Date(startDateObj);
            updated.setFullYear(Number(y));
            updated.setMonth(Number(m) - 1);
            updated.setDate(Number(d));

            console.log("🧠 UPDATED startDateObj DATE:", updated.toString());

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
                  console.log("🕐 PICK START:", selected.toString());

                  // 🔥 MERGE time into existing date
                  const updated = new Date(startDateObj);
                  updated.setHours(selected.getHours());
                  updated.setMinutes(selected.getMinutes());

                  console.log("✅ MERGED START:", updated.toString());

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
            console.log("⌨️ WEB START:", text);

            setStartTime(text);

            if (!text.includes(":") || !startDateObj) return;

            const [h, m] = text.split(":");

            const updated = new Date(startDateObj);
            updated.setHours(Number(h));
            updated.setMinutes(Number(m));

            console.log("🧠 UPDATED startDateObj:", updated.toString());

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
                  console.log("📅 PICK END DATE:", selected.toString());

                  const updated = new Date(endDateObj);
                  updated.setFullYear(selected.getFullYear());
                  updated.setMonth(selected.getMonth());
                  updated.setDate(selected.getDate());

                  console.log("✅ MERGED END DATE:", updated.toString());

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
            console.log("⌨️ WEB END DATE:", text);

            setEndDate(text);

            if (!endDateObj || !text.includes("-")) return;

            const [y, m, d] = text.split("-");

            const updated = new Date(endDateObj);
            updated.setFullYear(Number(y));
            updated.setMonth(Number(m) - 1);
            updated.setDate(Number(d));

            console.log("🧠 UPDATED endDateObj DATE:", updated.toString());

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
                  console.log("🕐 PICK END:", selected.toString());

                  // 🔥 MERGE time into existing date
                  const updated = new Date(endDateObj);
                  updated.setHours(selected.getHours());
                  updated.setMinutes(selected.getMinutes());

                  console.log("✅ MERGED END:", updated.toString());

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
            console.log("⌨️ WEB END:", text);

            setEndTime(text);

            if (!text.includes(":") || !endDateObj) return;

            const [h, m] = text.split(":");

            const updated = new Date(endDateObj);
            updated.setHours(Number(h));
            updated.setMinutes(Number(m));

            console.log("🧠 UPDATED endDateObj:", updated.toString());

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
      {Array.isArray(results) &&
        results.length > 0 &&
        results.map((item, index) => {
          if (!item) return null;

          return (
            <TouchableOpacity
              key={item.id ?? index}
              onPress={() => {
                console.log("🟢 SELECTED ITEM:", item);

                setEntry({
                  ...(entry || {}),
                  job_code: item.code || "",
                  item_id: item.id ?? null,
                });

                setQuery(
                  `${item.name || "Unknown"} (${item.code || "No Code"})`,
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
                {item.name || "No Name"}
              </Text>
              <Text style={{ color: "#888" }}>{item.code || "No Code"}</Text>
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
