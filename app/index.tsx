import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem("user");

      if (user) {
        router.replace("/(tabs)"); // ✅ go to app
      } else {
        router.replace("/login"); // ✅ force login
      }
    };

    checkUser();
  }, []);

  return null;
}
