import { Picker } from "@react-native-picker/picker";
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

// ✅ TYPES
type User = {
  id: number;
  first_name: string;
  last_name: string;
};

type Job = {
  id: number;
  code: string;
  name: string;
};

export default function AdminDashboard() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const colors = {
    background: isDark ? "#121212" : "#f2f2f2",
    card: isDark ? "#1e1e1e" : "#fff",
    text: isDark ? "#fff" : "#000",
    border: isDark ? "#333" : "#ccc",
    inputBg: isDark ? "#1e1e1e" : "#fff",
    button: "#4CAF50",
  };

  const [filters, setFilters] = useState({
    user_id: "",
    job_code: "",
    start_date: "",
    end_date: "",
  });

  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🔽 LOAD DROPDOWNS
  const loadDropdowns = async () => {
    try {
      const [usersRes, jobsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/users`),
        fetch(`${API_BASE}/admin/jobs`),
      ]);

      const usersData = await usersRes.json();
      const jobsData = await jobsRes.json();

      setUsers(usersData);
      setJobs(jobsData);
    } catch (err) {
      console.log("Dropdown load error:", err);
    }
  };

  // 🔄 LOAD REPORT
  const loadReport = async () => {
    try {
      setLoading(true);

      const params: any = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });

      const query = new URLSearchParams(params).toString();

      const res = await fetch(`${API_BASE}/admin/report?${query}`);
      const result = await res.json();

      setData(result.data || []);
      setTotalHours(result.total_hours || 0);
    } catch (err) {
      console.log("Report error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDropdowns();
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
    const params: any = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });

    const query = new URLSearchParams(params).toString();
    const url = `${API_BASE}/admin/export?${query}`;

    if (Platform.OS === "web") {
      window.open(url, "_blank");
    } else {
      alert("Export works on web for now");
    }
  };

  // 🎨 COMMON INPUT STYLE
  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBg,
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    color: colors.text,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={{ fontSize: 24, marginBottom: 15, color: colors.text }}>
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
        {/* 👤 USER */}
        <Text style={{ color: colors.text, marginBottom: 5 }}>User</Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            marginBottom: 10,
            backgroundColor: colors.inputBg,
          }}
        >
          <Picker
            selectedValue={filters.user_id}
            onValueChange={(value) =>
              setFilters({ ...filters, user_id: String(value) })
            }
            dropdownIconColor={colors.text}
            style={{ color: colors.text }}
          >
            <Picker.Item label="All Users" value="" />
            {users.map((u) => (
              <Picker.Item
                key={u.id}
                label={`${u.first_name} ${u.last_name}`}
                value={String(u.id)}
              />
            ))}
          </Picker>
        </View>

        {/* 💼 JOB */}
        <Text style={{ color: colors.text, marginBottom: 5 }}>Job</Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            marginBottom: 10,
            backgroundColor: colors.inputBg,
          }}
        >
          <Picker
            selectedValue={filters.job_code}
            onValueChange={(value) =>
              setFilters({ ...filters, job_code: String(value) })
            }
            dropdownIconColor={colors.text}
            style={{ color: colors.text }}
          >
            <Picker.Item label="All Jobs" value="" />
            {jobs.map((job) => (
              <Picker.Item
                key={job.id}
                label={`${job.code} - ${job.name}`}
                value={job.code}
              />
            ))}
          </Picker>
        </View>

        {/* 📅 DATES */}
        <TextInput
          placeholder="Start Date (YYYY-MM-DD)"
          placeholderTextColor={isDark ? "#888" : "#666"}
          value={filters.start_date}
          onChangeText={(t) => setFilters({ ...filters, start_date: t })}
          style={inputStyle}
        />

        <TextInput
          placeholder="End Date (YYYY-MM-DD)"
          placeholderTextColor={isDark ? "#888" : "#666"}
          value={filters.end_date}
          onChangeText={(t) => setFilters({ ...filters, end_date: t })}
          style={inputStyle}
        />

        {/* BUTTONS */}
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
      <Text style={{ fontSize: 18, marginBottom: 10, color: "#4CAF50" }}>
        Total Hours: {loading ? "..." : totalHours}
      </Text>

      {/* DATA */}
      {data.map((row) => (
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

          {/* ✅ FIXED */}
          <Text style={{ color: "#4CAF50" }}>
            {row.job_name ? `${row.job_code} - ${row.job_name}` : row.job_code}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
