import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { getCurrentUserId } from "../lib/db/auth";

export default function Index() {
  useEffect(() => {
    const checkSession = async () => {
      const userId = await getCurrentUserId();

      if (userId) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)/login");
      }
    };

    checkSession();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}