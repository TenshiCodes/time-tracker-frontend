import { useEffect, useState } from "react";
import {
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";
import { API_BASE } from "../config.js";

export default function AdminDashboard() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const colors = {
    background: isDark ? "#121212" : "#f2f2f2",
    card: isDark ? "#1e1e1e" : "#fff",
    text: isDark ? "#fff" : "#000",
    border: isDark ? "#333" : "#ccc",
    button: "#4CAF50",
  };

  const [filters, setFilters] = useState({
    user_id: "",
    job_code: "",
    start_date: "",
    end_date: "",
  });

  const [data, setData] = useState<any[]>([]);
  const [totalHours, setTotalHours] = useState(0);

  // 🔄 LOAD REPORT
  const loadReport = async () => {
    try {
      const query = new URLSearchParams(
        Object.entries(filters).reduce((acc, [k, v]) => {
          if (v) acc[k] = v;
          return acc;
        }, {} as any),
      ).toString();

      const res = await fetch(`${API_BASE}/admin/report?${query}`);
      const result = await res.json();

      setData(result.data || []);
      setTotalHours(result.total_hours || 0);
    } catch (err) {
      console.log("Report error:", err);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  // ⏱ FORMAT TIME
  const formatTime = (row: any) => {
    if (!row.clock_out) return "Active";

    const start = new Date(row.clock_in);
    const end = new Date(row.clock_out);

    const diff = (end.getTime() - start.getTime()) / 1000;

    const hrs = Math.floor(diff / 3600);
    const mins = Math.floor((diff % 3600) / 60);

    return `${hrs}:${mins.toString().padStart(2, "0")}`;
  };

  // 📤 EXPORT
  const handleExport = () => {
    const query = new URLSearchParams(filters as any).toString();
    const url = `${API_BASE}/admin/export?${query}`;

    if (Platform.OS === "web") {
      window.open(url, "_blank");
    } else {
      // reuse your existing file download/share logic later
      alert("Export works on web for now");
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20 }}
    >
      {/* TITLE */}
      <Text
        style={{
          fontSize: 24,
          marginBottom: 15,
          color: colors.text,
        }}
      >
        Admin Dashboard
      </Text>

      {/* 🔍 FILTERS */}
      <View
        style={{
          backgroundColor: colors.card,
          padding: 15,
          borderRadius: 10,
          marginBottom: 15,
        }}
      >
        <TextInput
          placeholder="User ID"
          placeholderTextColor="#888"
          value={filters.user_id}
          onChangeText={(t) => setFilters({ ...filters, user_id: t })}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
            color: colors.text,
          }}
        />

        <TextInput
          placeholder="Job Code"
          placeholderTextColor="#888"
          value={filters.job_code}
          onChangeText={(t) => setFilters({ ...filters, job_code: t })}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
            color: colors.text,
          }}
        />

        <TextInput
          placeholder="Start Date (YYYY-MM-DD)"
          placeholderTextColor="#888"
          value={filters.start_date}
          onChangeText={(t) => setFilters({ ...filters, start_date: t })}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
            color: colors.text,
          }}
        />

        <TextInput
          placeholder="End Date (YYYY-MM-DD)"
          placeholderTextColor="#888"
          value={filters.end_date}
          onChangeText={(t) => setFilters({ ...filters, end_date: t })}
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
            color: colors.text,
          }}
        />

        <TouchableOpacity
          onPress={loadReport}
          style={{
            backgroundColor: colors.button,
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            Apply Filters
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleExport}
          style={{
            backgroundColor: "#FF9800",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>Export CSV</Text>
        </TouchableOpacity>
      </View>

      {/* ⏱ TOTAL */}
      <Text
        style={{
          fontSize: 18,
          marginBottom: 10,
          color: "#4CAF50",
        }}
      >
        Total Hours: {totalHours}
      </Text>

      {/* 🌐 WEB TABLE */}
      {Platform.OS === "web" ? (
        <View style={{ backgroundColor: colors.card, borderRadius: 10 }}>
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",
              padding: 10,
              borderBottomWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ flex: 1, color: colors.text }}>Date</Text>
            <Text style={{ flex: 1, color: colors.text }}>Time</Text>
            <Text style={{ flex: 1, color: colors.text }}>Project</Text>
            <Text style={{ flex: 1, color: colors.text }}>Customer</Text>
          </View>

          {/* ROWS */}
          {data.map((row) => (
            <View
              key={row.id}
              style={{
                flexDirection: "row",
                padding: 10,
                borderBottomWidth: 1,
                borderColor: "#333",
              }}
            >
              <Text style={{ flex: 1, color: colors.text }}>
                {new Date(row.clock_in).toLocaleDateString()}
              </Text>

              <Text style={{ flex: 1, color: colors.text }}>
                {formatTime(row)}
              </Text>

              <Text style={{ flex: 1, color: "#4CAF50" }}>{row.job_code}</Text>

              <Text style={{ flex: 1, color: "#888" }}>
                {row.customer || "-"}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        // 📱 MOBILE CARDS
        data.map((row) => (
          <View
            key={row.id}
            style={{
              backgroundColor: colors.card,
              padding: 15,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: colors.text }}>
              {new Date(row.clock_in).toLocaleDateString()}
            </Text>

            <Text style={{ color: colors.text }}>{formatTime(row)}</Text>

            <Text style={{ color: "#4CAF50" }}>{row.job_code}</Text>

            <Text style={{ color: "#888" }}>{row.customer || "-"}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
