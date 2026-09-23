import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Balance } from "../components/Balance";
import { ResumenMensualHome } from "../components/ResumenMensualHome";
import { ResumenMensualIngresos } from "../components/ResumenMensualIngresos";
import { mesesMap, yearsArray } from "../utils/fechaActual";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useTheme } from "../theme/ThemeContext";

const accountColors = [
  "rgb(254, 83, 83)",
  "rgb(0, 200, 136)",
  "#2498f2",
  "#fba716",
  "#84cc16",
  "#db2777",
  "#9333ea",
  "#0891b2",
  "#ea580c",
];

function HomeScreen({
  selectedMonthItems,
  balanceTotal,
  totalIngresosMensual,
  totalGastosMensual,
  formatearMonto,
  filterMonth,
  filterYear,
  filterDay,
  setFilterMonth,
  setFilterYear,
  setFilterDay,
  cuentas,
  lista,
  createAccount,
  renameAccount,
  deleteAccount,
  selectedAccountId,
  setSelectedAccountId,
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [accountsModalVisible, setAccountsModalVisible] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountColor, setAccountColor] = useState(accountColors[0]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const mesesArray = Object.keys(mesesMap);
  const daysInSelectedMonth = new Date(
    Number(filterYear),
    mesesMap[filterMonth],
    0,
  ).getDate();
  const daysArray = Array.from(
    { length: daysInSelectedMonth },
    (_, index) => index + 1,
  );

  const accountBalances = cuentas.map((cuenta) => ({
    ...cuenta,
    saldo: lista
      .filter((item) => item.cuenta_id === cuenta.id)
      .reduce(
        (total, item) =>
          item.tipo === "ingreso" ? total + item.monto : total - item.monto,
        0,
      ),
  }));

  const handleSaveAccount = async () => {
    const normalizedName = accountName.trim();
    if (!normalizedName) {
      Alert.alert("Nombre requerido", "Escribe un nombre para la cuenta");
      return;
    }

    const duplicatedAccount = cuentas.some(
      (cuenta) =>
        cuenta.id !== editingAccount?.id &&
        cuenta.nombre.trim().toLocaleLowerCase() ===
          normalizedName.toLocaleLowerCase(),
    );
    if (duplicatedAccount) {
      Alert.alert("Nombre duplicado", "Ya existe una cuenta con ese nombre");
      return;
    }

    if (!editingAccount && cuentas.length >= 10) {
      Alert.alert(
        "Límite de cuentas",
        "Solo puedes tener 10 cuentas registradas",
      );
      return;
    }

    const account = editingAccount
      ? await renameAccount(editingAccount.id, accountName, accountColor)
      : await createAccount(accountName, accountColor);

    if (account) {
      if (!editingAccount) {
        closeAccountsModal();
        return;
      }

      setAccountName("");
      setAccountColor(accountColors[0]);
      setEditingAccount(null);
    }
  };

  const handleDeleteAccount = async (targetAccountId) => {
    if (await deleteAccount(accountToDelete.id, targetAccountId)) {
      if (selectedAccountId === accountToDelete.id) {
        setSelectedAccountId(null);
      }
      setAccountToDelete(null);
    }
  };

  const closeAccountsModal = () => {
    setAccountsModalVisible(false);
    setAccountName("");
    setAccountColor(accountColors[0]);
    setEditingAccount(null);
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Cuentas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cuentas</Text>
          <Pressable
            accessibilityLabel="Administrar cuentas"
            onPress={() => setAccountsModalVisible(true)}
            style={styles.addAccountButton}
          >
            <FontAwesome6
              name="bars-staggered"
              size={20}
              color={colors.primaryText}
            />
          </Pressable>
        </View>
        <View style={styles.accountsList}>
          {accountBalances.map((cuenta) => (
            <Pressable
              key={cuenta.id}
              accessibilityLabel={`Filtrar por ${cuenta.nombre}`}
              accessibilityState={{ selected: selectedAccountId === cuenta.id }}
              onPress={() =>
                setSelectedAccountId((currentAccountId) =>
                  currentAccountId === cuenta.id ? null : cuenta.id,
                )
              }
              style={[
                styles.accountCard,
                { backgroundColor: cuenta.color },
                selectedAccountId === cuenta.id && styles.selectedAccountCard,
              ]}
            >
              <Text style={styles.accountCardName} numberOfLines={1}>
                {cuenta.nombre}
              </Text>
              <Text style={styles.accountCardBalance}>
                {formatearMonto(cuenta.saldo)}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Balance */}
      <View style={styles.sectionBalance}>
        <View style={styles.dateSelector}>
          <Pressable
            accessibilityLabel="Seleccionar día"
            onPress={() => setShowDayModal(true)}
            style={styles.dateSelectorButton}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.primaryText}
            />
            <Text style={styles.dateSelectorText}>
              {filterDay ? `Día ${filterDay}` : "Día"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel="Seleccionar mes"
            onPress={() => setShowMonthModal(true)}
            style={styles.dateSelectorButton}
          >
            <Text style={styles.dateSelectorText}>{filterMonth}</Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.primaryText}
            />
          </Pressable>
          <Pressable
            accessibilityLabel="Seleccionar año"
            onPress={() => setShowYearModal(true)}
            style={styles.dateSelectorButton}
          >
            <Text style={styles.dateSelectorText}>{filterYear}</Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.primaryText}
            />
          </Pressable>
        </View>

        <Balance
          balanceTotal={balanceTotal}
          totalIngresosMensual={totalIngresosMensual}
          totalGastosMensual={totalGastosMensual}
          filterMonth={filterMonth}
          filterYear={filterYear}
        />
      </View>

      <ResumenMensualHome
        selectedMonthItems={selectedMonthItems}
        totalIngresosMensual={totalIngresosMensual}
        totalGastosMensual={totalGastosMensual}
        filterMonth={filterMonth}
        filterYear={filterYear}
        selectedAccount={cuentas.find(
          (cuenta) => cuenta.id === selectedAccountId,
        )}
      />

      <ResumenMensualIngresos
        selectedMonthItems={selectedMonthItems}
        filterMonth={filterMonth}
        filterYear={filterYear}
        selectedAccount={cuentas.find(
          (cuenta) => cuenta.id === selectedAccountId,
        )}
      />

      <Modal
        visible={accountsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeAccountsModal}
      >
        <SafeAreaView style={styles.modalBackdrop} edges={["bottom"]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, justifyContent: "flex-end" }}
          >
            <View style={styles.accountsModalCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Administrar cuentas</Text>
                <Pressable onPress={closeAccountsModal} hitSlop={8}>
                  <Text style={styles.closeButton}>⨉</Text>
                </Pressable>
              </View>
              <View style={styles.accountForm}>
                <TextInput
                  style={styles.accountNameInput}
                  placeholder={
                    editingAccount ? "Nuevo nombre" : "Nombre de la cuenta"
                  }
                  placeholderTextColor={colors.textMuted}
                  value={accountName}
                  onChangeText={setAccountName}
                  maxLength={30}
                />
                <Pressable
                  style={styles.accountSaveButton}
                  onPress={handleSaveAccount}
                >
                  <Text style={styles.accountSaveButtonText}>
                    {editingAccount ? "Guardar" : "Añadir"}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.colorPicker}>
                {accountColors.map((color) => (
                  <Pressable
                    key={color}
                    accessibilityLabel={`Seleccionar color ${color}`}
                    onPress={() => setAccountColor(color)}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      accountColor === color && styles.selectedColorSwatch,
                    ]}
                  />
                ))}
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ marginTop: 30 }}
              >
                {accountBalances.map((cuenta) => (
                  <View key={cuenta.id} style={styles.accountManageItem}>
                    <View style={styles.accountManageInfo}>
                      <Text style={styles.accountManageName}>
                        {cuenta.nombre}
                      </Text>
                      <Text style={styles.accountManageBalance}>
                        {formatearMonto(cuenta.saldo)}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityLabel={`Renombrar ${cuenta.nombre}`}
                      onPress={() => {
                        setEditingAccount(cuenta);
                        setAccountName(cuenta.nombre);
                        setAccountColor(cuenta.color ?? accountColors[0]);
                      }}
                      style={styles.accountAction}
                    >
                      <Text style={styles.accountActionText}>Editar</Text>
                    </Pressable>
                    {cuentas.length > 1 && (
                      <Pressable
                        accessibilityLabel={`Eliminar ${cuenta.nombre}`}
                        onPress={() => setAccountToDelete(cuenta)}
                        style={styles.accountAction}
                      >
                        <Text style={styles.deleteActionText}>Eliminar</Text>
                      </Pressable>
                    )}
                  </View>
                ))}
              </ScrollView>
              <Text style={styles.accountLimit}>
                {cuentas.length}/10 cuentas
              </Text>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showMonthModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMonthModal(false)}
      >
        <View style={styles.dateModalBackdrop}>
          <View style={styles.dateModalCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Selecciona un mes</Text>
              <Pressable onPress={() => setShowMonthModal(false)} hitSlop={8}>
                <Text style={styles.closeButton}>⨉</Text>
              </Pressable>
            </View>
            <View style={styles.monthGrid}>
              {mesesArray.map((mes) => (
                <Pressable
                  key={mes}
                  onPress={() => {
                    setFilterMonth(mes);
                    setFilterDay(null);
                    setShowMonthModal(false);
                  }}
                  style={styles.monthOption}
                >
                  <Text style={styles.monthOptionText}>{mes}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showYearModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowYearModal(false)}
      >
        <View style={styles.dateModalBackdrop}>
          <View style={styles.dateModalCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Selecciona un año</Text>
              <Pressable onPress={() => setShowYearModal(false)} hitSlop={8}>
                <Text style={styles.closeButton}>⨉</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.yearList}>
              {yearsArray.map((year) => (
                <Pressable
                  key={year}
                  onPress={() => {
                    setFilterYear(year.toString());
                    setFilterDay(null);
                    setShowYearModal(false);
                  }}
                  style={styles.yearOption}
                >
                  <Text style={{ color: colors.primaryText, fontWeight: 500 }}>
                    {year}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para filtro diario */}
      <Modal
        visible={showDayModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDayModal(false)}
      >
        <View style={styles.dateModalBackdrop}>
          <View style={styles.dateModalCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Días de {filterMonth} de {filterYear}
              </Text>
              <Pressable onPress={() => setShowDayModal(false)} hitSlop={8}>
                <Text style={styles.closeButton}>⨉</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => {
                setFilterDay(null);
                setShowDayModal(false);
              }}
              style={styles.allDaysOption}
            >
              <Text style={styles.monthOptionText}>Todos los días</Text>
            </Pressable>
            <ScrollView style={styles.dayList}>
              <View style={styles.dayGrid}>
                {daysArray.map((day) => (
                  <Pressable
                    key={day}
                    onPress={() => {
                      setFilterDay(day);
                      setShowDayModal(false);
                    }}
                    style={[
                      styles.dayOption,
                      filterDay === day && styles.selectedDayOption,
                    ]}
                  >
                    <Text
                      style={[
                        styles.monthOptionText,
                        filterDay === day && styles.selectedDayOptionText,
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(accountToDelete)}
        transparent
        animationType="fade"
        onRequestClose={() => setAccountToDelete(null)}
      >
        <View style={styles.transferBackdrop}>
          <View style={styles.transferCard}>
            <Text style={styles.sectionTitle}>Mover transacciones</Text>
            <Text style={styles.transferDescription}>
              Elige la cuenta destino para los movimientos de{" "}
              {accountToDelete?.nombre}.
            </Text>
            {cuentas
              .filter((cuenta) => cuenta.id !== accountToDelete?.id)
              .map((cuenta) => (
                <Pressable
                  key={cuenta.id}
                  onPress={() => handleDeleteAccount(cuenta.id)}
                  style={styles.transferButton}
                >
                  <Text style={styles.transferButtonText}>{cuenta.nombre}</Text>
                </Pressable>
              ))}
            <Pressable
              onPress={() => setAccountToDelete(null)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.background,
      paddingBottom: 60,
    },
    section: {
      marginHorizontal: 5,
      marginVertical: 8,
      gap: 12,
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "500" },
    sectionFooter: {
      paddingTop: 15,
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    sectionFooterText: {
      color: colors.primaryText,
      fontSize: 16,
      fontWeight: "500",
    },
    // Seccion balance
    sectionBalance: {
      marginHorizontal: 5,
    },
    dateSelector: {
      backgroundColor: colors.primarySoft,
      padding: 12,
      borderTopEndRadius: 12,
      borderTopStartRadius: 12,
      borderWidth: 0.5,
      borderColor: colors.primaryText,
      flexDirection: "row",
    },
    dateSelectorButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingHorizontal: 14,
    },
    dateSelectorText: {
      color: colors.primaryTextSoft,
      fontSize: 14,
      fontWeight: "500",
    },
    dateModalBackdrop: {
      flex: 1,
      justifyContent: "center",
      padding: 20,
      backgroundColor: colors.overlay,
    },
    dateModalCard: {
      padding: 12,
      gap: 20,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    monthGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
      justifyContent: "space-between",
    },
    dayList: { maxHeight: 300 },
    dayGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: "center",
    },
    allDaysOption: {
      alignItems: "center",
      paddingVertical: 12,
      borderRadius: 6,
      backgroundColor: colors.primarySelected,
    },
    dayOption: {
      width: "18%",
      alignItems: "center",
      paddingVertical: 10,
      borderRadius: 6,
      backgroundColor: colors.primarySoft,
    },
    selectedDayOption: { backgroundColor: colors.primarySelected },
    selectedDayOptionText: { color: "white" },
    monthOption: {
      width: "32%",
      alignItems: "center",
      paddingVertical: 12,
      borderRadius: 6,
      backgroundColor: colors.primarySoft,
    },
    monthOptionText: {
      color: colors.primaryTextSoft,
      fontSize: 14,
      fontWeight: "500",
    },
    yearList: { maxHeight: 300 },
    yearOption: {
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderStrong,
    },
    // seccion de cuentas
    addAccountButton: { paddingVertical: 6, paddingHorizontal: 10 },
    accountsList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 5,
    },
    accountCard: {
      width: "48.5%",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: "transparent",
      elevation: 8,
      shadowColor: "#000000",
    },
    selectedAccountCard: { borderColor: colors.text },
    accountCardName: { color: "white", fontSize: 14, fontWeight: "600" },
    accountCardBalance: {
      color: "white",
      fontSize: 15,
      fontWeight: "500",
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colors.overlay,
    },
    accountsModalCard: {
      maxHeight: "78%",
      padding: 16,
      backgroundColor: colors.surface,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderColor: colors.border,
      borderWidth: 1,
    },
    closeButton: { color: colors.text, fontSize: 15, lineHeight: 28 },
    accountForm: { flexDirection: "row", gap: 8, marginVertical: 16 },
    colorPicker: { flexDirection: "row", gap: 12, marginBottom: 16 },
    colorSwatch: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: "transparent",
    },
    selectedColorSwatch: { borderColor: colors.text },
    accountNameInput: {
      flex: 1,
      padding: 12,
      color: colors.textStrong,
      fontSize: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderStrong,
    },
    accountSaveButton: {
      justifyContent: "center",
      paddingHorizontal: 14,
      backgroundColor: colors.primary,
      borderRadius: 6,
    },
    accountSaveButtonText: { color: "white", fontWeight: "700" },
    accountManageItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderStrong,
    },
    accountManageInfo: { flex: 1 },
    accountManageName: { color: colors.text, fontSize: 16, fontWeight: "500" },
    accountManageBalance: { color: colors.textMuted, marginTop: 3 },
    accountAction: { paddingVertical: 6, paddingHorizontal: 4 },
    accountActionText: { color: colors.textSecondary, fontWeight: "700" },
    deleteActionText: { color: colors.negative, fontWeight: "700" },
    accountLimit: {
      color: colors.textMuted,
      textAlign: "right",
      marginTop: 14,
    },
    transferBackdrop: {
      flex: 1,
      justifyContent: "center",
      padding: 24,
      backgroundColor: colors.overlay,
    },
    transferCard: {
      gap: 12,
      padding: 20,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    transferDescription: { color: colors.textSecondary, lineHeight: 20 },
    transferButton: {
      alignItems: "center",
      padding: 13,
      backgroundColor: colors.primary,
      borderRadius: 6,
    },
    transferButtonText: { color: "white", fontWeight: "700" },
    cancelButton: { alignItems: "center", padding: 10 },
    cancelButtonText: { color: colors.textSecondary, fontWeight: "700" },
  });
}

export { HomeScreen };
