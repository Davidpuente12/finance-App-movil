import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";
import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { categorias_gastos } from "../data/categoriasfinas";
import { useTheme } from "../theme/ThemeContext";
import { formatearMonto } from "../utils/formatearMonto";
import { mesesMap } from "../utils/fechaActual";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const TOTAL_BUDGET_KEY = "__total__";

const categoryOptions = categorias_gastos.flatMap((category) => [
  {
    clave: `categoria:${category.name}`,
    nombre: category.name,
    category: category.name,
    color: category.color,
    icon: category.icon,
  },
  ...(category.subcategorias || []).map((subcategory) => ({
    clave: `subcategoria:${category.name}:${subcategory.name}`,
    nombre: `${category.name} · ${subcategory.name}`,
    category: category.name,
    subcategory: subcategory.name,
    color: category.color,
    icon: subcategory.icon || category.icon,
  })),
]);

const uniqueSubcategories = new Set(
  categoryOptions
    .filter((option) => option.subcategory)
    .map((option) => option.subcategory)
    .filter(
      (name, index, allNames) =>
        allNames.filter((currentName) => currentName === name).length === 1 &&
        allNames.indexOf(name) === index &&
        !categorias_gastos.some((category) => category.name === name),
    ),
);

function getPeriodIndex(period) {
  const [year, month] = period.split("-").map(Number);
  return year * 12 + month - 1;
}

function isExpenseForBudget(transaction, budget) {
  if (
    transaction.tipo !== "gasto" ||
    transaction.categoria === "Transferencia"
  ) {
    return false;
  }

  if (budget.clave === TOTAL_BUDGET_KEY) return true;

  const option = categoryOptions.find(
    (current) => current.clave === budget.clave,
  );
  if (!option) return transaction.categoria === budget.nombre;

  if (option.subcategory) {
    return (
      transaction.categoria === option.subcategory &&
      (transaction.categoria_padre === option.category ||
        (!transaction.categoria_padre &&
          uniqueSubcategories.has(option.subcategory)))
    );
  }

  return (
    transaction.categoria === option.category ||
    transaction.categoria_padre === option.category ||
    (!transaction.categoria_padre &&
      categoryOptions.some(
        (subcategoryOption) =>
          subcategoryOption.category === option.category &&
          subcategoryOption.subcategory === transaction.categoria &&
          uniqueSubcategories.has(subcategoryOption.subcategory),
      ))
  );
}

function getBudgetStatus(spent, available) {
  if (available <= 0 || spent > available) return "excedido";
  if (spent / available >= 0.8) return "limite";
  return "normal";
}

export function BudgetsScreen({
  lista,
  presupuestos,
  saveBudget,
  deleteBudget,
  registerBudgetAlert,
  filterMonth,
  filterYear,
  setFilterMonth,
  setFilterYear,
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [editorVisible, setEditorVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [amount, setAmount] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const formattedAmount = amount ? formatearMonto(Number(amount)) : "";

  const period = useMemo(() => {
    const month = mesesMap[filterMonth] || new Date().getMonth() + 1;
    const year = Number(filterYear) || new Date().getFullYear();
    return `${year}-${String(month).padStart(2, "0")}`;
  }, [filterMonth, filterYear]);

  const budgetSummaries = useMemo(() => {
    const currentIndex = getPeriodIndex(period);

    return presupuestos
      .filter((budget) => getPeriodIndex(budget.inicio) <= currentIndex)
      .map((budget) => {
        const startIndex = getPeriodIndex(budget.inicio);
        const activeMonths = currentIndex - startIndex + 1;
        const matchingTransactions = lista.filter((transaction) =>
          isExpenseForBudget(transaction, budget),
        );
        const spent = matchingTransactions
          .filter((transaction) => transaction.fecha.startsWith(period))
          .reduce((total, transaction) => total + Number(transaction.monto), 0);
        const spentBefore = matchingTransactions
          .filter((transaction) => {
            const transactionIndex = getPeriodIndex(
              transaction.fecha.slice(0, 7),
            );
            return (
              transactionIndex >= startIndex && transactionIndex < currentIndex
            );
          })
          .reduce((total, transaction) => total + Number(transaction.monto), 0);
        const available = Number(budget.monto) * activeMonths - spentBefore;
        const carryover = available - Number(budget.monto);

        return {
          ...budget,
          spent,
          available,
          carryover,
          status: getBudgetStatus(spent, available),
          progress: available > 0 ? Math.min(spent / available, 1) : 1,
        };
      });
  }, [lista, period, presupuestos]);

  const totalBudget = budgetSummaries.find(
    (budget) => budget.clave === TOTAL_BUDGET_KEY,
  );
  const categoryBudgets = budgetSummaries.filter(
    (budget) => budget.clave !== TOTAL_BUDGET_KEY,
  );
  const alerts = budgetSummaries.filter((budget) => budget.status !== "normal");
  useEffect(() => {
    const sendNewAlerts = async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("presupuestos", {
          name: "Presupuestos",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const permissions = await Notifications.getPermissionsAsync();
      const permission = permissions.granted
        ? permissions
        : await Notifications.requestPermissionsAsync();
      if (!permission.granted) return;

      for (const budget of alerts) {
        const isExceeded = budget.status === "excedido";
        const created = await registerBudgetAlert(
          budget.id,
          period,
          budget.status,
        );
        if (!created) continue;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: isExceeded
              ? "Presupuesto excedido"
              : "Presupuesto cerca del límite",
            body: isExceeded
              ? `${budget.nombre}: superaste el monto disponible.`
              : `${budget.nombre}: ya usaste el 80% del monto disponible.`,
            data: { budgetId: budget.id, period },
          },
          trigger: null,
        });
      }
    };

    if (alerts.length) sendNewAlerts();
  }, [alerts, period, registerBudgetAlert]);

  const openEditor = (budget, option) => {
    setEditingBudget(budget);
    setSelectedOption(option);
    setAmount(budget ? String(budget.monto) : "");
    setFormMessage("");
    setEditorVisible(true);
  };

  const openTotalEditor = () =>
    openEditor(totalBudget || null, {
      clave: TOTAL_BUDGET_KEY,
      nombre: "Presupuesto mensual total",
      color: colors.primary,
    });

  const changePeriod = (direction) => {
    const date = new Date(Number(filterYear), (mesesMap[filterMonth] || 1) - 1);
    date.setMonth(date.getMonth() + direction);
    const monthNames = Object.keys(mesesMap);
    setFilterMonth(monthNames[date.getMonth()]);
    setFilterYear(String(date.getFullYear()));
  };

  const handleSave = async () => {
    const parsedAmount = Number(amount);
    if (!selectedOption || !parsedAmount || parsedAmount <= 0) {
      setFormMessage("Ingresa un monto mayor a 0.");
      return;
    }

    const saved = await saveBudget({
      id: editingBudget?.id,
      clave: selectedOption.clave,
      nombre: selectedOption.nombre,
      monto: parsedAmount,
      inicio: editingBudget?.inicio || period,
    });
    if (!saved) {
      setFormMessage("No se pudo guardar este presupuesto.");
      return;
    }

    setEditorVisible(false);
  };

  const handleDelete = async () => {
    if (!editingBudget) return;
    await deleteBudget(editingBudget.id);
    setEditorVisible(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.periodControl}>
        <Pressable
          accessibilityLabel="Ver mes anterior"
          onPress={() => changePeriod(-1)}
          style={styles.periodButton}
        >
          <Ionicons name="chevron-back" size={20} color={colors.primaryText} />
        </Pressable>
        <Text style={styles.subtitle}>{`${filterMonth} ${filterYear}`}</Text>
        <Pressable
          accessibilityLabel="Ver mes siguiente"
          onPress={() => changePeriod(1)}
          style={styles.periodButton}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.primaryText}
          />
        </Pressable>
      </View>
      <View
        style={[
          styles.section,
          { borderTopEndRadius: 0, borderTopStartRadius: 0 },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Presupuestos</Text>
          <Text style={styles.rolloverNote}>
            El dinero que no uses se acumula para el mes siguiente.
          </Text>
        </View>

        {alerts.length > 0 && (
          <View style={styles.alertBox}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color={colors.negative}
            />
            <Text style={styles.alertText}>
              {alerts.length === 1
                ? `${alerts[0].nombre} requiere atención.`
                : `${alerts.length} presupuestos requieren atención.`}
            </Text>
          </View>
        )}

        <View style={styles.totalSummary}>
          <View style={styles.totalSummaryHeader}>
            <View>
              <View style={styles.totalBudgetLabelRow}>
                <Text style={styles.cardEyebrow}>
                  Presupuesto mensual total
                </Text>
                {totalBudget && (
                  <Pressable
                    accessibilityLabel="Editar presupuesto mensual total"
                    onPress={openTotalEditor}
                    style={styles.totalEditButton}
                  >
                    <Ionicons
                      name="pencil-outline"
                      size={20}
                      color={colors.primaryText}
                    />
                  </Pressable>
                )}
              </View>
              {totalBudget && (
                <Text style={styles.totalAmount}>
                  {formatearMonto(totalBudget.available)}
                </Text>
              )}
            </View>

            <View style={styles.totalAvailableArea}>
              {totalBudget && (
                <Text
                  style={[
                    styles[`statusText_${totalBudget.status}`],
                    styles.totalAvailableAmount,
                  ]}
                >
                  {formatearMonto(totalBudget.available - totalBudget.spent)}
                </Text>
              )}
            </View>
          </View>

          {totalBudget ? (
            <>
              <Text style={styles.cardDetail}>
                {`${formatearMonto(totalBudget.spent)} gastados de ${formatearMonto(totalBudget.available)} disponibles`}
              </Text>
              <BudgetProgress budget={totalBudget} styles={styles} />
            </>
          ) : (
            <Pressable
              accessibilityLabel="Editar presupuesto mensual total"
              onPress={openTotalEditor}
              style={styles.primaryButton}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.primaryButtonText}>
                Definir presupuesto total
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Por categoría</Text>
          <Pressable
            accessibilityLabel="Agregar presupuesto por categoría"
            onPress={() => setCategoryPickerVisible(true)}
            style={styles.addButton}
          >
            <Ionicons name="add" size={21} color="white" />
          </Pressable>
        </View>

        {categoryBudgets.length ? (
          <View style={styles.budgetList}>
            {categoryBudgets.map((budget) => (
              <BudgetRow
                key={budget.id}
                budget={budget}
                styles={styles}
                colors={colors}
                onPress={() =>
                  openEditor(
                    budget,
                    categoryOptions.find(
                      (option) => option.clave === budget.clave,
                    ),
                  )
                }
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="pie-chart-outline"
              size={28}
              color={colors.textMuted}
            />
            <Text style={styles.emptyText}>
              Crea un límite para una categoría o subcategoría.
            </Text>
          </View>
        )}
      </View>

      <Modal
        visible={categoryPickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCategoryPickerVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea} edges={["bottom"]}>
          <View style={styles.modalBackdrop}>
            <View style={styles.pickerCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Elegir categoría</Text>
                <Pressable
                  accessibilityLabel="Cerrar selector de categorías"
                  onPress={() => setCategoryPickerVisible(false)}
                  style={styles.iconButton}
                >
                  <Ionicons name="close" size={22} color={colors.text} />
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {categoryOptions.map((option) => {
                  const exists = presupuestos.some(
                    (budget) => budget.clave === option.clave,
                  );
                  return (
                    <Pressable
                      disabled={exists}
                      key={option.clave}
                      onPress={() => {
                        setCategoryPickerVisible(false);
                        openEditor(null, option);
                      }}
                      style={[
                        styles.categoryOption,
                        exists && styles.categoryOptionDisabled,
                      ]}
                    >
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: option.color },
                        ]}
                      >
                        {option.icon}
                      </View>
                      <Text style={styles.categoryOptionText}>
                        {option.nombre}
                      </Text>
                      {exists && <Text style={styles.existsText}>Creado</Text>}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={editorVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditorVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea} edges={["bottom"]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalKeyboardAvoider}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.editorCard}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingBudget ? "Editar presupuesto" : "Nuevo presupuesto"}
                  </Text>
                  <Pressable
                    accessibilityLabel="Cerrar editor de presupuesto"
                    onPress={() => setEditorVisible(false)}
                    style={styles.iconButton}
                  >
                    <Ionicons name="close" size={22} color={colors.text} />
                  </Pressable>
                </View>
                <Text style={styles.inputLabel}>{selectedOption?.nombre}</Text>
                <TextInput
                  autoFocus
                  keyboardType="numeric"
                  onChangeText={(value) => setAmount(value.replace(/\D/g, ""))}
                  placeholder="Monto mensual"
                  placeholderTextColor={colors.textMuted}
                  style={styles.amountInput}
                  value={formattedAmount}
                />
                <Text style={styles.helperText}>
                  Se repetirá cada mes desde {`${filterMonth} ${filterYear}`}.
                </Text>
                {formMessage ? (
                  <Text style={styles.formMessage}>{formMessage}</Text>
                ) : null}
                <View style={styles.actions}>
                  {editingBudget && (
                    <Pressable
                      onPress={handleDelete}
                      style={styles.deleteButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={colors.negative}
                      />
                    </Pressable>
                  )}
                  <Pressable onPress={handleSave} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

function BudgetRow({ budget, styles, colors, onPress }) {
  const option = categoryOptions.find(
    (current) => current.clave === budget.clave,
  );
  return (
    <Pressable onPress={onPress} style={styles.budgetRow}>
      <View
        style={[
          styles.categoryIcon,
          { backgroundColor: option?.color || colors.primary },
        ]}
      >
        {option?.icon || (
          <Ionicons name="wallet-outline" size={20} color="white" />
        )}
      </View>
      <View style={styles.budgetInfo}>
        <View style={styles.budgetTitleRow}>
          <Text numberOfLines={1} style={styles.budgetName}>
            {budget.nombre}
          </Text>
          <Text
            style={[
              styles.remainingAmount,
              styles[`statusText_${budget.status}`],
            ]}
          >
            {formatearMonto(budget.available - budget.spent)}
          </Text>
        </View>
        <Text style={styles.budgetDetail}>
          {`${formatearMonto(budget.spent)} de ${formatearMonto(budget.available)}`}
        </Text>
        <BudgetProgress budget={budget} styles={styles} />
        {budget.carryover !== 0 && (
          <Text style={styles.rolloverAmount}>
            {`Arrastre: ${formatearMonto(budget.carryover)}`}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

function BudgetProgress({ budget, styles }) {
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          styles[`status_${budget.status}`],
          { width: `${budget.progress * 100}%` },
        ]}
      />
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      backgroundColor: colors.background,
    },
    section: {
      backgroundColor: colors.surface,
      borderColor: colors.borderStrong,
      borderRadius: 12,
      borderWidth: 1,
      gap: 14,
      marginHorizontal: 5,
      marginBottom: 8,
      padding: 14,
      paddingBottom: 28,
    },
    header: {
      marginBottom: 5,
      gap: 6,
    },
    title: { color: colors.text, fontSize: 17, fontWeight: "500" },
    periodControl: {
      backgroundColor: colors.primarySoft,
      marginTop: 9,
      padding: 5,
      marginHorizontal: 5,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopEndRadius: 12,
      borderTopStartRadius: 12,
      borderWidth: 1,
      borderColor: colors.primaryText,
    },
    subtitle: {
      color: colors.primaryTextSoft,
      fontSize: 14,
      fontWeight: "600",
      minWidth: 116,
      textAlign: "center",
    },
    periodButton: {
      alignItems: "center",
      height: 32,
      justifyContent: "center",
      width: 32,
    },
    iconButton: {
      alignItems: "center",
      height: 40,
      justifyContent: "center",
      width: 40,
    },
    rolloverNote: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
    alertBox: {
      alignItems: "center",
      backgroundColor: `${colors.negative}12`,
      borderLeftColor: colors.negative,
      borderLeftWidth: 3,
      borderRadius: 5,
      flexDirection: "row",
      gap: 9,
      padding: 10,
    },
    alertText: {
      color: colors.negativeSoft,
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
    },

    // Presupuesto total
    totalSummary: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 0.6,
      borderColor: colors.borderStrong,
      borderRadius: 10,
      gap: 9,
      padding: 12,
    },
    totalSummaryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    totalAvailableArea: { alignItems: "flex-end" },
    totalBudgetLabelRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
    },
    totalEditButton: {
      alignItems: "center",
      height: 28,
      justifyContent: "center",
      width: 28,
    },
    totalAvailableAmount: { fontSize: 18, fontWeight: "600" },
    cardEyebrow: { color: colors.textSecondary, fontSize: 14 },
    totalAmount: {
      color: colors.textStrong,
      fontSize: 25,
      fontWeight: "700",
      marginTop: 3,
    },
    cardDetail: { color: colors.textSecondary, fontSize: 13 },
    primaryButton: {
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: 8,
      flexDirection: "row",
      gap: 7,
      justifyContent: "center",
      marginTop: 4,
      minHeight: 42,
      paddingHorizontal: 14,
    },
    primaryButtonText: { color: "white", fontSize: 14, fontWeight: "700" },
    sectionHeader: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 2,
    },
    sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "500" },
    addButton: {
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: 18,
      height: 36,
      justifyContent: "center",
      width: 36,
    },
    emptyState: { alignItems: "center", gap: 9, paddingVertical: 26 },
    emptyText: { color: colors.textMuted, fontSize: 14, textAlign: "center" },
    budgetList: { borderTopColor: colors.border, borderTopWidth: 1 },
    budgetRow: {
      alignItems: "center",
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      flexDirection: "row",
      gap: 11,
      paddingVertical: 13,
    },
    categoryIcon: {
      alignItems: "center",
      borderRadius: 18,
      height: 36,
      justifyContent: "center",
      width: 36,
    },
    budgetInfo: { flex: 1, gap: 6 },
    budgetTitleRow: {
      alignItems: "baseline",
      flexDirection: "row",
      gap: 8,
      justifyContent: "space-between",
    },
    budgetName: {
      color: colors.textStrong,
      flex: 1,
      fontSize: 15,
      fontWeight: "600",
    },
    remainingAmount: { fontSize: 13, fontWeight: "700" },
    budgetDetail: { color: colors.textMuted, fontSize: 12 },
    rolloverAmount: { color: colors.textMuted, fontSize: 11 },
    progressTrack: {
      backgroundColor: colors.border,
      borderRadius: 4,
      height: 7,
      overflow: "hidden",
      width: "100%",
    },
    progressFill: { borderRadius: 4, height: "100%" },
    status_normal: {
      backgroundColor: colors.positive,
    },
    status_limite: { backgroundColor: "#f59e0b" },
    status_excedido: {
      backgroundColor: colors.negative,
    },
    statusText_normal: { color: colors.positive },
    statusText_limite: { color: "#d97706" },
    statusText_excedido: { color: colors.negative },
    modalBackdrop: {
      backgroundColor: colors.overlay,
      flex: 1,
      justifyContent: "flex-end",
    },
    modalSafeArea: { flex: 1 },
    modalKeyboardAvoider: { flex: 1 },
    pickerCard: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderColor: colors.border,
      borderWidth: 1,
      maxHeight: "82%",
      padding: 18,
    },
    editorCard: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderColor: colors.border,
      borderWidth: 1,
      gap: 14,
      padding: 16,
    },
    modalHeader: {
      alignItems: "center",
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
      paddingBottom: 12,
    },
    modalTitle: { color: colors.text, fontSize: 17, fontWeight: "500" },
    categoryOption: {
      alignItems: "center",
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      flexDirection: "row",
      gap: 11,
      minHeight: 54,
      paddingVertical: 8,
    },
    categoryOptionDisabled: { opacity: 0.45 },
    categoryOptionText: {
      color: colors.textStrong,
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
    },
    existsText: { color: colors.textMuted, fontSize: 12 },
    inputLabel: {
      color: colors.textSecondary,
      fontSize: 15,
      fontWeight: "600",
    },
    amountInput: {
      borderBottomColor: colors.borderStrong,
      borderBottomWidth: 1,
      color: colors.textStrong,
      fontSize: 18,
      fontWeight: 500,
      minHeight: 52,
      paddingHorizontal: 2,
    },
    helperText: { color: colors.textMuted, fontSize: 13, lineHeight: 18 },
    formMessage: {
      backgroundColor: `${colors.negative}12`,
      color: colors.negativeSoft,
      fontSize: 13,
      textAlign: "center",
      borderWidth: 0.5,
      borderColor: colors.negative,
      borderRadius: 12,
      padding: 10,
    },
    actions: {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
      justifyContent: "flex-end",
      marginTop: 4,
    },
    deleteButton: {
      alignItems: "center",
      borderColor: `${colors.negative}88`,
      borderRadius: 8,
      borderWidth: 1,
      height: 42,
      justifyContent: "center",
      width: 42,
    },
    saveButton: {
      alignItems: "center",
      backgroundColor: colors.primary,
      borderRadius: 8,
      height: 42,
      justifyContent: "center",
      minWidth: 110,
      paddingHorizontal: 16,
    },
    saveButtonText: { color: "white", fontSize: 14, fontWeight: "800" },
  });
}
