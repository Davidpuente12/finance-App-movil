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
import { useTheme } from "../theme/ThemeContext";

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
  formCategoriaPadre,
  setFormCategoriaPadre,
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
  const { colors } = useTheme();
  const styles = createStyles(colors);
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

      const ok = await saveTransfer(
        {
          monto: montoValue,
          fecha: formFecha,
          origen,
          destino,
        },
        editingTransaction,
      );
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
      categoria_padre: formCategoriaPadre,
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

  function resetInputSelection() {
    setSelectedMonto(false);
    setSelectedDescription(false);
    setSelectedCategory(false);
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
                  <Text style={styles.closeButtonIcon}>⨉</Text>
                </Pressable>
                <Text style={styles.modalTitle}>
                  {editingTransaction
                    ? "Editar transacción"
                    : "Nueva transacción"}
                </Text>
              </View>

              <View style={styles.actionBar}>
                {editingTransaction && (
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => {
                      deleteTransaction(editingTransaction);
                      handleOpen();
                    }}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={colors.negative}
                    />
                  </Pressable>
                )}

                <Pressable style={styles.sendButton} onPress={handleSave}>
                  <Text style={styles.textButton}>Guardar</Text>
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
                  setFormCategoriaPadre(null);
                  resetInputSelection();
                }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    formType === "gasto" && { color: "white" },
                  ]}
                >
                  Gastos
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.segmentButton,
                  formType === "ingreso" && styles.segmentButtonIngresos,
                ]}
                onPress={() => {
                  setFormType("ingreso");
                  setFormCategoria("");
                  setFormCategoriaPadre(null);
                  resetInputSelection();
                }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    formType === "ingreso" && { color: "white" },
                  ]}
                >
                  Ingresos
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.segmentButton,
                  formType === "transferencia" && styles.segmentButtonTransfer,
                  { flex: 1.5 },
                ]}
                onPress={() => {
                  setFormType("transferencia");
                  setFormCategoria("");
                  setFormCategoriaPadre(null);
                  setFormDescripcion("");
                  resetInputSelection();
                }}
              >
                <Text
                  style={[
                    styles.segmentText,
                    formType === "transferencia" && { color: "white" },
                  ]}
                >
                  Transferencias
                </Text>
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
                        ? colors.primaryText
                        : colors.borderStrong,
                    },
                  ]}
                  placeholder="Monto"
                  placeholderTextColor={
                    selectedMonto ? colors.primaryText : colors.inputText
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
                          ? colors.primaryText
                          : colors.borderStrong,
                      },
                    ]}
                    placeholder="Descripción"
                    placeholderTextColor={
                      selectedDescription
                        ? colors.primaryText
                        : colors.inputText
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
                  <Ionicons name="chevron-down" size={22} color={colors.text} />
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
                    <Ionicons
                      name="chevron-down"
                      size={22}
                      color={colors.text}
                    />
                  </Pressable>
                ) : (
                  <View
                    style={[
                      styles.categoryInputRow,
                      {
                        borderBottomColor: selectedCategory
                          ? colors.primaryText
                          : colors.borderStrong,
                      },
                    ]}
                  >
                    <TextInput
                      style={[styles.input, styles.categoryTextInput]}
                      placeholder="Categoría"
                      placeholderTextColor={
                        selectedCategory ? colors.primaryText : colors.inputText
                      }
                      value={formCategoria}
                      onChangeText={(value) => {
                        setFormCategoria(value);
                        setFormCategoriaPadre(null);
                      }}
                      onFocus={() => setSelectedCategory(true)}
                      onBlur={() => setSelectedCategory(false)}
                    />
                    <Pressable
                      accessibilityLabel="Abrir categorías"
                      onPress={() => setCategoryModalVisible(true)}
                      style={styles.categoryPickerButton}
                    >
                      <Ionicons
                        name="chevron-down"
                        size={22}
                        color={colors.text}
                      />
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
                    {/* Header */}
                    <View style={styles.categoryModalHeader}>
                      {expanded && (
                        <Pressable
                          onPress={() => setExpanded(null)}
                          style={styles.backCategoryButton}
                        >
                          <Ionicons
                            name="arrow-back"
                            size={20}
                            color={colors.text}
                          />
                        </Pressable>
                      )}
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
                        <Text style={styles.closeButtonIcon}>⨉</Text>
                      </Pressable>
                    </View>

                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.categoriesList}
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
                              style={styles.subcategoryItem}
                              onPress={() => {
                                setFormCategoria(item.name);
                                setFormCategoriaPadre(expanded.name);
                                setCategoryModalVisible(false);
                                setExpanded(null);
                              }}
                            >
                              <View
                                style={[
                                  styles.categoryIconSlot,
                                  { backgroundColor: expanded.color },
                                ]}
                              >
                                {item.icon || expanded.icon}
                              </View>
                              <Text style={styles.categoryText}>
                                {item.name}
                              </Text>
                            </Pressable>
                          );
                        }

                        return (
                          <View key={index} style={styles.categoryItem}>
                            <Pressable
                              style={styles.categorySelect}
                              onPress={() => {
                                setFormCategoria(item.name);
                                setFormCategoriaPadre(null);
                                setCategoryModalVisible(false);
                              }}
                            >
                              <View
                                style={[
                                  styles.categoryIconSlot,
                                  { backgroundColor: item.color },
                                ]}
                              >
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
                                    color={colors.text}
                                  />
                                </Pressable>
                              ) : null}
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
                        <Text style={styles.closeButtonIcon}>⨉</Text>
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
                              color={colors.primaryText}
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

function createStyles(colors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.primarySoft },
    modalBackdrop: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
    },
    modalCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 16,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 12,
      gap: 10,
    },

    headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    modalTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "500",
    },
    closeButton: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    closeButtonIcon: {
      color: colors.textSecondary,
      fontSize: 15,
      lineHeight: 20,
    },
    actionBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 10,
    },
    sendButton: {
      backgroundColor: colors.primary,
      width: "50%",
      alignItems: "center",
      padding: 8,
      borderRadius: 8,
    },
    deleteButton: {
      borderWidth: 1,
      borderColor: colors.negative,
      width: "30%",
      alignItems: "center",
      padding: 8,
      borderRadius: 8,
    },
    textButton: {
      color: colors.text,
      fontWeight: "500",
      fontSize: 15,
    },
    // Transaction bar
    segmented: {
      flexDirection: "row",
      marginVertical: 14,
      backgroundColor: colors.border,
      borderRadius: 5,
    },
    segmentButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
    },
    segmentButtonGastos: {
      backgroundColor: colors.expense,
      borderRadius: 5,
    },
    segmentButtonIngresos: {
      backgroundColor: colors.income,
      borderRadius: 5,
    },
    segmentButtonTransfer: {
      backgroundColor: colors.accent,
      borderRadius: 5,
    },
    segmentText: {
      color: colors.textMuted,
      fontWeight: "500",
      fontSize: 17,
    },
    input: {
      fontSize: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderStrong,
      padding: 18,
      color: colors.textStrong,
      marginBottom: 10,
    },
    inputDateText: {
      color: colors.inputText,
      fontSize: 16,
    },
    validationText: {
      backgroundColor: `${colors.negative}20`,
      color: colors.negativeSoft,
      fontSize: 13,
      padding: 12,
      marginTop: 10,
      borderLeftColor: colors.negative,
      borderLeftWidth: 3,
      borderRadius: 5,
    },

    // Iconos de categorias
    categoryInputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: colors.borderStrong,
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
      borderBottomColor: colors.borderStrong,
      marginBottom: 10,
    },
    accountInputLabel: { color: colors.textMuted, fontSize: 14 },
    accountInputValue: { flex: 1, color: colors.textStrong, fontSize: 16 },

    // Modal de categorias
    categoryModalBackdrop: {
      flex: 1,
      backgroundColor: colors.modalOverlay,
      justifyContent: "flex-end",
      marginBottom: 49,
    },
    categoryModalCard: {
      maxHeight: "78%",
      backgroundColor: colors.surface,
      padding: 16,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: colors.border,
    },
    categoryModalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    categoryModalTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "500",
    },
    backCategoryButton: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    categoriesList: {
      gap: 12,
    },
    categoryItem: {
      width: "70%",
      height: 55,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    subcategoryItem: {
      height: 55,
      flexDirection: "row",
      alignItems: "center",
      gap: 20,
    },
    categorySelect: {
      gap: 20,
      flexDirection: "row",
      alignItems: "center",
    },
    categoryIconSlot: {
      width: 45,
      height: 45,
      borderRadius: 25,
      alignItems: "center",
      justifyContent: "center",
    },
    categoryText: {
      color: colors.textSecondary,
      fontSize: 16,
      fontWeight: "500",
    },
    categoryArrowSlot: {
      width: 20,
    },

    // Modal de cuentas
    accountModalCard: {
      maxHeight: "78%",
      backgroundColor: colors.surface,
      padding: 16,
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      borderWidth: 1,
      borderBottomWidth: 0,
      borderColor: colors.border,
    },
    accountItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderStrong,
    },
    accountSelect: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    accountName: { color: colors.text, fontSize: 16 },
  });
}

export { TransactionModal };
