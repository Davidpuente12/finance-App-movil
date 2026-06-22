import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MetricCard } from "../components/MetricCard";
import { TransactionRow } from "../components/TransactionRow";

function HomeScreen({
  loading,
  lista,
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Finance App</Text>
          <Text style={styles.title}>Gestor de finanzas personales</Text>
          <Text style={styles.subtitle}>
            Resumen mensual, historial y control local de tus movimientos.
          </Text>
        </View>

        <View style={styles.cardsRow}>
          <MetricCard
            label="Balance"
            value={formatearMonto(balanceTotal)}
            tone="primary"
          />
          <MetricCard
            label="Ingresos"
            value={formatearMonto(totalIngresosMensual)}
            tone="success"
          />
          <MetricCard
            label="Gastos"
            value={formatearMonto(totalGastosMensual)}
            tone="danger"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimos registros</Text>
            <Pressable style={styles.secondaryButton} onPress={openNewModal}>
              <Text style={styles.secondaryButtonText}>Nuevo</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>
                Cargando datos guardados...
              </Text>
            </View>
          ) : (
            <FlatList
              data={latestTransactions.slice(0, 5)}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              ListEmptyComponent={
                <EmptyState text="Aún no hay transacciones registradas." />
              }
              renderItem={({ item }) => (
                <TransactionRow
                  item={item}
                  formatearMonto={formatearMonto}
                  onEdit={() => openEditModal(item)}
                  onDelete={() => deleteTransaction(item.id)}
                />
              )}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cobertura</Text>
            <Text style={styles.sectionMeta}>{lista.length} movimientos</Text>
          </View>
          <Text style={styles.coverageText}>
            La vista principal ya está desacoplada en componentes nativos; el
            siguiente paso es completar las pantallas de historial y
            estadísticas.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  safeArea: { flex: 1, backgroundColor: "#081120" },
  container: { padding: 16, gap: 16, backgroundColor: "#081120" },
  hero: { gap: 8, paddingVertical: 8 },
  kicker: {
    color: "#7dd3fc",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontSize: 12,
  },
  title: { color: "#f8fafc", fontSize: 28, fontWeight: "800" },
  subtitle: { color: "#cbd5e1", fontSize: 14, lineHeight: 20 },
  cardsRow: { gap: 12 },
  section: {
    gap: 12,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "700" },
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
