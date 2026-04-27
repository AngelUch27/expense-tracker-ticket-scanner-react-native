import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import Swipeable from "react-native-gesture-handler/Swipeable";

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

function formatLocalDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseStorageDate(value?: string) {
  if (!value) {
    return new Date();
  }

  const parts = value.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts.map((part) => Number(part));
    if (Number.isFinite(year) && Number.isFinite(month) && Number.isFinite(day)) {
      return new Date(year, month - 1, day);
    }
  }

  const fallback = new Date(value);
  if (!Number.isNaN(fallback.getTime())) {
    return fallback;
  }

  return new Date();
}

export default function TransactionsScreen() {
  const { user, loading } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState(new Date());
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);

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

  const deleteExpense = useCallback((expenseId: number) => {
    try {
      db.runSync("DELETE FROM expenses WHERE id = ?", [expenseId]);
      setExpenses((previous) => previous.filter((expense) => expense.id !== expenseId));
    } catch (error) {
      console.log("Error deleting expense:", error);
      Alert.alert("Error", "No se pudo eliminar el movimiento.");
    }
  }, []);

  const confirmDeleteExpense = useCallback(
    (expense: Expense) => {
      const description = expense.description?.trim() || "este movimiento";
      Alert.alert(
        "Eliminar movimiento",
        `¿Seguro que quieres eliminar ${description}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => deleteExpense(expense.id),
          },
        ]
      );
    },
    [deleteExpense]
  );

  const renderRightActions = useCallback(
    (expense: Expense) => (
      <Pressable
        style={({ pressed }) => [styles.deleteAction, pressed && styles.deleteActionPressed]}
        onPress={() => confirmDeleteExpense(expense)}
      >
        <Ionicons name="trash-outline" size={20} color="#ffffff" />
        <Text style={styles.deleteActionText}>Eliminar</Text>
      </Pressable>
    ),
    [confirmDeleteExpense]
  );

  const openEditExpense = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setEditAmount(Number(expense.amount ?? 0).toFixed(2));
    setEditDescription(expense.description ?? "");
    setEditDate(parseStorageDate(expense.date));
    setShowEditDatePicker(false);
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingExpense(null);
    setShowEditDatePicker(false);
  }, []);

  const saveEditedExpense = useCallback(() => {
    if (!editingExpense) {
      return;
    }

    const normalizedAmount = Number(editAmount.replace(",", "."));
    const normalizedDescription = editDescription.trim();

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      Alert.alert("Monto inválido", "Ingresa un monto mayor a cero.");
      return;
    }

    if (!normalizedDescription) {
      Alert.alert("Campo requerido", "Agrega una descripción para continuar.");
      return;
    }

    try {
      db.runSync(
        "UPDATE expenses SET amount = ?, description = ?, date = ? WHERE id = ?",
        [normalizedAmount, normalizedDescription, formatLocalDate(editDate), editingExpense.id]
      );

      loadExpenses();
      closeEditModal();
    } catch (error) {
      console.log("Error updating expense:", error);
      Alert.alert("Error", "No se pudo actualizar el movimiento.");
    }
  }, [closeEditModal, editAmount, editDate, editDescription, editingExpense, loadExpenses]);

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
          <Swipeable
            friction={1.8}
            rightThreshold={32}
            overshootRight={false}
            renderRightActions={() => renderRightActions(item)}
          >
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={styles.iconPill}>
                  <Ionicons name="document-text-outline" size={16} color="#2563eb" />
                </View>
                <View style={styles.textWrap}>
                  <Text style={styles.cardTitle}>{item.description || "Sin descripción"}</Text>
                  <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                </View>
              </View>

              <View style={styles.cardRight}>
                <Text style={styles.cardAmount}>{formatAmount(Number(item.amount ?? 0))}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.editButton,
                    pressed && styles.editButtonPressed,
                  ]}
                  onPress={() => openEditExpense(item)}
                >
                  <Ionicons name="pencil-outline" size={14} color="#1d4ed8" />
                  <Text style={styles.editButtonText}>Editar</Text>
                </Pressable>
              </View>
            </View>
          </Swipeable>
        )}
      />

      <Modal
        visible={!!editingExpense}
        transparent
        animationType="fade"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar movimiento</Text>
              <Pressable
                style={({ pressed }) => [styles.modalCloseButton, pressed && styles.modalClosePressed]}
                onPress={closeEditModal}
              >
                <Ionicons name="close" size={20} color="#475569" />
              </Pressable>
            </View>

            <Text style={styles.modalLabel}>Monto (MXN)</Text>
            <View style={styles.modalInputRow}>
              <Ionicons name="cash-outline" size={18} color="#475569" />
              <TextInput
                placeholder="0.00"
                keyboardType="decimal-pad"
                value={editAmount}
                onChangeText={setEditAmount}
                style={styles.modalInput}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <Text style={[styles.modalLabel, styles.modalFieldSpacing]}>Descripción</Text>
            <View style={styles.modalInputRow}>
              <Ionicons name="document-text-outline" size={18} color="#475569" />
              <TextInput
                placeholder="Ej. Supermercado"
                value={editDescription}
                onChangeText={setEditDescription}
                style={styles.modalInput}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <Text style={[styles.modalLabel, styles.modalFieldSpacing]}>Fecha</Text>
            <Pressable
              style={({ pressed }) => [styles.modalDateButton, pressed && styles.modalDatePressed]}
              onPress={() => setShowEditDatePicker(true)}
            >
              <View style={styles.modalDateLeft}>
                <Ionicons name="calendar-outline" size={18} color="#475569" />
                <Text style={styles.modalDateText}>{editDate.toLocaleDateString("es-MX")}</Text>
              </View>
              <Ionicons name="chevron-down" size={18} color="#64748b" />
            </Pressable>

            {showEditDatePicker ? (
              <DateTimePicker
                value={editDate}
                mode="date"
                display="default"
                onChange={(_event, selectedDate) => {
                  setShowEditDatePicker(false);
                  if (selectedDate) {
                    setEditDate(selectedDate);
                  }
                }}
              />
            ) : null}

            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [
                  styles.modalSecondaryButton,
                  pressed && styles.modalSecondaryButtonPressed,
                ]}
                onPress={closeEditModal}
              >
                <Text style={styles.modalSecondaryButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.modalPrimaryButton,
                  pressed && styles.modalPrimaryButtonPressed,
                ]}
                onPress={saveEditedExpense}
              >
                <Text style={styles.modalPrimaryButtonText}>Guardar cambios</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  cardRight: {
    alignItems: "flex-end",
    marginLeft: 10,
    gap: 8,
  },
  cardAmount: {
    color: "#0f172a",
    fontWeight: "900",
    fontSize: 16,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  editButtonPressed: {
    opacity: 0.75,
  },
  editButtonText: {
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "700",
  },
  deleteAction: {
    width: 110,
    marginLeft: 10,
    borderRadius: 16,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteActionPressed: {
    backgroundColor: "#b91c1c",
  },
  deleteActionText: {
    marginTop: 2,
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#dbe4f0",
    backgroundColor: "#ffffff",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "900",
  },
  modalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#dbe4f0",
    alignItems: "center",
    justifyContent: "center",
  },
  modalClosePressed: {
    opacity: 0.75,
  },
  modalLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  modalFieldSpacing: {
    marginTop: 12,
  },
  modalInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dbe4f0",
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: "#f8fafc",
  },
  modalInput: {
    flex: 1,
    color: "#0f172a",
    fontSize: 15,
    paddingVertical: 12,
    marginLeft: 8,
  },
  modalDateButton: {
    borderWidth: 1,
    borderColor: "#dbe4f0",
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalDatePressed: {
    opacity: 0.75,
  },
  modalDateLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalDateText: {
    color: "#0f172a",
    fontSize: 15,
  },
  modalActions: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },
  modalSecondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#ffffff",
  },
  modalSecondaryButtonPressed: {
    opacity: 0.75,
  },
  modalSecondaryButtonText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
  },
  modalPrimaryButton: {
    flex: 1,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#1d4ed8",
  },
  modalPrimaryButtonPressed: {
    opacity: 0.85,
  },
  modalPrimaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
