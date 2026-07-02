import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  categorias_gastos,
  categorias_ingresos,
} from "../data/categoriasfinas";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { formatearMonto } from "../utils/formatearMonto";
import { KeyboardAvoidingView, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

function TransactionModal({
  visible,
  editingTransaction,
  closeModal,
  saveTransaction,
  deleteTransaction,
  // estados de los valores
  formType,
  setFormType,
  formMonto,
  setFormMonto,
  formCategoria,
  setFormCategoria,
  formDescripcion,
  setFormDescripcion,
  formFecha,
  setFormFecha,
}) {
  const montoFormat = formMonto ? formatearMonto(Number(formMonto)) : "";
  function handleMontoChange(text) {
    const raw = text.replace(/\D/g, "");
    setFormMonto(raw);
  }

  const [selectedMonto, setSelectedMonto] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState(false);

  const typeOfTransaction =
    formType === "gasto" ? categorias_gastos : categorias_ingresos;
  const [showDatePicker, setShowDatePicker] = useState(false);

  function handleSave() {
    const payload = {
      tipo: formType,
      monto: Number(formMonto),
      categoria: formCategoria,
      descripcion: formDescripcion,
      fecha: formFecha,
    };
    saveTransaction(payload, editingTransaction?.id);
    handleOpen();
  }

  function handleOpen() {
    setSelectedMonto(false);
    setSelectedDescription(false);
    closeModal();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleOpen}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          {/* header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Pressable onPress={handleOpen} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>⨉</Text>
              </Pressable>
              <Text style={styles.modalTitle}>
                {editingTransaction
                  ? "Editar transacción"
                  : "Nueva transacción"}
              </Text>
            </View>

            {/* action-bar */}
            <View style={styles.actionBar}>
              {editingTransaction ? (
                <Pressable
                  style={styles.iconAction}
                  onPress={() => {
                    deleteTransaction(editingTransaction.id);
                    handleOpen();
                  }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color="rgb(254, 83, 83)"
                  />
                </Pressable>
              ) : (
                <View style={styles.iconActionPlaceholder} />
              )}

              <Pressable style={styles.sendButton} onPress={handleSave}>
                <Text style={styles.sendButtonText}>✓</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.segmented}>
            <Pressable
              style={[
                styles.segmentButton,
                formType === "gasto" && styles.segmentButtonGastos,
              ]}
              onPress={() => setFormType("gasto")}
            >
              <Text style={styles.segmentText}>Gastos</Text>
            </Pressable>
            <Pressable
              style={[
                styles.segmentButton,
                formType === "ingreso" && styles.segmentButtonIngresos,
              ]}
              onPress={() => setFormType("ingreso")}
            >
              <Text style={styles.segmentText}>Ingresos</Text>
            </Pressable>
          </View>

          {/* formulario */}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <Text style={styles.labelCategories}>Categorias</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
              style={{ maxHeight: 120 }}
            >
              {typeOfTransaction.map((item, index) => (
                <View key={index}>
                  <Pressable
                    onPress={() => {
                      setFormCategoria(item.name);
                    }}
                    style={[
                      styles.categoryItem,
                      { backgroundColor: item.color },
                      formCategoria === item.name && styles.categoryItemActive,
                    ]}
                  >
                    <View>{item.icon}</View>
                  </Pressable>
                  <Text style={styles.categoryText}>
                    {item.name.length > 6
                      ? item.name.slice(0, 5) + "…"
                      : item.name}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <ScrollView>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderBottomColor: selectedMonto
                      ? "rgba(79,57,246)"
                      : "#334155",
                  },
                ]}
                placeholder="Monto"
                placeholderTextColor={
                  selectedMonto ? "rgba(119,119,255)" : "rgb(200,200,200)"
                }
                value={montoFormat}
                onChangeText={handleMontoChange}
                keyboardType="numeric"
                onFocus={() => setSelectedMonto(true)}
                onBlur={() => setSelectedMonto(false)}
              />

              <TextInput
                style={[
                  styles.input,
                  {
                    borderBottomColor: selectedDescription
                      ? "rgba(79,57,246)"
                      : "#334155",
                  },
                ]}
                placeholder="Descripción"
                placeholderTextColor={
                  selectedDescription ? "rgba(119,119,255)" : "rgb(200,200,200)"
                }
                value={formDescripcion}
                onChangeText={setFormDescripcion}
                onFocus={() => setSelectedDescription(true)}
                onBlur={() => setSelectedDescription(false)}
              />
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={styles.input}
              >
                <Text style={styles.inputDateText}>
                  {formFecha || "Fecha YYYY-MM-DD"}
                </Text>
              </Pressable>

              {showDatePicker && (
                <DateTimePicker
                  value={
                    formFecha
                      ? (() => {
                          const [year, month, day] = formFecha
                            .split("-")
                            .map(Number);
                          return new Date(year, month - 1, day);
                        })()
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  onValueChange={(event, selectedDate) => {
                    if (selectedDate) {
                      const year = selectedDate.getFullYear();
                      const month = String(
                        selectedDate.getMonth() + 1,
                      ).padStart(2, "0");
                      const day = String(selectedDate.getDate()).padStart(
                        2,
                        "0",
                      );
                      setFormFecha(`${year}-${month}-${day}`);
                    }
                    setShowDatePicker(false);
                  }}
                  onDismiss={() => setShowDatePicker(false)}
                />
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(25, 25, 25, 0.72)",
    justifyContent: "flex-end",
  },
  modalCard: {
    flex: 1,
    backgroundColor: "  rgb(20, 23, 28,0.9)",
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },

  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: { color: "#e2e8f0", fontSize: 18, lineHeight: 20 },
  actionBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconAction: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  iconActionPlaceholder: {
    width: 42,
    height: 42,
  },
  sendButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "rgb(119, 119, 255)",
    fontWeight: "800",
    fontSize: 18,
  },
  segmented: {
    flexDirection: "row",
    marginBottom: 14,
    backgroundColor: " rgb(32, 32, 38)",
    borderRadius: 10,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  segmentButtonGastos: {
    backgroundColor: "rgb(254, 83, 83)",
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  segmentButtonIngresos: {
    backgroundColor: " rgb(0, 212, 146)",
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  segmentText: { color: "white", fontWeight: "600", fontSize: 16 },
  input: {
    fontSize: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    padding: 18,
    color: "#f8fafc",
    marginBottom: 10,
  },
  inputDateText: {
    color: "white",
    fontSize: 17,
    color: "rgb(200,200,200)",
  },
  // iconos de categorias
  labelCategories: { color: "rgb(200,200,200)", fontSize: 17, marginTop: 15 },
  categoriesList: {
    flexDirection: "row",
    marginTop: 25,
    gap: 12,
  },
  categoryItem: {
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryItemActive: {
    transform: [{ scale: 1.1 }],
    backgroundColor: "rgba(79,57,246)",
  },
  categoryText: {
    marginTop: 6,
    color: "white",
    textAlign: "center",
  },
  categoryTextActive: {
    fontWeight: 700,
  },
});

export { TransactionModal };
