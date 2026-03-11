import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { useTransactions } from "../context/TransactionsContext";

export default function AddScreen() {
  const { addTransaction } = useTransactions();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!amount || !description) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    addTransaction({
      amount: parseFloat(amount),
      description,
      category: "General",
    });

    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Gasto</Text>

      <TextInput
        placeholder="Monto (MXN)"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />

      <TextInput
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Guardar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});