import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { initDatabase } from "../lib/db";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { TransactionsProvider } from "@/context/TransactionsContext";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    try{
      initDatabase();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database: ', error);
    }
  }, []);
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <TransactionsProvider>
        <Stack>
          <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: "Inicio" }} />
          <Stack.Screen name="add" options={{ title: "Agregar gasto", headerBackButtonDisplayMode: "minimal" }} />
        </Stack>
      </TransactionsProvider>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}