import { useEffect, useState } from "react";
import { Modal, ScrollView } from "react-native";
import {
  Alert,
  FlatList,
  Platform,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { API_BASE } from "../../config";

export default function Users() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const [jobs, setJobs] = useState([]);
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";

    try {
      await fetch(`${API_BASE}/users/${user.id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      fetchUsers(); // refresh list
    } catch (err) {
      console.error("ROLE ERROR:", err);
    }
  };
  const openJobModal = async (user) => {
    try {
      setSelectedUser(user);

      const jobsRes = await fetch(`${API_BASE}/admin/jobs`);
      const allJobs = await jobsRes.json();

      const userRes = await fetch(`${API_BASE}/admin/users/${user.id}/jobs`);
      const assigned = await userRes.json();

      setJobs(allJobs);
      setSelectedJobs(assigned.map(j => j.id));
      setShowModal(true);

    } catch (err) {
      console.error("JOB LOAD ERROR:", err);
    }
  };
  const toggleJob = (jobId) => {
    setAssignedJobs(prev => {
      const updated = new Set(prev);

      if (updated.has(jobId)) {
        updated.delete(jobId);
      } else {
        updated.add(jobId);
      }

      return updated;
    });
  };
  const saveAssignments = async () => {
    try {
      await fetch(`${API_BASE}/admin/assign-jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          job_ids: Array.from(assignedJobs),
        }),
      });

      alert("Assignments saved");
      setModalVisible(false);

    } catch (err) {
      console.error("SAVE ERROR:", err);
    }
  };
  const saveJobs = async () => {
    try {
      await fetch(`${API_BASE}/admin/users/${selectedUser.id}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_ids: selectedJobs }),
      });

      setShowModal(false);

      if (Platform.OS === "web") {
        window.alert("Jobs updated");
      } else {
        Alert.alert("Success", "Jobs updated");
      }

    } catch (err) {
      console.error("SAVE ERROR:", err);
    }
  };
  // 🔥 CONFIRM DELETE (WEB + MOBILE)
  const confirmDeleteUser = (userId) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this user? This cannot be undone.",
      );

      if (confirmed) {
        handleDelete(userId);
      }
      return;
    }

    Alert.alert(
      "Delete User",
      "Are you sure you want to delete this user? This cannot be undone.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => handleDelete(userId),
        },
      ],
      { cancelable: true },
    );
  };

  // 🔥 DELETE USER
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        let data;
        try {
          data = await res.json();
        } catch {
          data = { detail: "Unknown error" };
        }

        Alert.alert("Error", data.detail || "Failed to delete user");
        return;
      }

      // ✅ instant UI update (no refetch lag)
      setUsers((prev) => prev.filter((user) => user.id !== id));

      if (Platform.OS === "web") {
        window.alert("User deleted");
      } else {
        Alert.alert("Success", "User deleted");
      }
    } catch (err) {
      console.error("DELETE ERROR:", err);
      Alert.alert("Error", "Something broke");
    }
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [assignedJobs, setAssignedJobs] = useState(new Set());
  const openJobModal = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  try {
    // get all jobs
    const jobsRes = await fetch(`${API_BASE}/admin/jobs`);
    const jobsData = await jobsRes.json();
    setJobs(jobsData);

    // get assigned jobs
    const assignedRes = await fetch(
      `${API_BASE}/admin/user/${user.id}/jobs`
    );
    const assignedData = await assignedRes.json();

    // store as Set for fast toggle
    setAssignedJobs(new Set(assignedData.map(j => j.id)));

  } catch (err) {
    console.error("JOB LOAD ERROR:", err);
  }
}
};
  const closeJobModal = () => {
    setModalVisible(false);
    setSelectedUser(null);
  };
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
        fontSize: 24,
        marginBottom: 20,
        color: isDark ? "#fff" : "#000",
      }}
    >
      Users
    </Text>

    <FlatList
      data={users}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View
          style={{
            padding: 15,
            marginBottom: 10,
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            borderRadius: 10,
          }}
        >
          <Text style={{ color: isDark ? "#fff" : "#000" }}>
            {item.first_name} {item.last_name}
          </Text>

          <Text style={{ color: "#888" }}>{item.email}</Text>

          <Text style={{ color: "#4CAF50" }}>Role: {item.role}</Text>

          {/* 🔄 TOGGLE ROLE */}
          <TouchableOpacity
            onPress={() => toggleRole(item)}
            style={{
              marginTop: 10,
              backgroundColor: "#2196F3",
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              Toggle Role
            </Text>
          </TouchableOpacity>

          {/* 🧠 ASSIGN JOBS */}
          <TouchableOpacity
            onPress={() => openJobModal(item)}
            style={{
              marginTop: 10,
              backgroundColor: "#9C27B0",
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              Assign Jobs
            </Text>
          </TouchableOpacity>

          {/* 🗑 DELETE */}
          <TouchableOpacity
            onPress={() => confirmDeleteUser(item.id)}
            style={{
              marginTop: 10,
              backgroundColor: "#f44336",
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}
    />

    {/* 🔥 MODAL */}
    <Modal visible={modalVisible} animationType="slide" transparent={true}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            width: "90%",
            maxHeight: "80%",
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              marginBottom: 10,
              color: isDark ? "#fff" : "#000",
            }}
          >
            Assign Jobs to {selectedUser?.first_name}
          </Text>

          {/* 🔥 JOB LIST */}
          <ScrollView>
            {jobs.map((job) => {
              const isSelected = assignedJobs.has(job.id);

              return (
                <TouchableOpacity
                  key={job.id}
                  onPress={() => toggleJob(job.id)}
                  style={{
                    padding: 12,
                    marginBottom: 8,
                    borderRadius: 8,
                    backgroundColor: isSelected
                      ? "#4CAF50"
                      : isDark
                      ? "#333"
                      : "#ddd",
                  }}
                >
                  <Text style={{ color: isSelected ? "#fff" : isDark ? "#fff" : "#000" }}>
                    {isSelected ? "✓ " : ""}
                    {job.code} - {job.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* 💾 SAVE */}
          <TouchableOpacity
            onPress={saveAssignments}
            style={{
              marginTop: 10,
              backgroundColor: "#4CAF50",
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              Save Assignments
            </Text>
          </TouchableOpacity>

          {/* CLOSE */}
          <TouchableOpacity
            onPress={closeJobModal}
            style={{
              marginTop: 10,
              backgroundColor: "#999",
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Text style={{ textAlign: "center", color: "#fff" }}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </View>
);