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
  saveTransfer,
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
  cuentas,
  formCuentaId,
  setFormCuentaId,
  formCuentaDestinoId,
  setFormCuentaDestinoId,
}) {
  const montoFormat = formMonto ? formatearMonto(Number(formMonto)) : "";
  function handleMontoChange(text) {
    const raw = text.replace(/\D/g, "");
    setFormMonto(raw);
  }

  const [selectedMonto, setSelectedMonto] = useState(false);
  const [selectedDescription, setSelectedDescription] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [accountPickerTarget, setAccountPickerTarget] = useState("account");

  async function handleSave() {
    const montoValue = Number(formMonto);
    const missingMonto =
      !formMonto || Number.isNaN(montoValue) || montoValue <= 0;
    const missingCategoria = !formCategoria;

    if (formType === "transferencia") {
      const origen = cuentas.find((cuenta) => cuenta.id === formCuentaId);
      const destino = cuentas.find(
        (cuenta) => cuenta.id === formCuentaDestinoId,
      );

      if (missingMonto || !origen || !destino || origen.id === destino.id) {
        setValidationMessage(
          "Indica un monto y dos cuentas distintas para la transferencia.",
        );
        return;
      }

      const ok = await saveTransfer({
        monto: montoValue,
        fecha: formFecha,
        origen,
        destino,
      });
      if (ok) handleOpen();
      else setValidationMessage("No se pudo guardar la transferencia.");
      return;
    }

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
      cuenta_id: formCuentaId,
    };

    const ok = await saveTransaction(payload, editingTransaction?.id);
    if (ok) handleOpen();
    else setValidationMessage("No se pudo guardar. Intenta de nuevo.");
  }

  function handleOpen() {
    setSelectedMonto(false);
    setSelectedDescription(false);
    setSelectedCategory(false);
    setValidationMessage("");
    setCategoryModalVisible(false);
    setAccountModalVisible(false);
    setFormCuentaDestinoId(null);
    setAccountPickerTarget("account");
    closeModal();
  }

  const selectedAccount = cuentas.find((cuenta) => cuenta.id === formCuentaId);
  const transferDestination = cuentas.find(
    (cuenta) => cuenta.id === formCuentaDestinoId,
  );

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
                        deleteTransaction(editingTransaction);
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
                  <Text style={styles.iconSend}>Guardar</Text>
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
              <Pressable
                style={[
                  styles.segmentButton,
                  formType === "transferencia" && styles.segmentButtonTransfer,
                ]}
                onPress={() => {
                  setFormType("transferencia");
                  setFormCategoria("");
                  setFormDescripcion("");
                }}
              >
                <Text style={styles.segmentText}>Transferencias</Text>
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

                {formType !== "transferencia" && (
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
                )}
                {formType !== "transferencia" && (
                  <Pressable
                    onPress={() => setShowDatePicker(true)}
                    style={styles.input}
                  >
                    <Text style={styles.inputDateText}>
                      {formFecha || "Fecha YYYY-MM-DD"}
                    </Text>
                  </Pressable>
                )}

                <Pressable
                  style={styles.accountInput}
                  onPress={() => {
                    setAccountPickerTarget("account");
                    setAccountModalVisible(true);
                  }}
                >
                  <Text style={styles.accountInputLabel}>
                    {formType === "transferencia" ? "Cuenta origen" : "Cuenta"}
                  </Text>
                  <Text style={styles.accountInputValue}>
                    {selectedAccount?.nombre || "Selecciona una cuenta"}
                  </Text>
                  <Ionicons name="chevron-down" size={22} color="white" />
                </Pressable>

                {formType === "transferencia" ? (
                  <Pressable
                    style={styles.accountInput}
                    onPress={() => {
                      setAccountPickerTarget("destination");
                      setAccountModalVisible(true);
                    }}
                  >
                    <Text style={styles.accountInputLabel}>Cuenta destino</Text>
                    <Text style={styles.accountInputValue}>
                      {transferDestination?.nombre || "Selecciona una cuenta"}
                    </Text>
                    <Ionicons name="chevron-down" size={22} color="white" />
                  </Pressable>
                ) : (
                  <View
                    style={[
                      styles.categoryInputRow,
                      {
                        borderBottomColor: selectedCategory
                          ? "rgba(79,57,246)"
                          : "#334155",
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.input, styles.categoryTextInput]}
                      placeholder="Categoría"
                      placeholderTextColor={
                        selectedCategory
                          ? "rgba(119,119,255)"
                          : "rgb(200,200,200)"
                      }
                      value={formCategoria}
                      onChangeText={setFormCategoria}
                      onFocus={() => setSelectedCategory(true)}
                      onBlur={() => setSelectedCategory(false)}
                    />
                    <Pressable
                      accessibilityLabel="Abrir categorías"
                      onPress={() => setCategoryModalVisible(true)}
                      style={styles.categoryPickerButton}
                    >
                      <Ionicons name="chevron-down" size={22} color="white" />
                    </Pressable>
                  </View>
                )}

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

              <Modal
                visible={categoryModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setCategoryModalVisible(false)}
              >
                <View style={styles.categoryModalBackdrop}>
                  <View style={styles.categoryModalCard}>
                    <View style={styles.categoryModalHeader}>
                      <Text style={styles.categoryModalTitle}>
                        {expanded
                          ? `Selecciona en ${expanded.name}`
                          : "Selecciona una categoría"}
                      </Text>
                      <Pressable
                        onPress={() => {
                          setCategoryModalVisible(false);
                          setExpanded(null);
                        }}
                        style={styles.closeButton}
                      >
                        <Ionicons name="close" size={22} color="white" />
                      </Pressable>
                    </View>
                    {expanded && (
                      <Pressable
                        onPress={() => setExpanded(null)}
                        style={styles.backCategoryButton}
                      >
                        <Ionicons name="arrow-back" size={18} color="white" />
                        <Text style={styles.backCategoryText}>
                          Todas las categorías
                        </Text>
                      </Pressable>
                    )}
                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={
                        expanded
                          ? styles.subcategoriesList
                          : styles.categoriesList
                      }
                    >
                      {(expanded
                        ? expanded.subcategorias
                        : formType === "gasto"
                          ? categorias_gastos
                          : categorias_ingresos
                      ).map((item, index) => {
                        if (expanded) {
                          return (
                            <Pressable
                              key={index}
                              style={[
                                styles.subcategoryItem,
                                { backgroundColor: expanded.color },
                              ]}
                              onPress={() => {
                                setFormCategoria(item.name);
                                setCategoryModalVisible(false);
                                setExpanded(null);
                              }}
                            >
                              {item.icon || expanded.icon}
                              <Text style={styles.subcategoryText}>
                                {item.name}
                              </Text>
                            </Pressable>
                          );
                        }

                        return (
                          <View key={index} style={styles.categoryCard}>
                            <View
                              style={[
                                styles.categoryItem,
                                { backgroundColor: item.color },
                              ]}
                            >
                              <Pressable
                                style={styles.categorySelect}
                                onPress={() => {
                                  setFormCategoria(item.name);
                                  setCategoryModalVisible(false);
                                }}
                              >
                                <View style={styles.categoryIconSlot}>
                                  {item.icon}
                                </View>
                                <Text
                                  style={styles.categoryText}
                                  numberOfLines={2}
                                >
                                  {item.name}
                                </Text>
                              </Pressable>
                              <View style={styles.categoryArrowSlot}>
                                {item.subcategorias?.length ? (
                                  <Pressable
                                    accessibilityLabel={`Ver subcategorías de ${item.name}`}
                                    onPress={() => setExpanded(item)}
                                    hitSlop={8}
                                  >
                                    <Ionicons
                                      name="chevron-forward"
                                      size={20}
                                      color="white"
                                    />
                                  </Pressable>
                                ) : null}
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>
              </Modal>

              <Modal
                visible={accountModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setAccountModalVisible(false)}
              >
                <View style={styles.categoryModalBackdrop}>
                  <View style={styles.accountModalCard}>
                    <View style={styles.categoryModalHeader}>
                      <Text style={styles.categoryModalTitle}>
                        {accountPickerTarget === "destination"
                          ? "Cuenta destino"
                          : "Tus cuentas"}
                      </Text>
                      <Pressable
                        onPress={() => setAccountModalVisible(false)}
                        style={styles.closeButton}
                      >
                        <Ionicons name="close" size={22} color="white" />
                      </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                      {cuentas.map((cuenta) => (
                        <View key={cuenta.id} style={styles.accountItem}>
                          <Pressable
                            style={styles.accountSelect}
                            onPress={() => {
                              if (accountPickerTarget === "destination") {
                                setFormCuentaDestinoId(cuenta.id);
                              } else {
                                setFormCuentaId(cuenta.id);
                              }
                              setAccountModalVisible(false);
                            }}
                          >
                            <Ionicons
                              name={
                                cuenta.id ===
                                (accountPickerTarget === "destination"
                                  ? formCuentaDestinoId
                                  : formCuentaId)
                                  ? "radio-button-on"
                                  : "radio-button-off"
                              }
                              size={20}
                              color="rgb(119, 119, 255)"
                            />
                            <Text style={styles.accountName}>
                              {cuenta.nombre}
                            </Text>
                          </Pressable>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </Modal>
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
  },
  segmentButtonTransfer: {
    backgroundColor: "rgb(79, 57, 246)",
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
  categoryInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    marginBottom: 10,
  },
  categoryTextInput: {
    flex: 1,
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  categoryPickerButton: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  accountInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    marginBottom: 10,
  },
  accountInputLabel: { color: "#94a3b8", fontSize: 14 },
  accountInputValue: { flex: 1, color: "#f8fafc", fontSize: 17 },
  // Modal de categorias
  categoryModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(25, 25, 25, 0.72)",
    justifyContent: "flex-end",
    paddingBottom: 60,
  },
  categoryModalCard: {
    maxHeight: "78%",
    backgroundColor: "rgba(20, 23, 28, 0.98)",
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#1e293b",
  },
  accountModalCard: {
    maxHeight: "78%",
    backgroundColor: "rgba(20, 23, 28, 0.98)",
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#1e293b",
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  accountSelect: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  accountName: { color: "white", fontSize: 16 },
  categoryModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  categoryModalTitle: {
    color: "white",
    fontSize: 17,
    fontWeight: "800",
  },
  backCategoryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  backCategoryText: {
    color: "#cbd5e1",
    fontSize: 14,
  },
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
  subcategoriesList: {
    gap: 10,
  },
  categoryItem: {
    width: 170,
    height: 55,
    flexDirection: "row",
    borderRadius: 10,
    alignItems: "center",
    paddingHorizontal: 10,
    gap: 8,
  },
  categorySelect: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  categoryIconSlot: {
    width: 24,
    alignItems: "center",
  },
  categoryArrowSlot: {
    width: 20,
    alignItems: "center",
  },
  categoryText: {
    flex: 1,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  subcategoryItem: {
    minHeight: 52,
    padding: 12,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  subcategoryText: {
    color: "white",
  },
});

export { TransactionModal };
