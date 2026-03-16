import { useEffect, useState } from "react";
import { FlatList, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { db } from "@/lib/db/connection";

type Expense = {
  id: number;
  description: string;
  amount: number;
  date?: string;
  category?: string;
};

export default function TransactionsScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    loadExpenses();
  }, []);

  function loadExpenses() {
    try {
      const rows = db.getAllSync("SELECT * FROM expenses ORDER BY id DESC");
      setExpenses(rows as Expense[]);
      console.log("Expenses:", rows);
    } catch (err) {
      console.log("DB error:", err);
    }
  }

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
        <ThemedText>
          {item.category || "Sin categoría"} {item.date ? `• ${item.date}` : ""}
        </ThemedText>
      </ThemedView>

      <ThemedText style={styles.amount}>
        ${item.amount}
      </ThemedText>
    </ThemedView>
  )}
/>

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

  title: {
  marginTop: 40,
  },

  empty: {
  textAlign: "center",
  marginTop: 40,
  opacity: 0.6,
}
});