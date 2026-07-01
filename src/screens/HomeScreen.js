import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { MetricCard } from "../components/MetricCard";
import { TransactionRow } from "../components/TransactionRow";
import { ResumenMensualHome } from "../components/ResumenMensualHome";
import { useNavigation } from "@react-navigation/native";

function HomeScreen({
  loading,
  selectedMonthItems,
  balanceTotal,
  totalIngresosMensual,
  totalGastosMensual,
  formatearMonto,
  openEditModal,
  deleteTransaction,
  openNewModal,
  filterMonth,
  filterYear,
}) {
  const latestTransactions = [...selectedMonthItems].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha),
  );

  const navigation = useNavigation();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      <View style={styles.cardsRow}>
        <MetricCard
          label="Balance"
          value={formatearMonto(balanceTotal)}
          tone="primary"
        />
        <MetricCard
          label="Ingresos"
          value={formatearMonto(totalIngresosMensual)}
          tone="green"
        />
        <MetricCard
          label="Gastos"
          value={formatearMonto(totalGastosMensual)}
          tone="red"
        />
      </View>

      <ResumenMensualHome
        selectedMonthItems={selectedMonthItems}
        totalIngresosMensual={totalIngresosMensual}
        totalGastosMensual={totalGastosMensual}
        filterMonth={filterMonth}
        filterYear={filterYear}
      />

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Resumen de los últimos registros
          </Text>
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
    height: 1150,
    flexGrow: 1,
    gap: 8,
    backgroundColor: "rgb(32, 32, 38)",
    paddingBottom: 20,
  },
  cardsRow: {
    backgroundColor: "rgb(20, 23, 28)",
    flexDirection: "row",
    padding: 10,
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
  },
  sectionTitle: { color: "white", fontSize: 17, fontWeight: "500" },
  sectionMeta: { color: "#94a3b8", fontSize: 12 },
  loadingBox: { alignItems: "center", gap: 8, paddingVertical: 16 },
  loadingText: { color: "#cbd5e1" },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#e2e8f0", fontWeight: "600" },
  emptyState: { paddingVertical: 18, alignItems: "center" },
  emptyStateText: { color: "#94a3b8", textAlign: "center" },
  coverageText: { color: "#cbd5e1", lineHeight: 20 },

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
