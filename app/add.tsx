import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Image,
} from "react-native";

import { router } from "expo-router";

import DateTimePicker from "@react-native-community/datetimepicker";
import { expenseRepository } from "../lib/repositories/expense.repository";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { extractReceiptWithDocumentAi } from "@/lib/services/document-ai-receipt-extractor";

export default function AddScreen() {
  const { user, loading } = useAuth();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [ticketPhotoUri, setTicketPhotoUri] = useState<string | null>(null);
  const [isOpeningCamera, setIsOpeningCamera] = useState(false);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Cargando Sesion...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No hay sesión activa</Text>
      </View>
    );
  }

  type CreateExpenseInput ={
    userId: number;
    amount: number;
    date: string;
    description? : string | null;
  };

  function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const callExtractText = async (imageUri: string) => {
    console.log("callExtractText imageUri:", imageUri);
    try {
      const extracted = await extractReceiptWithDocumentAi(imageUri);

      if (extracted.amount !== undefined) {
        setAmount(extracted.amount.toFixed(2));
      }

      setDescription(extracted.merchant ?? "Comercio no detectado");

      if (extracted.date) {
        setDate(extracted.date);
      }

      if (
        extracted.amount === undefined &&
        !extracted.merchant &&
        !extracted.date
      ) {
        Alert.alert(
          "No se detectaron datos",
          "Document AI no encontró monto, comercio o fecha. Puedes completar los campos manualmente."
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      console.error("Document AI OCR error:", error);
      Alert.alert(
        "Error OCR",
        `No se pudo extraer el ticket con Document AI.\n\n${message}`
      );
    }
  };

  const handleOpenCamera = async () => {
    try {
      setIsOpeningCamera(true);

      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permiso requerido",
          "Necesitas dar permiso a la cámara para tomar una foto."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const photoUri = result.assets[0].uri;
        setTicketPhotoUri(photoUri);
        await callExtractText(photoUri);
      }
    } catch (error) {
      console.error("Error opening camera:", error);
      Alert.alert("Error", "No se pudo abrir la cámara");
    } finally {
      setIsOpeningCamera(false);
    }
  };

  const handleSave = () => {
    if (!user) {
      console.error("No user logged in");
      return 
    }

    if (!amount || !description) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    const newExpense: CreateExpenseInput = {
      userId: user.id,
      amount: Number(amount),
      date: formatLocalDate(date),
      description,
    };

    expenseRepository.create(newExpense);
    router.back();
  };

  return (
    
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Agregar Gasto</Text>

        <Pressable
          style={styles.cameraButton}
          onPress={handleOpenCamera}
          disabled={isOpeningCamera}
        >
          {isOpeningCamera ? (
            <Text style={styles.cameraButtonText}>...</Text>
          ) : (
            <Ionicons name="camera" size={26} color="#fff" />
          )}
        </Pressable>
      </View>

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

      <Pressable
        style={styles.dateButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.dateText}>
          Fecha: {date.toLocaleDateString()}
        </Text>
      </Pressable>

      {ticketPhotoUri && (
        <Image source={{ uri: ticketPhotoUri }} style={styles.previewImage} />
      )}

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

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
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

  cameraButton: {
    backgroundColor: "#0f766e",
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
  },

  cameraButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    marginBottom: 12,
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
