import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from "expo-file-system/legacy";
import { useFocusEffect, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { API_BASE } from "../../config.js";

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
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const colors = {
    background: isDark ? "#0f0f0f" : "#f5f5f5",
    card: isDark ? "#1c1c1c" : "#ffffff",
    text: isDark ? "#ffffff" : "#000000",
    subText: isDark ? "#aaa" : "#666",
    border: isDark ? "#2e2e2e" : "#ddd",
    inputBg: isDark ? "#2a2a2a" : "#fff",
    green: "#2dbad9",
    orange: "#34A853",
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
  const [totalSeconds, setTotalSeconds] = useState(0);

  const resetState = () => {
    setFilters({
      user_id: "",
      job_code: "",
      start_date: "",
      end_date: "",
    });
    setData([]);
    setTotalSeconds(0);
  };
  useFocusEffect(
    useCallback(() => {
      const checkUser = async () => {
        setChecking(true);

        const stored = await AsyncStorage.getItem("user");
        const user = stored ? JSON.parse(stored) : null;

        if (!user || user.role !== "admin") {
          router.replace("/(tabs)");
        } else {
          setAuthorized(true);
        }

        setChecking(false);
      };

      checkUser();
    }, []),
  );
  useEffect(() => {
    resetState();
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
    setTotalSeconds(result.total_seconds || 0);
  };

  const formatHHMM = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}:${mins.toString().padStart(2, "0")}`;
  };

  // ✅ UNIVERSAL EXPORT FUNCTION
  const handleExport = async () => {
    try {
      console.log("EXPORT CLICKED");

      const params = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params[k] = v;
      });

      const query = new URLSearchParams(params).toString();
      const url = `${API_BASE}/admin/export?${query}`;

      console.log("DOWNLOAD URL:", url);

      if (Platform.OS === "web") {
        const res = await fetch(url);
        console.log("WEB RESPONSE:", res.status);

        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "admin_report.xlsx";
        a.click();
      } else {
        console.log("STARTING DOWNLOAD...");

        const fileUri = FileSystem.documentDirectory + "admin_report.xlsx";

        const downloadRes = await FileSystem.downloadAsync(url, fileUri);

        console.log("DOWNLOAD RESULT:", downloadRes);

        const canShare = await Sharing.isAvailableAsync();
        console.log("CAN SHARE:", canShare);

        if (canShare) {
          await Sharing.shareAsync(downloadRes.uri);
        } else {
          alert("Saved to: " + downloadRes.uri);
        }
      }
    } catch (err) {
      console.error("EXPORT FAILED FULL:", err);

      alert(
        "Export failed:\n" +
          (err?.message || JSON.stringify(err) || "Unknown error"),
      );
    }
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
  if (checking || !authorized) {
    return null; // or a loading spinner if you want
  }
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20 }}
    >
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
        <View
          style={{
            backgroundColor: colors.inputBg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            marginBottom: 12,
            overflow: "hidden",
          }}
        >
          {Platform.OS === "web" ? (
            <select
              value={filters.user_id}
              onChange={(e) =>
                setFilters({ ...filters, user_id: e.target.value })
              }
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                backgroundColor: colors.inputBg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
            >
              <option value="">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.first_name} {u.last_name}
                </option>
              ))}
            </select>
          ) : (
            <Picker
              selectedValue={filters.user_id}
              onValueChange={(v) =>
                setFilters({ ...filters, user_id: String(v) })
              }
              style={{ color: colors.text }}
              dropdownIconColor={colors.text}
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
          )}
        </View>

        {/* JOB */}
        <Text style={{ color: colors.subText, marginBottom: 5 }}>Job</Text>
        <View
          style={{
            backgroundColor: colors.inputBg,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          <Picker
            selectedValue={filters.job_code}
            onValueChange={(v) =>
              setFilters({ ...filters, job_code: String(v) })
            }
            style={{ color: colors.text }}
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
          onPress={handleExport}
          style={{
            backgroundColor: colors.orange,
            padding: 14,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            Export Excel Report
          </Text>
        </TouchableOpacity>
      </View>

      {/* TOTAL */}
      <Text style={{ color: colors.green, fontSize: 18, marginTop: 15 }}>
        Total Hours: {formatHHMM(totalSeconds)}
      </Text>

      {/* TABLE */}
      {data.map((row, i) => {
        const start = new Date(row.clock_in);
        const end = row.clock_out ? new Date(row.clock_out) : null;

        let hrs = "-";
        if (end) {
          const diffSeconds = (end.getTime() - start.getTime()) / 1000;
          hrs = formatHHMM(diffSeconds);
        }

        return (
          <View key={row.id} style={{ padding: 10 }}>
            <Text style={{ color: colors.text }}>
              {start.toLocaleDateString()} | {hrs} | {row.job_code}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
