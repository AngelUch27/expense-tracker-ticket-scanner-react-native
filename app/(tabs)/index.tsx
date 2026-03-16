import { router } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { db } from "@/lib/db/connection";

export default function HomeScreen() {
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  useEffect(() => {
    loadMonthlyTotal();
  }, []);

  function loadMonthlyTotal() {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const rows = db.getAllSync(
        `SELECT SUM(amount) as total FROM expenses 
         WHERE strftime('%m', date) = '${month.toString().padStart(2, "0")}'
         AND strftime('%Y', date) = '${year}'`
      );

      const total = rows?.[0]?.total ?? 0;
      setMonthlyTotal(total);
    } catch (error) {
      console.log("Error loading monthly total:", error);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu App de Control de Gastos 💰</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gasto este mes</Text>
        <Text style={styles.amount}>${monthlyTotal}</Text>
      </View>

      <View style={styles.button}>
        <Button
          title="Agregar gasto"
          onPress={() => router.push("/add")}
        />
      </View>

      <View style={styles.button}>
        <Button
          title="Ver movimientos"
          onPress={() => router.push("/(tabs)/transactions")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  cardTitle: {
    fontSize: 16,
    color: "#666",
  },

  amount: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 5,
  },

  button: {
    width: "80%",
    marginVertical: 10,
  },
});