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

function HomeScreen({
  loading,
  recentTransactions,
  balanceTotal,
  totalIngresosMensual,
  totalGastosMensual,
  formatearMonto,
  openEditModal,
  deleteTransaction,
  openNewModal,
}) {
  const latestTransactions = [...recentTransactions].sort(
    (a, b) => new Date(b.fecha) - new Date(a.fecha),
  );

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
        selectedMonthItems={recentTransactions}
        totalIngresosMensual={totalIngresosMensual}
        totalGastosMensual={totalGastosMensual}
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
            {latestTransactions.slice(0, 5).length === 0 ? (
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
    gap: 16,
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
    borderRadius: 24,
    backgroundColor: "rgb(20, 23, 28)",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { color: "#f8fafc", fontSize: 17, fontWeight: "700" },
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
});

export { HomeScreen };
