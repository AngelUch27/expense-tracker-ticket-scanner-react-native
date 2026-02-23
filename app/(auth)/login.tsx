import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const goHome = () => router.replace("/(tabs)");

  const handleLogin = () => {
    const e = email.trim();

    if (!e || !password) {
      Alert.alert("Falta info", "Escribe tu correo y tu contraseña.");
      return;
    }

    // por ahora: siempre “funciona”
    goHome();
  };

  const handleRegister = () => {
    const e = email.trim();

    if (!e || !password) {
      Alert.alert("Falta info", "Para registrarte, escribe correo y contraseña.");
      return;
    }

    // por ahora: siempre “funciona”
    // después aquí haremos /auth/register
    goHome();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Control de Gastos</Text>
      <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Correo</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="tucorreo@gmail.com"
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoComplete="email"
          style={styles.input}
          placeholderTextColor="#888"
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Contraseña</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
          textContentType="password"
          autoComplete="password"
          style={styles.input}
          placeholderTextColor="#888"
        />

        <Pressable style={styles.primaryBtn} onPress={handleLogin}>
          <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
        </Pressable>

        <Pressable style={styles.secondaryBtn} onPress={handleRegister}>
          <Text style={styles.secondaryBtnText}>Registrarse</Text>
        </Pressable>

        <Text style={styles.hint}>
          *Por ahora es demo: con cualquier correo/contraseña te deja entrar.
        </Text>
      </View>

      {Platform.OS === "web" ? (
        <Text style={styles.footer}>Estás en modo web (localhost). También funciona en Expo Go.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#444",
    textAlign: "center",
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    color: "#333",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 16,
    color: "#111",
  },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryBtn: {
    marginTop: 10,
    backgroundColor: "#e5e7eb",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#111",
    fontWeight: "700",
    fontSize: 16,
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    color: "#555",
    textAlign: "center",
  },
  footer: {
    marginTop: 16,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});