import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";

export default function Splash() {
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const backgroundColor = isDark ? "#000" : "#fff";

  // 🔥 Animations
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["-10deg", "0deg"],
  });

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  });

  // ✅ Use ONE logo + tint
  const logo = require("../assets/images/pbe_large.png");

  useEffect(() => {
    if (Platform.OS === "web") {
      (async () => {
        const storedUser = await AsyncStorage.getItem("user");
        const user = storedUser ? JSON.parse(storedUser) : null;

        if (user) {
          router.replace("/(tabs)");
        } else {
          router.replace("/login");
        }
      })();

      return;
    }
    const runAnimation = async () => {
      // 🔥 FADE IN + SCALE + ROTATE + GLOW
      await new Promise<void>((resolve) => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 5,
            tension: 80,
            useNativeDriver: true,
          }),
          Animated.timing(rotate, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => resolve());
      });

      // ⏱ HOLD
      await new Promise((res) => setTimeout(res, 500));

      // 🔐 CHECK USER
      const storedUser = await AsyncStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;

      // 🔥 FADE OUT
      await new Promise<void>((resolve) => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => resolve());
      });

      // 🚀 NAVIGATE
      if (user) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    };

    runAnimation();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* ✨ Glow wrapper */}
      <Animated.View
        style={{
          opacity: glowOpacity,
          shadowColor: isDark ? "#fff" : "#000",
          shadowOpacity: 0.6,
          shadowRadius: 25,
          shadowOffset: { width: 0, height: 0 },
          elevation: 20, // Android glow
        }}
      >
        <Animated.Image
          source={logo}
          style={[
            styles.logo,
            {
              opacity,
              transform: [{ scale }, { rotate: spin }],
              tintColor: isDark ? "#fff" : "#000",
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 180,
    height: 180,
  },
});
