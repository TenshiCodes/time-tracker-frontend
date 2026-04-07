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
    background: isDark ? "#0f0f0f" : "#f5f5f5",
    card: isDark ? "#1c1c1c" : "#ffffff",
    text: isDark ? "#ffffff" : "#000000",
    subText: isDark ? "#aaa" : "#666",
    border: isDark ? "#2e2e2e" : "#ddd",
    inputBg: isDark ? "#2a2a2a" : "#fff",
    green: "#4CAF50",
    orange: "#FF9800",
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

  useEffect(() => {
    loadDropdowns();
    loadReport();
  }, []);

  const loadDropdowns = async () => {
    const [u, j] = await Promise.all([
      fetch(`${API_BASE}/admin/users`),
      fetch(`${API_BASE}/admin/jobs`),
    ]);

    setUsers(await u.json());
    setJobs(await j.json());
  };

  const loadReport = async () => {
    const params: any = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params[k] = v;
    });

    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/report?${query}`);
    const result = await res.json();

    setData(result.data || []);
    setTotalHours(result.total_hours || 0);
  };

  const inputStyle = {
    backgroundColor: colors.inputBg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={{ fontSize: 26, fontWeight: "600", color: colors.text }}>
        Admin Dashboard
      </Text>

      {/* FILTER CARD */}
      <View
        style={{
          backgroundColor: colors.card,
          padding: 18,
          borderRadius: 12,
          marginTop: 15,
        }}
      >
        {/* USER */}
        <Text style={{ color: colors.subText, marginBottom: 5 }}>User</Text>
        <View style={[inputStyle, { padding: 0 }]}>
          <Picker
            selectedValue={filters.user_id}
            onValueChange={(v) =>
              setFilters({ ...filters, user_id: String(v) })
            }
            dropdownIconColor={colors.text}
            style={{
              color: colors.text,
              backgroundColor:
                Platform.OS === "web" ? colors.inputBg : "transparent",
            }}
          >
            <Picker.Item label="All Users" value="" />
            {users.map((u) => (
              <Picker.Item
                key={u.id}
                label={`${u.first_name} ${u.last_name}`}
                value={u.id}
              />
            ))}
          </Picker>
        </View>

        {/* JOB */}
        <Text style={{ color: colors.subText, marginBottom: 5 }}>Job</Text>
        <View style={[inputStyle, { padding: 0 }]}>
          <Picker
            selectedValue={filters.job_code}
            onValueChange={(v) =>
              setFilters({ ...filters, job_code: String(v) })
            }
            dropdownIconColor={colors.text}
            style={{
              color: colors.text,
              backgroundColor:
                Platform.OS === "web" ? colors.inputBg : "transparent",
            }}
          >
            <Picker.Item label="All Jobs" value="" />
            {jobs.map((j) => (
              <Picker.Item
                key={j.id}
                label={`${j.code} - ${j.name}`}
                value={j.code}
              />
            ))}
          </Picker>
        </View>

        {/* DATES */}
        <TextInput
          placeholder="Start Date (YYYY-MM-DD)"
          placeholderTextColor={colors.subText}
          value={filters.start_date}
          onChangeText={(t) => setFilters({ ...filters, start_date: t })}
          style={inputStyle}
        />

        <TextInput
          placeholder="End Date (YYYY-MM-DD)"
          placeholderTextColor={colors.subText}
          value={filters.end_date}
          onChangeText={(t) => setFilters({ ...filters, end_date: t })}
          style={inputStyle}
        />

        {/* BUTTONS */}
        <TouchableOpacity
          onPress={loadReport}
          style={{
            backgroundColor: colors.green,
            padding: 14,
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            Apply Filters
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: colors.orange,
            padding: 14,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>Export CSV</Text>
        </TouchableOpacity>
      </View>

      {/* TOTAL */}
      <Text
        style={{
          color: colors.green,
          fontSize: 18,
          marginTop: 15,
          marginBottom: 10,
        }}
      >
        Total Hours: {totalHours}
      </Text>

      {/* 📊 TABLE (EXCEL STYLE) */}
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: isDark ? "#2a2a2a" : "#eee",
            padding: 12,
          }}
        >
          <Text style={{ flex: 2, color: colors.text }}>Date</Text>
          <Text style={{ flex: 1, color: colors.text }}>Hours</Text>
          <Text style={{ flex: 2, color: colors.text }}>Job</Text>
        </View>

        {/* ROWS */}
        {data.map((row, i) => {
          const start = new Date(row.clock_in);
          const end = row.clock_out ? new Date(row.clock_out) : null;

          let hrs = "-";
          if (end) {
            const diff = (end.getTime() - start.getTime()) / 3600 / 1000;
            hrs = diff.toFixed(2);
          }

          return (
            <View
              key={row.id}
              style={{
                flexDirection: "row",
                padding: 12,
                backgroundColor:
                  i % 2 === 0 ? colors.card : isDark ? "#181818" : "#fafafa",
              }}
            >
              <Text style={{ flex: 2, color: colors.text }}>
                {start.toLocaleDateString()}
              </Text>
              <Text style={{ flex: 1, color: colors.text }}>{hrs}</Text>
              <Text style={{ flex: 2, color: colors.green }}>
                {row.job_code}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
