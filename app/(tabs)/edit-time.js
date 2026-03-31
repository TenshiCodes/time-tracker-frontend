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
                if (selected) {
                  console.log("📅 PICK START DATE:", selected.toString());

                  setStartDateObj(selected);

                  const d = selected.toLocaleDateString("en-CA");
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

              const h = selected.getHours().toString().padStart(2, "0");
              const m = selected.getMinutes().toString().padStart(2, "0");

              setStartTime(`${h}:${m}`);
            }
          }}
        />
      )}
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
                if (selected) {
                  console.log("📅 PICK END DATE:", selected.toString());

                  setEndDateObj(selected);

                  const d = selected.toLocaleDateString("en-CA");
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

              const h = selected.getHours().toString().padStart(2, "0");
              const m = selected.getMinutes().toString().padStart(2, "0");

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
