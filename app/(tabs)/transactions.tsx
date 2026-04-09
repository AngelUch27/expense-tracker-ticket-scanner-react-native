import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { db } from "@/lib/db/connection";
import { useAuth } from "@/context/AuthContext";

type Expense = {
  id: number;
  description: string;
  amount: number;
  date?: string;
};

function formatAmount(value: number) {
  return `$${value.toFixed(2)}`;
}

function formatDate(value?: string) {
  if (!value) {
    return "Sin fecha";
  }

  const parts = value.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return value;
}

export default function TransactionsScreen() {
  const { user, loading } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const loadExpenses = useCallback(() => {
    if (loading || !user) return;

    try {
      const rows = db.getAllSync(
        "SELECT * FROM expenses WHERE user_id = ? ORDER BY date ASC, id ASC",
        [user.id]
      );

      setExpenses(rows as Expense[]);
    } catch (err) {
      console.log("DB error:", err);
    }
  }, [loading, user]);

  useFocusEffect(
    useCallback(() => {
      if (loading || !user) return;
      loadExpenses();
    }, [loading, user, loadExpenses])
  );

  const total = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount ?? 0), 0),
    [expenses]
  );

  return (
    <View style={styles.screen}>
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.headerCard}>
        <View style={styles.headerBadge}>
          <Ionicons name="receipt-outline" size={16} color="#1d4ed8" />
          <Text style={styles.headerBadgeText}>Historial</Text>
        </View>

        <Text style={styles.title}>Movimientos</Text>
        <Text style={styles.subtitle}>
          {expenses.length} {expenses.length === 1 ? "registro" : "registros"} en total
        </Text>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Monto acumulado</Text>
          <Text style={styles.summaryAmount}>{formatAmount(total)}</Text>
        </View>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Ionicons name="wallet-outline" size={26} color="#64748b" />
            <Text style={styles.emptyTitle}>Aún no hay movimientos</Text>
            <Text style={styles.emptyDescription}>
              Cuando registres tu primer gasto aparecerá aquí.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.iconPill}>
                <Ionicons name="document-text-outline" size={16} color="#2563eb" />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.cardTitle}>
                  {item.description || "Sin descripción"}
                </Text>
                <Text style={styles.dateText}>{formatDate(item.date)}</Text>
              </View>
            </View>
            <Text style={styles.cardAmount}>{formatAmount(Number(item.amount ?? 0))}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f9ff",
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  glowTop: {
    position: "absolute",
    top: -90,
    right: -50,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(37, 99, 235, 0.18)",
  },
  glowBottom: {
    position: "absolute",
    bottom: -40,
    left: -70,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(20, 184, 166, 0.12)",
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  headerBadge: {
    flexDirection: "row",
    alignSelf: "flex-start",
    alignItems: "center",
    backgroundColor: "#dbeafe",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
    gap: 6,
  },
  headerBadgeText: {
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: 12,
  },
  title: {
    color: "#0f172a",
    fontWeight: "900",
    fontSize: 30,
    marginBottom: 4,
  },
  subtitle: {
    color: "#475569",
    fontSize: 14,
    marginBottom: 14,
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: "#dbe4f0",
    borderRadius: 16,
    padding: 12,
    backgroundColor: "#f8fafc",
  },
  summaryLabel: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 4,
  },
  summaryAmount: {
    color: "#0f172a",
    fontSize: 26,
    fontWeight: "900",
  },
  listContent: {
    paddingBottom: 32,
    gap: 10,
  },
  emptyCard: {
    marginTop: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dbe4f0",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    padding: 18,
  },
  emptyTitle: {
    marginTop: 10,
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
  emptyDescription: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe4f0",
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#e0e7ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  textWrap: {
    flex: 1,
  },
  cardTitle: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 15,
    lineHeight: 20,
  },
  dateText: {
    marginTop: 2,
    color: "#64748b",
    fontSize: 12,
  },
  cardAmount: {
    color: "#0f172a",
    fontWeight: "900",
    fontSize: 16,
    marginLeft: 10,
  },
});
