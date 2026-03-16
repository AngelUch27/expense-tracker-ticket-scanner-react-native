import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";

import { router } from "expo-router";
import { useTransactions } from "../context/TransactionsContext";

import DateTimePicker from "@react-native-community/datetimepicker";
import { Dropdown } from "react-native-element-dropdown";

export default function AddScreen() {
  const { addTransaction } = useTransactions();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const categories = [
    { label: "Food", value: "Food" },
    { label: "Transport", value: "Transport" },
    { label: "Shopping", value: "Shopping" },
    { label: "Bills", value: "Bills" },
    { label: "Entertainment", value: "Entertainment" },
  ];

  const handleSave = () => {
    if (!amount || !description || !category) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    addTransaction({
      amount: parseFloat(amount),
      description,
      category,
      date: date.toISOString(),
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
        placeholderTextColor="#888"
      />

      <TextInput
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        placeholderTextColor="#888"
      />

      <Dropdown
        style={styles.dropdown}
        data={categories}
        labelField="label"
        valueField="value"
        placeholder="Selecciona categoría"
        value={category}
        onChange={(item) => {
          setCategory(item.value);
        }}
      />

      <Pressable
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.dateText}>
          Fecha: {date.toLocaleDateString()}
        </Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}

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
    color: "#000",
  },

  dropdown: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  dateButton: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  dateText: {
    color: "#000",
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