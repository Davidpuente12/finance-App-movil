import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
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
import { BudgetsScreen } from "./src/screens/BudgetsScreen";
import { TransactionModal } from "./src/components/TransactionModal";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
// import { StatusBar } from "expo-status-bar";
import { useSQLiteTransactions } from "./src/hook/useSQLiteTransactions.js";
import { SQLiteProvider } from "expo-sqlite";
import { ThemeProvider, useTheme } from "./src/theme/ThemeContext";

const Tab = createMaterialTopTabNavigator();

async function initializeDatabase(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cuentas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL COLLATE NOCASE UNIQUE,
      color TEXT NOT NULL DEFAULT 'rgb(0, 180, 123)'
    );

    CREATE TABLE IF NOT EXISTS transacciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT NOT NULL,
      monto REAL NOT NULL,
      categoria TEXT,
      categoria_padre TEXT,
      descripcion TEXT,
      fecha TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS presupuestos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clave TEXT NOT NULL COLLATE NOCASE UNIQUE,
      nombre TEXT NOT NULL,
      monto REAL NOT NULL,
      inicio TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS alertas_presupuesto (
      presupuesto_id INTEGER NOT NULL,
      periodo TEXT NOT NULL,
      estado TEXT NOT NULL,
      PRIMARY KEY (presupuesto_id, periodo, estado)
    );
  `);

  await db.runAsync("INSERT OR IGNORE INTO cuentas (nombre) VALUES (?);", [
    "Efectivo",
  ]);

  const columns = await db.getAllAsync("PRAGMA table_info(transacciones);");
  const hasAccountId = columns.some((column) => column.name === "cuenta_id");
  const hasCategoryParent = columns.some(
    (column) => column.name === "categoria_padre",
  );

  const accountColumns = await db.getAllAsync("PRAGMA table_info(cuentas);");
  const hasAccountColor = accountColumns.some(
    (column) => column.name === "color",
  );

  if (!hasAccountId) {
    await db.execAsync(
      "ALTER TABLE transacciones ADD COLUMN cuenta_id INTEGER;",
    );
  }

  if (!hasCategoryParent) {
    await db.execAsync(
      "ALTER TABLE transacciones ADD COLUMN categoria_padre TEXT;",
    );
  }

  if (!hasAccountColor) {
    await db.execAsync(
      "ALTER TABLE cuentas ADD COLUMN color TEXT NOT NULL DEFAULT 'rgb(0, 180, 123)';",
    );
  }

  await db.runAsync("UPDATE cuentas SET color=? WHERE nombre=?;", [
    "rgb(0, 180, 123)",
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
    <ThemeProvider>
      <SQLiteProvider databaseName="finanzas.db" onInit={initializeDatabase}>
        <AppContent />
      </SQLiteProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { colors, isDark } = useTheme();
  const baseNavigationTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseNavigationTheme,
    colors: {
      ...baseNavigationTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.negative,
    },
  };
  const {
    lista,
    cuentas,
    saveTransaction,
    saveTransfer,
    deleteTransaction,
    createAccount,
    renameAccount,
    deleteAccount,
    presupuestos,
    saveBudget,
    deleteBudget,
    registerBudgetAlert,
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
  const [filterDay, setFilterDay] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [activeRouteName, setActiveRouteName] = useState("Inicio");

  // Animacion del boton
  const fabVisibility = useRef(new Animated.Value(1)).current;

  // valores del formulario
  const [formType, setFormType] = useState("gasto");
  const [formCategoria, setFormCategoria] = useState("");
  const [formCategoriaPadre, setFormCategoriaPadre] = useState(null);
  const [formMonto, setFormMonto] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formFecha, setFormFecha] = useState(getTodayDate());
  const [formCuentaId, setFormCuentaId] = useState(null);
  const [formCuentaDestinoId, setFormCuentaDestinoId] = useState(null);

  const accountFilteredItems = useMemo(
    () =>
      selectedAccountId === null
        ? lista
        : lista.filter((item) => item.cuenta_id === selectedAccountId),
    [lista, selectedAccountId],
  );

  const selectedAccount = useMemo(
    () => cuentas.find((cuenta) => cuenta.id === selectedAccountId),
    [cuentas, selectedAccountId],
  );

  const selectedMonthItems = useMemo(() => {
    return accountFilteredItems.filter((item) => {
      const itemFecha = /^\d{4}-\d{2}-\d{2}$/.test(item.fecha)
        ? item.fecha
        : normalizeFecha(item.fecha);

      const [itemYear, itemMonth, itemDay] = itemFecha.split("-");

      const matchYear = Number(itemYear) === Number(filterYear);

      const mesNumero = mesesMap[filterMonth]; // Enero=1, Febrero=2...
      const matchMonth = mesNumero ? Number(itemMonth) === mesNumero : true;
      const matchDay = filterDay ? Number(itemDay) === filterDay : true;
      return matchYear && matchMonth && matchDay;
    });
  }, [accountFilteredItems, filterDay, filterYear, filterMonth]);

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
    return [...accountFilteredItems]
      .filter((item) => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const categoria = (item.categoria || "").toLowerCase();
        const categoriaPadre = (item.categoria_padre || "").toLowerCase();
        const descripcion = (item.descripcion || "").toLowerCase();

        const matchSearch =
          normalizedQuery.length === 0 ||
          categoria.includes(normalizedQuery) ||
          categoriaPadre.includes(normalizedQuery) ||
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

        const matchDay = (() => {
          if (!filterDay) return true;
          const itemFecha = /^\d{4}-\d{2}-\d{2}$/.test(item.fecha)
            ? item.fecha
            : normalizeFecha(item.fecha);
          const [, , itemDay] = itemFecha.split("-");
          return Number(itemDay) === filterDay;
        })();

        return matchSearch && matchYear && matchMonth && matchDay;
      })
      .sort((a, b) => {
        const fechaA = normalizeFecha(a.fecha);
        const fechaB = normalizeFecha(b.fecha);

        if (fechaA !== fechaB) return fechaB.localeCompare(fechaA);
        return Number(b.id ?? 0) - Number(a.id ?? 0);
      });
  }, [accountFilteredItems, searchQuery, filterDay, filterMonth, filterYear]);

  const openNewModal = () => {
    setEditingTransaction(null);
    setFormType("gasto");
    setFormCategoria("");
    setFormCategoriaPadre(null);
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
    setFormCategoriaPadre(item.categoria_padre ?? null);
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

  const isBudgetScreen = activeRouteName === "Presupuestos";

  useEffect(() => {
    Animated.timing(fabVisibility, {
      toValue: isBudgetScreen ? 0 : 1,
      damping: 18,
      duration: 260,
      mass: 0.7,
      useNativeDriver: true,
    }).start();
  }, [fabVisibility, isBudgetScreen]);

  return (
    <SafeAreaProvider>
      {/* <StatusBar style={isDark ? "light" : "dark"} /> */}
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
        edges={["left", "right", "bottom"]}
      >
        <NavigationContainer theme={navigationTheme}>
          <View
            style={[styles.safeArea, { backgroundColor: colors.background }]}
          >
            <Tab.Navigator
              screenListeners={{
                state: (event) => {
                  const route = event.data.state.routes[event.data.state.index];
                  setActiveRouteName(route.name);
                },
              }}
              screenOptions={({ route }) => ({
                tabBarScrollEnabled: true,
                tabBarItemStyle: {
                  width: "auto",
                  paddingHorizontal: 18,
                },
                headerShown: false,
                tabBarActiveTintColor: "white",
                tabBarInactiveTintColor: colors.primaryTextSoft,
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarStyle: [
                  styles.tabBarTop,
                  { backgroundColor: colors.primary },
                ],
                tabBarIndicatorStyle: styles.tabBarIndicator,
                tabBarShowIcon: true,
                tabBarIcon: ({ color }) => {
                  const iconName =
                    route.name === "Inicio"
                      ? "home-outline"
                      : route.name === "Registros"
                        ? "list-outline"
                        : route.name === "Estadisticas"
                          ? "pie-chart-outline"
                          : "wallet-outline";

                  return <Ionicons name={iconName} size={24} color={color} />;
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
                    filterDay={filterDay}
                    setFilterMonth={setFilterMonth}
                    setFilterYear={setFilterYear}
                    setFilterDay={setFilterDay}
                    cuentas={cuentas}
                    createAccount={createAccount}
                    renameAccount={renameAccount}
                    deleteAccount={deleteAccount}
                    selectedAccountId={selectedAccountId}
                    setSelectedAccountId={setSelectedAccountId}
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
                    selectedAccount={selectedAccount}
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
                    selectedAccount={selectedAccount}
                  />
                )}
              </Tab.Screen>

              <Tab.Screen name="Presupuestos">
                {() => (
                  <BudgetsScreen
                    lista={lista}
                    presupuestos={presupuestos}
                    saveBudget={saveBudget}
                    deleteBudget={deleteBudget}
                    registerBudgetAlert={registerBudgetAlert}
                    filterMonth={filterMonth}
                    filterYear={filterYear}
                    setFilterMonth={setFilterMonth}
                    setFilterYear={setFilterYear}
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
              formCategoriaPadre={formCategoriaPadre}
              setFormCategoriaPadre={setFormCategoriaPadre}
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

            <Animated.View
              pointerEvents={isBudgetScreen ? "none" : "auto"}
              style={[
                styles.fab,
                {
                  backgroundColor: colors.primary,
                  opacity: fabVisibility,
                  transform: [
                    {
                      translateY: fabVisibility.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Pressable
                accessibilityLabel="Añadir transacción"
                onPress={openNewModal}
                style={styles.fabButton}
              >
                <Ionicons name="add" size={30} color="white" />
              </Pressable>
            </Animated.View>
          </View>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  tabBarTop: {
    paddingTop: 40,
    elevation: 8,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
  },
  tabBarIndicator: {
    backgroundColor: "white",
    height: 3,
  },
  tabBarLabel: {
    fontSize: 16,
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
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  fabButton: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});
