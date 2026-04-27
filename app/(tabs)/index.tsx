import { router, useFocusEffect } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useCallback, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { db } from "@/lib/db/connection";
import { useAuth } from "@/context/AuthContext";

export default function HomeScreen() {
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const { user, loading, logout } = useAuth();

  const loadMonthlyTotal = useCallback(() => {
    if (loading || !user) return;

    try {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = String(now.getFullYear());

      const rows = db.getAllSync(
        `SELECT SUM(amount) as total
         FROM expenses
         WHERE user_id = ?
           AND strftime('%m', date) = ?
           AND strftime('%Y', date) = ?`,
        [user.id, month, year]
      ) as { total: number | null }[];

      const total = rows?.[0]?.total ?? 0;
      setMonthlyTotal(total);
    } catch (error) {
      console.log("Error loading monthly total:", error);
    }
  }, [loading, user]);

  useFocusEffect(
    useCallback(() => {
      if (loading || !user) return;
      loadMonthlyTotal();
    }, [loading, user, loadMonthlyTotal])
  );

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/(auth)/login");
    } catch {
      Alert.alert("Error", "No se pudo cerrar sesión.");
    }
  };

  const firstName = user?.name?.trim()?.split(" ")[0] || "";
  const monthLabel = useMemo(
    () =>
      new Date().toLocaleDateString("es-MX", {
        month: "long",
        year: "numeric",
      }),
    []
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroBackgroundOne} />
      <View style={styles.heroBackgroundTwo} />

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Hola{firstName ? `, ${firstName}` : ""}</Text>
          <Text style={styles.title}>Así van tus gastos</Text>
        </View>
        <View style={styles.monthPill}>
          <Text style={styles.monthPillText}>{monthLabel}</Text>
        </View>
      </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Ionicons name="wallet-outline" size={18} color="#475569" />
          <Text style={styles.balanceLabel}>Gasto acumulado del mes</Text>
        </View>

        <Text style={styles.amount}>${monthlyTotal.toFixed(2)}</Text>

        <Text style={styles.balanceHint}>
          Mantén tus tickets al día para tener una mejor visión de tus finanzas.
        </Text>
      </View>

      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>

        <Pressable
          style={({ pressed }) => [
            styles.actionCard,
            pressed && styles.actionCardPressed,
          ]}
          onPress={() => router.push("/add")}
        >
          <View style={[styles.iconWrap, styles.iconPrimary]}>
            <Ionicons name="add" size={22} color="#1d4ed8" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Agregar gasto</Text>
            <Text style={styles.actionSubtitle}>
              Captura tu ticket o registra el movimiento manualmente.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionCard,
            pressed && styles.actionCardPressed,
          ]}
          onPress={() => router.push("/(tabs)/transactions")}
        >
          <View style={[styles.iconWrap, styles.iconSecondary]}>
            <Ionicons name="list-outline" size={22} color="#0f766e" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Ver movimientos</Text>
            <Text style={styles.actionSubtitle}>
              Revisa el historial completo de gastos registrados.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutPressed]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={18} color="#dc2626" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f4f8ff",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
  },
  heroBackgroundOne: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(59, 130, 246, 0.2)",
  },
  heroBackgroundTwo: {
    position: "absolute",
    top: 140,
    left: -70,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  greeting: {
    fontSize: 15,
    color: "#475569",
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0f172a",
    lineHeight: 36,
  },
  monthPill: {
    backgroundColor: "#dbeafe",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  monthPillText: {
    color: "#1e40af",
    fontWeight: "700",
    fontSize: 12,
    textTransform: "capitalize",
  },
  balanceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 22,
    shadowColor: "#0f172a",
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "700",
  },
  amount: {
    fontSize: 42,
    fontWeight: "900",
    color: "#0f172a",
    marginTop: 8,
  },
  balanceHint: {
    marginTop: 6,
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
  },
  actionsSection: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  actionCardPressed: {
    opacity: 0.93,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPrimary: {
    backgroundColor: "#dbeafe",
  },
  iconSecondary: {
    backgroundColor: "#ccfbf1",
  },
  actionContent: {
    flex: 1,
    marginHorizontal: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 18,
  },
  logoutButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#fee2e2",
  },
  logoutPressed: {
    opacity: 0.9,
  },
  logoutText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "800",
  },
});
