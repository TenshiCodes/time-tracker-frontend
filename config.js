const getBaseUrl = () => {
  // 🌐 Production (web + mobile)
  if (typeof window !== "undefined") {
    return "https://shake-spas-supporters-somewhere.trycloudflare.com/";
  }

  // 📱 Expo dev (local testing)
  try {
    const Constants = require("expo-constants").default;
    const hostUri = Constants.expoConfig?.hostUri;

    if (hostUri) {
      const ip = hostUri.split(":")[0];
      return `http://${ip}:8000`;
    }
  } catch (e) {}

  return "http://localhost:8000";
};

export const API_BASE = getBaseUrl();
