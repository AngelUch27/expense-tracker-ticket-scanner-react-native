import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { FlatList, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { db } from "@/lib/db/connection";
import { useAuth } from "@/context/AuthContext";

type Expense = {
  id: number;
  description: string;
  amount: number;
  date?: string;
};

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
      console.log("Expenses:", rows);
    } catch (err) {
      console.log("DB error:", err);
    }
  }, [user]);
  
  useFocusEffect(
    useCallback(() => {
      if (loading || !user) return;
      loadExpenses();
    }, [loading, user, loadExpenses])
  );

  return (
    <ThemedView style={styles.container}>

      <ThemedText type="title" style={styles.title}>
        Movimientos
      </ThemedText>

      <FlatList
  data={expenses}
  keyExtractor={(item) => item.id.toString()}
  contentContainerStyle={{ gap: 12, marginTop: 20 }}
  
  ListEmptyComponent={
    <ThemedText style={styles.empty}>
      No hay movimientos todavía.
      Agrega tu primer gasto.
    </ThemedText>
  }

  renderItem={({ item }) => (
    <ThemedView style={styles.card}>
      <ThemedView>
        <ThemedText type="defaultSemiBold">
          {item.description || "Sin descripción"}
        </ThemedText>
        <ThemedText style={styles.date}>
          {item.date || "Sin fecha"}
        </ThemedText>
      </ThemedView>
      <ThemedText style={styles.amount}>
        ${item.amount}
      </ThemedText>
    </ThemedView>
    )}/>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  card: {
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  amount: {
    fontWeight: "bold",
    fontSize: 16,
  },

  date: {
    marginTop: 4,
    opacity: 0.7,
    fontSize: 13,
  },

  title: {
  marginTop: 40,
  },

  empty: {
  textAlign: "center",
  marginTop: 40,
  opacity: 0.6,
}
});