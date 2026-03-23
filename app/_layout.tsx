import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { initDatabase } from "../lib/db";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    try {
      initDatabase();
      console.log("Database initialized successfully");
      setDbReady(true);
    } catch (error) {
      console.error("Error initializing database: ", error);
    }
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Inicializando base de datos...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <Stack>
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Inicio" }} />
          <Stack.Screen name="add" options={{ title: "Agregar gasto", headerBackButtonDisplayMode: "minimal" }} />
        </Stack>
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}