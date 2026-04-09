import React, { useState } from "react";
import { loginUser, registerUser } from "../../lib/db/auth";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const goHome = () => router.replace("/(tabs)");

  const handleLogin = async () => {
    const e = email.trim();

    if (!e || !password) {
      Alert.alert("Falta info", "Escribe tu correo y tu contraseña.");
      return;
    }

    try {
      setLoading(true);
      const user = await loginUser(e, password);
      login({
        id: user.id,
        name: user.name,
        email: user.email,
      });
      goHome();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const e = email.trim();

    if (!e || !password) {
      Alert.alert("Falta info", "Para registrarte, escribe correo y contraseña.");
      return;
    }

    try {
      setLoading(true);
      const user = await registerUser(e, password);
      login({
        id: user.id,
        name: user.name,
        email: user.email,
      });
      goHome();
    } catch (error: any) {
      Alert.alert("Error", error?.message || "No se pudo registrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardWrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.glowPrimary} />
        <View style={styles.glowSecondary} />

        <View style={styles.headerBlock}>
          <Text style={styles.kicker}>Tu dinero, bajo control</Text>
          <Text style={styles.title}>Control de Gastos</Text>
          <Text style={styles.subtitle}>
            Inicia sesión para registrar tickets y ver tus movimientos en segundos.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Correo</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={18} color="#4b5563" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="tucorreo@gmail.com"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              style={styles.input}
              placeholderTextColor="#8b95a7"
              editable={!loading}
            />
          </View>

          <Text style={[styles.label, styles.passwordLabel]}>Contraseña</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#4b5563" />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              textContentType="password"
              autoComplete="password"
              style={styles.input}
              placeholderTextColor="#8b95a7"
              editable={!loading}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && !loading && styles.buttonPressed,
              loading && styles.disabledBtn,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? "Procesando..." : "Iniciar sesión"}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              pressed && !loading && styles.buttonPressed,
              loading && styles.disabledBtn,
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.secondaryBtnText}>
              {loading ? "Procesando..." : "Crear cuenta"}
            </Text>
          </Pressable>
        </View>

        {Platform.OS === "web" ? (
          <Text style={styles.footer}>
            Estás en modo web (localhost). También funciona en Expo Go.
          </Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardWrapper: {
    flex: 1,
    backgroundColor: "#eef3fb",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 36,
    backgroundColor: "#eef3fb",
  },
  glowPrimary: {
    position: "absolute",
    top: 42,
    right: -40,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(37, 99, 235, 0.2)",
  },
  glowSecondary: {
    position: "absolute",
    bottom: 20,
    left: -56,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(6, 182, 212, 0.18)",
  },
  headerBlock: {
    marginBottom: 20,
  },
  kicker: {
    alignSelf: "flex-start",
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#334155",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#0f172a",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  passwordLabel: {
    marginTop: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d6deeb",
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 52,
    backgroundColor: "#f8fafc",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    color: "#111827",
    fontSize: 16,
    paddingVertical: 10,
  },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryBtn: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabledBtn: {
    opacity: 0.7,
  },
  footer: {
    marginTop: 16,
    color: "#475569",
    fontSize: 12,
    textAlign: "center",
  },
});
