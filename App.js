import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { formatearMonto } from "./src/utils/formatearMonto.js";
import { normalizeFecha } from "./src/utils/normalizeFecha.js";
import {
  getTodayDate,
  getCurrentMonth,
  mesesMap,
} from "./src/utils/fechaActual";
import { HomeScreen } from "./src/screens/HomeScreen";
import { RecordsScreen } from "./src/screens/RecordsScreen";
import { StatsScreen } from "./src/screens/StatsScreen";
import { TransactionModal } from "./src/components/TransactionModal";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useSQLiteTransactions } from "./src/hook/useSQLiteTransactions.js";
import { SQLiteProvider } from "expo-sqlite";

const Tab = createMaterialTopTabNavigator();

async function initializeDatabase(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cuentas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL COLLATE NOCASE UNIQUE,
      color TEXT NOT NULL DEFAULT 'rgb(0, 200, 136)'
    );

    CREATE TABLE IF NOT EXISTS transacciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      monto REAL NOT NULL,
      categoria TEXT,
      descripcion TEXT,
      fecha TEXT NOT NULL
    );
  `);

  await db.runAsync("INSERT OR IGNORE INTO cuentas (nombre) VALUES (?);", [
    "Efectivo",
  ]);

  const columns = await db.getAllAsync("PRAGMA table_info(transacciones);");
  const hasAccountId = columns.some((column) => column.name === "cuenta_id");

  const accountColumns = await db.getAllAsync("PRAGMA table_info(cuentas);");
  const hasAccountColor = accountColumns.some(
    (column) => column.name === "color",
  );

  if (!hasAccountId) {
    await db.execAsync(
      "ALTER TABLE transacciones ADD COLUMN cuenta_id INTEGER;",
    );
  }

  if (!hasAccountColor) {
    await db.execAsync(
      "ALTER TABLE cuentas ADD COLUMN color TEXT NOT NULL DEFAULT 'rgb(0, 200, 136)';",
    );
  }

  await db.runAsync("UPDATE cuentas SET color=? WHERE nombre=?;", [
    "rgb(0, 200, 136)",
    "Efectivo",
  ]);

  const efectivo = await db.getFirstAsync(
    "SELECT id FROM cuentas WHERE nombre = ?;",
    ["Efectivo"],
  );
  await db.runAsync(
    "UPDATE transacciones SET cuenta_id = ? WHERE cuenta_id IS NULL;",
    [efectivo.id],
  );
}

export default function App() {
  return (
    <SQLiteProvider databaseName="finanzas.db" onInit={initializeDatabase}>
      <AppContent />
    </SQLiteProvider>
  );
}

function AppContent() {
  const {
    lista,
    cuentas,
    saveTransaction,
    saveTransfer,
    deleteTransaction,
    createAccount,
    renameAccount,
    deleteAccount,
    loading,
  } = useSQLiteTransactions();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  // filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState(() => getCurrentMonth());
  const [filterYear, setFilterYear] = useState(
    new Date().getFullYear().toString(),
  );

  // valores del formulario
  const [formType, setFormType] = useState("gasto");
  const [formCategoria, setFormCategoria] = useState("");
  const [formMonto, setFormMonto] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formFecha, setFormFecha] = useState(getTodayDate());
  const [formCuentaId, setFormCuentaId] = useState(null);
  const [formCuentaDestinoId, setFormCuentaDestinoId] = useState(null);

  const selectedMonthItems = useMemo(() => {
    return lista.filter((item) => {
      const itemFecha = /^\d{4}-\d{2}-\d{2}$/.test(item.fecha)
        ? item.fecha
        : normalizeFecha(item.fecha);

      const [itemYear, itemMonth] = itemFecha.split("-");

      const matchYear = Number(itemYear) === Number(filterYear);

      const mesNumero = mesesMap[filterMonth]; // Enero=1, Febrero=2...
      const matchMonth = mesNumero ? Number(itemMonth) === mesNumero : true;
      return matchYear && matchMonth;
    });
  }, [lista, filterYear, filterMonth]);

  // Balance, ingresos y gastos
  const totalGastosMensual = useMemo(
    () =>
      selectedMonthItems
        .filter(
          (item) => item.tipo === "gasto" && item.categoria !== "Transferencia",
        )
        .reduce((acu, item) => acu + item.monto, 0),
    [selectedMonthItems],
  );

  const totalIngresosMensual = useMemo(
    () =>
      selectedMonthItems
        .filter(
          (item) =>
            item.tipo === "ingreso" && item.categoria !== "Transferencia",
        )
        .reduce((acu, item) => acu + item.monto, 0),
    [selectedMonthItems],
  );

  const balanceTotal = totalIngresosMensual - totalGastosMensual;

  const allFilteredTransactions = useMemo(() => {
    return [...lista]
      .filter((item) => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const categoria = (item.categoria || "").toLowerCase();
        const descripcion = (item.descripcion || "").toLowerCase();

        const matchSearch =
          normalizedQuery.length === 0 ||
          categoria.includes(normalizedQuery) ||
          descripcion.includes(normalizedQuery);

        const matchYear = (() => {
          if (!filterYear) return true;
          const itemFecha = /^\d{4}-\d{2}-\d{2}$/.test(item.fecha)
            ? item.fecha
            : normalizeFecha(item.fecha);
          const [itemYear] = itemFecha.split("-");
          return Number(itemYear) === Number(filterYear);
        })();

        const matchMonth = (() => {
          if (!filterMonth) return true;
          const mesNumero = mesesMap[filterMonth];

          if (!mesNumero) return true;
          const itemFecha = /^\d{4}-\d{2}-\d{2}$/.test(item.fecha)
            ? item.fecha
            : normalizeFecha(item.fecha);
          const [, itemMonth] = itemFecha.split("-");
          return Number(itemMonth) === mesNumero;
        })();

        return matchSearch && matchYear && matchMonth;
      })
      .sort((a, b) => {
        const fechaA = normalizeFecha(a.fecha);
        const fechaB = normalizeFecha(b.fecha);

        if (fechaA !== fechaB) return fechaB.localeCompare(fechaA);
        return Number(b.id ?? 0) - Number(a.id ?? 0);
      });
  }, [lista, searchQuery, filterMonth, filterYear]);

  const openNewModal = () => {
    setEditingTransaction(null);
    setFormType("gasto");
    setFormCategoria("");
    setFormMonto("");
    setFormDescripcion("");
    setFormFecha(getTodayDate());
    setFormCuentaId(
      cuentas.find((cuenta) => cuenta.nombre === "Efectivo")?.id ?? null,
    );
    setFormCuentaDestinoId(null);
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    const isTransfer = item.categoria === "Transferencia";
    const isTransferIncome =
      isTransfer && item.descripcion?.startsWith("Transferencia desde ");
    const accountName = item.descripcion?.replace(
      isTransferIncome ? "Transferencia desde " : "Transferencia a ",
      "",
    );
    const pairedAccount = cuentas.find(
      (cuenta) => cuenta.nombre === accountName,
    );

    setEditingTransaction(item);
    setFormType(isTransfer ? "transferencia" : item.tipo);
    setFormMonto(String(item.monto));
    setFormCategoria(item.categoria ?? "");
    setFormDescripcion(item.descripcion ?? "");
    setFormFecha(item.fecha);
    setFormCuentaId(
      isTransferIncome ? (pairedAccount?.id ?? null) : item.cuenta_id,
    );
    setFormCuentaDestinoId(
      isTransferIncome ? item.cuenta_id : (pairedAccount?.id ?? null),
    );
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingTransaction(null);
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <NavigationContainer>
          <View style={styles.safeArea}>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarScrollEnabled: true,
                tabBarItemStyle: {
                  width: "auto",
                  paddingHorizontal: 25,
                },
                headerShown: false,
                tabBarActiveTintColor: "white",
                // tabBarInactiveTintColor: "#94a3b8",
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarStyle: styles.tabBarTop,
                tabBarIndicatorStyle: styles.tabBarIndicator,
                tabBarShowIcon: true,
                tabBarIcon: ({ color, size }) => {
                  const iconName =
                    route.name === "Inicio"
                      ? "home-outline"
                      : route.name === "Registros"
                        ? "list-outline"
                        : "pie-chart-outline";

                  return <Ionicons name={iconName} size={size} color={color} />;
                },
              })}
            >
              <Tab.Screen name="Inicio">
                {() => (
                  <HomeScreen
                    loading={loading}
                    lista={lista}
                    selectedMonthItems={selectedMonthItems}
                    balanceTotal={balanceTotal}
                    totalIngresosMensual={totalIngresosMensual}
                    totalGastosMensual={totalGastosMensual}
                    formatearMonto={formatearMonto}
                    openEditModal={openEditModal}
                    openNewModal={openNewModal}
                    filterMonth={filterMonth}
                    filterYear={filterYear}
                    setFilterMonth={setFilterMonth}
                    setFilterYear={setFilterYear}
                    cuentas={cuentas}
                    createAccount={createAccount}
                    renameAccount={renameAccount}
                    deleteAccount={deleteAccount}
                  />
                )}
              </Tab.Screen>

              <Tab.Screen name="Registros">
                {() => (
                  <RecordsScreen
                    loading={loading}
                    lista={lista}
                    allFilteredTransactions={allFilteredTransactions}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    openEditModal={openEditModal}
                    openNewModal={openNewModal}
                    // filtro meses
                    filterMonth={filterMonth}
                    setFilterMonth={setFilterMonth}
                    filterYear={filterYear}
                    setFilterYear={setFilterYear}
                    cuentas={cuentas}
                  />
                )}
              </Tab.Screen>

              <Tab.Screen name="Estadisticas">
                {() => (
                  <StatsScreen
                    lista={lista}
                    selectedMonthItems={selectedMonthItems}
                    totalIngresosMensual={totalIngresosMensual}
                    totalGastosMensual={totalGastosMensual}
                    balanceTotal={balanceTotal}
                    formatearMonto={formatearMonto}
                    filterMonth={filterMonth}
                    filterYear={filterYear}
                  />
                )}
              </Tab.Screen>
            </Tab.Navigator>

            <TransactionModal
              visible={modalVisible}
              editingTransaction={editingTransaction}
              closeModal={closeModal}
              saveTransaction={saveTransaction}
              saveTransfer={saveTransfer}
              deleteTransaction={deleteTransaction}
              formType={formType}
              setFormType={setFormType}
              formMonto={formMonto}
              setFormMonto={setFormMonto}
              formCategoria={formCategoria}
              setFormCategoria={setFormCategoria}
              formDescripcion={formDescripcion}
              setFormDescripcion={setFormDescripcion}
              formFecha={formFecha}
              setFormFecha={setFormFecha}
              cuentas={cuentas}
              formCuentaId={formCuentaId}
              setFormCuentaId={setFormCuentaId}
              formCuentaDestinoId={formCuentaDestinoId}
              setFormCuentaDestinoId={setFormCuentaDestinoId}
            />

            <Pressable style={styles.fab} onPress={openNewModal}>
              <Ionicons name="add" size={30} color="white" />
            </Pressable>
          </View>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "rgba(79, 57, 246,0.2)" },
  tabBarTop: {
    backgroundColor: "rgb(79, 57, 246)",
    borderBottomWidth: 1,
    paddingTop: 50,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
  },
  tabBarIndicator: {
    backgroundColor: "white",
    height: 3,
  },
  tabBarLabel: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 2,
  },
  fab: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgb(79, 57, 246)",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
});
