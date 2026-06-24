import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTransactions } from "./src/hook/useTransactions";
import { formatearMonto } from "./src/utils/formatearMonto.js";
import { getMonthTransactions, getTodayDate } from "./src/utils/fechaActual";
import { categoriasGasto, categoriasIngreso } from "./src/data/categorias";
import { HomeScreen } from "./src/screens/HomeScreen";
import { RecordsScreen } from "./src/screens/RecordsScreen";
import { StatsScreen } from "./src/screens/StatsScreen";
import { TransactionModal } from "./src/components/TransactionModal";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

const Tab = createMaterialTopTabNavigator();

const createTransaction = (transaction, editingId) => ({
  ...transaction,
  id: editingId ?? Date.now(),
});

export default function App() {
  const { lista, setLista, loading } = useTransactions(
    "transacciones_finance_APP",
    [],
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  // filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [filterDate, setFilterDate] = useState(getTodayDate());
  // valores del formulario
  const [formType, setFormType] = useState("gasto");
  const [formMonto, setFormMonto] = useState("");
  const [formCategoria, setFormCategoria] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formFecha, setFormFecha] = useState(getTodayDate());

  const selectedMonthItems = useMemo(
    () => getMonthTransactions(lista, filterDate),
    [lista, filterDate],
  );

  const totalGastosMensual = useMemo(
    () =>
      selectedMonthItems
        .filter((item) => item.tipo === "gasto")
        .reduce((acu, item) => acu + item.monto, 0),
    [selectedMonthItems],
  );

  const totalIngresosMensual = useMemo(
    () =>
      selectedMonthItems
        .filter((item) => item.tipo === "ingreso")
        .reduce((acu, item) => acu + item.monto, 0),
    [selectedMonthItems],
  );

  const balanceTotal = totalIngresosMensual - totalGastosMensual;

  const allFilteredTransactions = useMemo(() => {
    return [...lista]
      .filter((item) =>
        (() => {
          const normalizedQuery = searchQuery.trim().toLowerCase();
          const matchType = filterType === "todos" || item.tipo === filterType;
          const matchSearch =
            normalizedQuery.length === 0 ||
            item.categoria.toLowerCase().includes(normalizedQuery) ||
            item.descripcion.toLowerCase().includes(normalizedQuery);

          const matchDate = (() => {
            if (!filterDate) {
              return true;
            }

            const [year, month] = filterDate.split("-");
            const itemFecha = item.fecha.includes("-")
              ? item.fecha
              : new Date(item.fecha).toISOString().split("T")[0];
            const [itemYear, itemMonth] = itemFecha.split("-");

            return (
              Number(itemYear) === Number(year) &&
              Number(itemMonth) === Number(month)
            );
          })();

          return matchType && matchSearch && matchDate;
        })(),
      )
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [lista, searchQuery, filterType, filterDate]);

  const openNewModal = () => {
    setEditingTransaction(null);
    setFormType("gasto");
    setFormMonto("");
    setFormDescripcion("");
    setFormFecha(getTodayDate());
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setEditingTransaction(item);
    setFormType(item.tipo);
    setFormMonto(String(item.monto));
    setFormCategoria(item.categoria);
    setFormDescripcion(item.descripcion ?? "");
    setFormFecha(item.fecha);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingTransaction(null);
  };

  const saveTransaction = () => {
    const monto = Number(formMonto);
    if (!formCategoria || !formFecha || Number.isNaN(monto) || monto <= 0) {
      return;
    }

    const payload = createTransaction(
      {
        tipo: formType,
        monto,
        categoria: formCategoria.trim(),
        descripcion: formDescripcion.trim() || undefined,
        fecha: formFecha,
      },
      editingTransaction?.id,
    );

    setLista((current) => {
      if (editingTransaction) {
        return current.map((item) =>
          item.id === editingTransaction.id ? payload : item,
        );
      }

      return [...current, payload];
    });

    closeModal();
  };

  const deleteTransaction = (id) => {
    setLista((current) => current.filter((item) => item.id !== id));
    if (editingTransaction?.id === id) {
      closeModal();
    }
  };

  const categories = formType === "gasto" ? categoriasGasto : categoriasIngreso;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <NavigationContainer>
          <View style={styles.safeArea}>
            <Tab.Navigator
              screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: "white",
                tabBarInactiveTintColor: "#94a3b8",
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarStyle: styles.tabBarTop,
                tabBarIndicatorStyle: styles.tabBarIndicator,
                tabBarShowIcon: true,
                tabBarIcon: ({ color, size }) => {
                  const iconName =
                    route.name === "inicio"
                      ? "home-outline"
                      : route.name === "registros"
                        ? "list-outline"
                        : "pie-chart-outline";

                  return <Ionicons name={iconName} size={size} color={color} />;
                },
              })}
            >
              <Tab.Screen name="inicio">
                {() => (
                  <HomeScreen
                    loading={loading}
                    lista={lista}
                    recentTransactions={selectedMonthItems}
                    balanceTotal={balanceTotal}
                    totalIngresosMensual={totalIngresosMensual}
                    totalGastosMensual={totalGastosMensual}
                    formatearMonto={formatearMonto}
                    openEditModal={openEditModal}
                    openNewModal={openNewModal}
                  />
                )}
              </Tab.Screen>

              <Tab.Screen name="registros">
                {() => (
                  <RecordsScreen
                    loading={loading}
                    lista={lista}
                    filteredTransactions={allFilteredTransactions}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    filterType={filterType}
                    setFilterType={setFilterType}
                    filterDate={filterDate}
                    setFilterDate={setFilterDate}
                    getTodayDate={getTodayDate}
                    openEditModal={openEditModal}
                    openNewModal={openNewModal}
                  />
                )}
              </Tab.Screen>

              <Tab.Screen name="estadisticas">
                {() => (
                  <StatsScreen
                    lista={lista}
                    selectedMonthItems={selectedMonthItems}
                    totalIngresosMensual={totalIngresosMensual}
                    totalGastosMensual={totalGastosMensual}
                    formatearMonto={formatearMonto}
                  />
                )}
              </Tab.Screen>
            </Tab.Navigator>

            <TransactionModal
              visible={modalVisible}
              editingTransaction={editingTransaction}
              closeModal={closeModal}
              saveTransaction={saveTransaction}
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
              categories={categories}
            />

            <Pressable style={styles.fab} onPress={openNewModal}>
              <Ionicons name="add" size={30} color="#081120" />
            </Pressable>
          </View>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#081120" },
  tabBarTop: {
    backgroundColor: "rgb(79, 57, 246)",
    borderBottomColor: "#1e293b",
    borderBottomWidth: 1,
    paddingTop: 40,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
  },
  tabBarIndicator: {
    backgroundColor: "white",
    height: 3,
    borderRadius: 999,
  },
  tabBarLabel: {
    fontSize: 11,
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
    backgroundColor: "#38bdf8",
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
});
