import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [validationMessage, setValidationMessage] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);

  async function handleSave() {
    const montoValue = Number(formMonto);
    const missingMonto =
      !formMonto || Number.isNaN(montoValue) || montoValue <= 0;
    const missingCategoria = !formCategoria;

    if (missingMonto && missingCategoria) {
      setValidationMessage(
        "Agrega un monto mayor a 0 y selecciona una categoría.",
      );
      return;
    }

    if (missingMonto) {
      setValidationMessage("El monto es obligatorio y debe ser mayor a 0.");
      return;
    }

    if (missingCategoria) {
      setValidationMessage("Debes seleccionar una categoría.");
      return;
    }

    setValidationMessage("");

    const payload = {
      tipo: formType,
      monto: montoValue,
      categoria: formCategoria,
      descripcion: formDescripcion,
      fecha: formFecha,
    };

    const ok = await saveTransaction(payload, editingTransaction?.id);
    if (ok) handleOpen();
    else setValidationMessage("No se pudo guardar. Intenta de nuevo.");
  }

  function handleOpen() {
    setSelectedMonto(false);
    setSelectedDescription(false);
    setValidationMessage("");
    closeModal();
  }

  const [expanded, setExpanded] = useState(null);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleOpen}
    >
      <SafeAreaView style={styles.safeArea}>
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

              <View style={styles.actionBar}>
                <View style={styles.iconDeleteSpace}>
                  {editingTransaction && (
                    <Pressable
                      style={styles.iconDelete}
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
                  )}
                </View>

                <Pressable style={styles.sendButton} onPress={handleSave}>
                  <Text style={styles.iconSend}>✓</Text>
                </Pressable>
              </View>
            </View>

            {/* action-bar */}
            <View style={styles.segmented}>
              <Pressable
                style={[
                  styles.segmentButton,
                  formType === "gasto" && styles.segmentButtonGastos,
                ]}
                onPress={() => {
                  setFormType("gasto");
                  setFormCategoria("");
                }}
              >
                <Text style={styles.segmentText}>Gastos</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.segmentButton,
                  formType === "ingreso" && styles.segmentButtonIngresos,
                ]}
                onPress={() => {
                  setFormType("ingreso");
                  setFormCategoria("");
                }}
              >
                <Text style={styles.segmentText}>Ingresos</Text>
              </Pressable>
            </View>

            {/* formulario */}
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1, marginTop: 20 }}
            >
              <View>
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
                    selectedDescription
                      ? "rgba(119,119,255)"
                      : "rgb(200,200,200)"
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

                <Pressable
                  // onPress={() => setShowDatePicker(true)}
                  style={styles.input}
                >
                  <Text style={styles.inputCategorias}>
                    {formCategoria || "Categorias"}
                  </Text>
                </Pressable>

                {validationMessage ? (
                  <Text style={styles.validationText}>{validationMessage}</Text>
                ) : null}

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
              </View>

              {formType === "gasto" ? (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesList}
                  style={{ marginTop: 20, flex: 1 }}
                >
                  {categorias_gastos.map((item, index) => (
                    <View key={index} style={styles.categoryCard}>
                      <View
                        style={[
                          styles.categoryItem,
                          { backgroundColor: item.color },
                        ]}
                      >
                        <Pressable
                          onPress={() => {
                            setFormCategoria(item.name);
                          }}
                          style={styles.buttonCategoryIcon}
                        >
                          <View>{item.icon}</View>
                          <Text style={styles.categoryText}>{item.name}</Text>
                        </Pressable>

                        <Pressable
                          style={styles.buttonIconDesplegar}
                          onPress={() =>
                            setExpanded(
                              expanded === item.name ? null : item.name,
                            )
                          }
                        >
                          <Text style={styles.iconDesplegar}>
                            {expanded === item.name ? "-" : "+"}
                          </Text>
                        </Pressable>
                      </View>

                      {/* Subcategorías */}
                      {expanded === item.name && (
                        <View style={styles.subcategoriesWrapper}>
                          {item.subcategorias?.map((sub, i) => (
                            <Pressable
                              key={i}
                              style={[
                                styles.subcategoryItem,
                                { backgroundColor: item.color },
                              ]}
                              onPress={() => setFormCategoria(sub.name)}
                            >
                              <Text style={styles.subcategoryText}>
                                {sub.name}
                              </Text>
                            </Pressable>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.categoriesList}>
                  {categorias_ingresos.map((item, index) => (
                    <View key={index}>
                      <Pressable
                        onPress={() => {
                          setFormCategoria(item.name);
                        }}
                        style={[
                          styles.categoryItem,
                          { backgroundColor: item.color },
                        ]}
                      >
                        <View>{item.icon}</View>
                        <Text style={styles.categoryText}>{item.name}</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
            </KeyboardAvoidingView>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "rgba(79, 57, 246,0.2)" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(25, 25, 25, 0.72)",
    justifyContent: "flex-end",
  },
  modalCard: {
    flex: 1,
    backgroundColor: "  rgba(20, 23, 28,0.9)",
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
  iconDelete: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconDeleteSpace: {
    flex: 1,
  },
  sendButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  iconSend: {
    color: "rgb(119, 119, 255)",
    fontWeight: "800",
    fontSize: 18,
    marginLeft: "auto",
  },
  segmented: {
    flexDirection: "row",
    marginBottom: 14,
    marginTop: 14,
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
    color: "rgb(200,200,200)",
    fontSize: 17,
  },
  validationText: {
    color: "#fda4af",
    fontSize: 14,
    marginBottom: 10,
    marginHorizontal: 4,
  },
  // iconos de categorias
  inputCategorias: { color: "rgb(200,200,200)", fontSize: 17 },
  categoryCard: {
    flexDirection: "column",
    gap: 10,
  },
  categoriesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    gap: 12,
  },
  categoryItem: {
    width: 170,
    height: 55,
    flexDirection: "row",
    borderRadius: 10,
    justifyContent: "space-around",
    alignItems: "center",
  },
  buttonCategoryIcon: { flex: 3.5, alignItems: "center" },
  categoryText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonIconDesplegar: { flex: 1 },
  iconDesplegar: {
    fontSize: 30,
    color: "white",
    textAlign: "center",
  },
  // sucategorias
  subcategoriesWrapper: {
    flexDirection: "column",
  },
  subcategoryItem: {
    padding: 8,
    borderRadius: 6,
    marginVertical: 4,
  },
  subcategoryText: {
    color: "white",
  },
});

export { TransactionModal };
