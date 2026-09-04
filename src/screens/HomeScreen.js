import {
  ActivityIndicator,
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
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { Balance } from "../components/Balance";
import { TransactionRow } from "../components/TransactionRow";
import { ResumenMensualHome } from "../components/ResumenMensualHome";
import { useNavigation } from "@react-navigation/native";
import { mesesMap, yearsArray } from "../utils/fechaActual";
// import { getMonthYearFiltered } from "../utils/fechaActual";

const accountColors = [
  "rgb(79, 57, 246)",
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
  loading,
  selectedMonthItems,
  balanceTotal,
  totalIngresosMensual,
  totalGastosMensual,
  formatearMonto,
  openEditModal,
  deleteTransaction,
  filterMonth,
  filterYear,
  setFilterMonth,
  setFilterYear,
  cuentas,
  lista,
  createAccount,
  renameAccount,
  deleteAccount,
}) {
  const [accountsModalVisible, setAccountsModalVisible] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountColor, setAccountColor] = useState(accountColors[0]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);
  const mesesArray = Object.keys(mesesMap);
  const latestTransactions = [...selectedMonthItems].sort((a, b) => {
    const dateDifference = new Date(b.fecha) - new Date(a.fecha);
    if (dateDifference !== 0) return dateDifference;

    return Number(b.id ?? 0) - Number(a.id ?? 0);
  });

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

  const navigation = useNavigation();

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
      <View style={[styles.section, { marginTop: 8 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cuentas</Text>
          <Pressable
            accessibilityLabel="Administrar cuentas"
            onPress={() => setAccountsModalVisible(true)}
            style={styles.addAccountButton}
          >
            <Text style={styles.addAccountButtonText}>Añadir cuentas</Text>
          </Pressable>
        </View>
        <View style={styles.accountsList}>
          {accountBalances.map((cuenta) => (
            <View
              key={cuenta.id}
              style={[styles.accountCard, { backgroundColor: cuenta.color }]}
            >
              <Text style={styles.accountCardName} numberOfLines={1}>
                {cuenta.nombre}
              </Text>
              <Text style={styles.accountCardLabel}>Saldo actual</Text>
              <Text style={styles.accountCardBalance}>
                {formatearMonto(cuenta.saldo)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.dateSelector}>
        <Pressable
          accessibilityLabel="Seleccionar mes"
          onPress={() => setShowMonthModal(true)}
          style={styles.dateSelectorButton}
        >
          <Text style={styles.dateSelectorText}>{filterMonth}</Text>
          <Ionicons name="chevron-down" size={20} color="rgb(102, 83, 249)" />
        </Pressable>
        <Pressable
          accessibilityLabel="Seleccionar año"
          onPress={() => setShowYearModal(true)}
          style={styles.dateSelectorButton}
        >
          <Text style={styles.dateSelectorText}>{filterYear}</Text>
          <Ionicons name="chevron-down" size={20} color="rgb(102, 83, 249)" />
        </Pressable>
      </View>

      <Balance
        balanceTotal={balanceTotal}
        totalIngresosMensual={totalIngresosMensual}
        totalGastosMensual={totalGastosMensual}
        filterMonth={filterMonth}
        filterYear={filterYear}
      />
      {/* </View> */}

      <ResumenMensualHome
        selectedMonthItems={selectedMonthItems}
        totalIngresosMensual={totalIngresosMensual}
        totalGastosMensual={totalGastosMensual}
      />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimos registros</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Cargando datos guardados...</Text>
          </View>
        ) : (
          <View>
            {latestTransactions.length === 0 ? (
              <EmptyState text="Aún no hay transacciones registradas." />
            ) : (
              latestTransactions
                .slice(0, 5)
                .map((item) => (
                  <TransactionRow
                    key={item.id}
                    item={item}
                    cuentas={cuentas}
                    formatearMonto={formatearMonto}
                    onEdit={() => openEditModal(item)}
                    onDelete={() => deleteTransaction(item.id)}
                  />
                ))
            )}
          </View>
        )}

        <Pressable
          onPress={() => navigation.navigate("Registros")}
          style={styles.sectionFooter}
        >
          <Text style={styles.sectionFooterText}>Mostras mas</Text>
        </Pressable>
      </View>

      <Modal
        visible={accountsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeAccountsModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
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
                placeholderTextColor="#94a3b8"
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
            <ScrollView showsVerticalScrollIndicator={false}>
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
            <Text style={styles.accountLimit}>{cuentas.length}/10 cuentas</Text>
          </View>
        </KeyboardAvoidingView>
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
                    setShowYearModal(false);
                  }}
                  style={styles.yearOption}
                >
                  <Text
                    style={{ color: "rgb(119, 119, 255)", fontWeight: 500 }}
                  >
                    {year}
                  </Text>
                </Pressable>
              ))}
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

function EmptyState({ text }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 7,
    backgroundColor: "rgb(32, 32, 38)",
    paddingBottom: 80,
  },
  section: {
    marginHorizontal: 8,
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgb(20, 23, 28)",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  sectionTitle: { color: "white", fontSize: 17, fontWeight: "500" },
  loadingBox: { alignItems: "center", gap: 8, paddingVertical: 16 },
  loadingText: { color: "#cbd5e1" },

  emptyState: { paddingVertical: 18, alignItems: "center" },
  emptyStateText: { color: "#94a3b8", textAlign: "center" },

  sectionFooter: {
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  sectionFooterText: {
    color: "rgb(119, 119, 255)",
    fontSize: 16,
    fontWeight: "500",
  },
  //  Botones y modales para mes y año
  dateSelector: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: 8,
  },
  dateSelectorButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "rgb(20, 23, 28)",
  },
  dateSelectorText: { color: "#f8fafc", fontSize: 16, fontWeight: "500" },
  dateModalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  dateModalCard: {
    padding: 12,
    gap: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "rgb(20, 23, 28)",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    justifyContent: "space-between",
  },
  monthOption: {
    width: "32%",
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: "rgba(79, 57, 246, 0.7)",
  },
  monthOptionText: {
    color: "rgb(189, 189, 252)",
    fontSize: 15,
    fontWeight: "500",
  },
  yearList: { maxHeight: 300 },
  yearOption: {
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  // seccion de cuentas
  addAccountButton: { paddingVertical: 6, paddingHorizontal: 10 },
  addAccountButtonText: {
    color: "rgb(119, 119, 255)",
    fontSize: 16,
    fontWeight: "500",
  },
  accountsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  accountCard: {
    width: "48.5%",
    minHeight: 90,
    padding: 8,
    borderRadius: 8,
    elevation: 4,
    shadowColor: "#000000",
  },
  accountCardName: { color: "white", fontSize: 15, fontWeight: "600" },
  accountCardLabel: { color: "#fcfdfe", fontSize: 12, marginTop: 5 },
  accountCardBalance: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "500",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    marginBottom: 48,
  },
  accountsModalCard: {
    maxHeight: "78%",
    padding: 16,
    backgroundColor: "rgb(20, 23, 28)",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  closeButton: { color: "white", fontSize: 15, lineHeight: 28 },
  accountForm: { flexDirection: "row", gap: 8, marginVertical: 16 },
  colorPicker: { flexDirection: "row", gap: 12, marginBottom: 16 },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColorSwatch: { borderColor: "white" },
  accountNameInput: {
    flex: 1,
    padding: 12,
    color: "#f8fafc",
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  accountSaveButton: {
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: "rgb(79, 57, 246)",
    borderRadius: 6,
  },
  accountSaveButtonText: { color: "white", fontWeight: "700" },
  accountManageItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  accountManageInfo: { flex: 1 },
  accountManageName: { color: "white", fontSize: 16, fontWeight: "500" },
  accountManageBalance: { color: "#94a3b8", marginTop: 3 },
  accountAction: { paddingVertical: 6, paddingHorizontal: 4 },
  accountActionText: { color: "#cbd5e1", fontWeight: "700" },
  deleteActionText: { color: "#fb7185", fontWeight: "700" },
  accountLimit: { color: "#94a3b8", textAlign: "right", marginTop: 14 },
  transferBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  transferCard: {
    gap: 12,
    padding: 20,
    backgroundColor: "rgb(20, 23, 28)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#334155",
  },
  transferDescription: { color: "#cbd5e1", lineHeight: 20 },
  transferButton: {
    alignItems: "center",
    padding: 13,
    backgroundColor: "rgb(79, 57, 246)",
    borderRadius: 6,
  },
  transferButtonText: { color: "white", fontWeight: "700" },
  cancelButton: { alignItems: "center", padding: 10 },
  cancelButtonText: { color: "#cbd5e1", fontWeight: "700" },
});

export { HomeScreen };
