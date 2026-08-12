import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Balance } from "../components/Balance";
import { TransactionRow } from "../components/TransactionRow";
import { ResumenMensualHome } from "../components/ResumenMensualHome";
import { useNavigation } from "@react-navigation/native";

function HomeScreen({
  loading,
  selectedMonthItems,
  balanceTotal,
  totalIngresosMensual,
  totalGastosMensual,
  saldoDisponible,
  formatearMonto,
  openEditModal,
  deleteTransaction,
  filterMonth,
  filterYear,
}) {
  const latestTransactions = [...selectedMonthItems].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha),
  );

  const navigation = useNavigation();

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Balance
        balanceTotal={balanceTotal}
        totalIngresosMensual={totalIngresosMensual}
        totalGastosMensual={totalGastosMensual}
        saldoDisponible={saldoDisponible}
        filterMonth={filterMonth}
        filterYear={filterYear}
      />

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
    marginHorizontal: 10,
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
  sectionTitle: { color: "white", fontSize: 18, fontWeight: "500" },
  sectionMeta: { color: "#94a3b8", fontSize: 12 },
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
    fontWeight: "700",
  },
});

export { HomeScreen };
