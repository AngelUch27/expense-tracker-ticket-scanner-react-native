import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useAuth } from "@/context/AuthContext";
import { expenseRepository } from "@/lib/repositories/expense.repository";
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
      <View style={[styles.centerContainer, styles.screenBackground]}>
        <Text style={styles.centerTitle}>Cargando sesión...</Text>
        <Text style={styles.centerSubtitle}>Preparamos tu formulario.</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.centerContainer, styles.screenBackground]}>
        <Text style={styles.centerTitle}>No hay sesión activa</Text>
        <Text style={styles.centerSubtitle}>Inicia sesión para registrar gastos.</Text>
      </View>
    );
  }

  type CreateExpenseInput = {
    userId: number;
    amount: number;
    date: string;
    description?: string | null;
  };

  function formatLocalDate(value: Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
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
      return;
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
    <KeyboardAvoidingView
      style={styles.screenBackground}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Nuevo gasto</Text>
            <Text style={styles.subtitle}>
              Captura tu ticket y revisa los datos antes de guardar.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.cameraButton,
              pressed && !isOpeningCamera && styles.buttonPressed,
              isOpeningCamera && styles.buttonDisabled,
            ]}
            onPress={handleOpenCamera}
            disabled={isOpeningCamera}
          >
            {isOpeningCamera ? (
              <Ionicons name="sync-outline" size={22} color="#fff" />
            ) : (
              <Ionicons name="camera" size={24} color="#fff" />
            )}
          </Pressable>
        </View>

        <View style={styles.ocrInfoCard}>
          <Ionicons name="sparkles-outline" size={18} color="#0f766e" />
          <Text style={styles.ocrInfoText}>
            Usa la cámara para autocompletar monto, comercio y fecha con OCR.
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Monto (MXN)</Text>
          <View style={styles.inputRow}>
            <Ionicons name="cash-outline" size={18} color="#475569" />
            <TextInput
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              style={styles.input}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <Text style={[styles.label, styles.fieldSpacing]}>Descripción</Text>
          <View style={styles.inputRow}>
            <Ionicons name="document-text-outline" size={18} color="#475569" />
            <TextInput
              placeholder="Ej. Supermercado"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <Text style={[styles.label, styles.fieldSpacing]}>Fecha</Text>
          <Pressable
            style={({ pressed }) => [
              styles.dateButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => setShowPicker(true)}
          >
            <View style={styles.dateLeft}>
              <Ionicons name="calendar-outline" size={18} color="#475569" />
              <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
            </View>
            <Ionicons name="chevron-down" size={18} color="#64748b" />
          </Pressable>
        </View>

        {ticketPhotoUri ? (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Ticket capturado</Text>
            <Image source={{ uri: ticketPhotoUri }} style={styles.previewImage} />
          </View>
        ) : null}

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(_event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Guardar gasto</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screenBackground: {
    flex: 1,
    backgroundColor: "#f5f9ff",
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  centerTitle: {
    color: "#0f172a",
    fontWeight: "800",
    fontSize: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  centerSubtitle: {
    color: "#475569",
    fontSize: 14,
    textAlign: "center",
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 34,
  },
  glowTop: {
    position: "absolute",
    top: -70,
    right: -56,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(37, 99, 235, 0.18)",
  },
  glowBottom: {
    position: "absolute",
    bottom: 30,
    left: -70,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(13, 148, 136, 0.12)",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  cameraButton: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f766e",
    shadowColor: "#0f172a",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  ocrInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ecfeff",
    borderColor: "#a5f3fc",
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  ocrInfoText: {
    flex: 1,
    color: "#115e59",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  label: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  fieldSpacing: {
    marginTop: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dbe4f0",
    borderRadius: 14,
    minHeight: 50,
    paddingHorizontal: 12,
    backgroundColor: "#f8fafc",
  },
  input: {
    flex: 1,
    color: "#0f172a",
    fontSize: 16,
    marginLeft: 10,
    paddingVertical: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#dbe4f0",
    borderRadius: 14,
    minHeight: 50,
    paddingHorizontal: 12,
    backgroundColor: "#f8fafc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#0f172a",
  },
  previewCard: {
    marginTop: 14,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#dbe4f0",
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 10,
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
  },
  saveButton: {
    marginTop: 18,
    backgroundColor: "#2563eb",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    shadowColor: "#0f172a",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
