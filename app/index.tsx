import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import Splash from "./splash";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const user = await AsyncStorage.getItem("user");

      setTimeout(() => {
        if (user) {
          router.replace("/(tabs)");
        } else {
          router.replace("/login");
        }
      }, 1500);
    };

    checkUser();
  }, []);

  return <Splash />;
}
