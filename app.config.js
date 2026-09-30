export default {
  expo: {
    name: "LumaTune",
    slug: "LumaTune",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "This app uses your location to display your position on the map.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      package: "com.anonymous.LumaTune",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: ["expo-font"],
  },
};
