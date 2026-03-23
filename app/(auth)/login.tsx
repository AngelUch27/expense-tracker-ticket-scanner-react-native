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
} from "react-native";
import { router } from "expo-router";
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
          editable={!loading}
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
          editable={!loading}
        />

        <Pressable
          style={[styles.primaryBtn, loading && styles.disabledBtn]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.primaryBtnText}>
            {loading ? "Cargando..." : "Iniciar sesión"}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.secondaryBtn, loading && styles.disabledBtn]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.secondaryBtnText}>
            {loading ? "Cargando..." : "Registrarse"}
          </Text>
        </Pressable>
      </View>

      {Platform.OS === "web" ? (
        <Text style={styles.footer}>
          Estás en modo web (localhost). También funciona en Expo Go.
        </Text>
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
  disabledBtn: {
    opacity: 0.7,
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