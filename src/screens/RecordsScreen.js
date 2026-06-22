import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TransactionRow } from "../components/TransactionRow";
import { categoriasGasto, categoriasIngreso } from "../data/categorias";

function RecordsScreen({
  loading,
  lista,
  filteredTransactions,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filterCategory,
  setFilterCategory,
  filterDate,
  setFilterDate,
  resetFilters,
  openEditModal,
  deleteTransaction,
  openNewModal,
  formatearMonto,
}) {
  const activeCategories =
    filterType === "gasto"
      ? categoriasGasto
      : filterType === "ingreso"
        ? categoriasIngreso
        : [...categoriasGasto, ...categoriasIngreso];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Historial</Text>
          <Text style={styles.heroTitle}>Transacciones y filtros</Text>
          <Text style={styles.heroSubtitle}>
            Busca, filtra y edita movimientos del mes o de todo el historial.
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard
            label="Resultados"
            value={String(filteredTransactions.length)}
          />
          <SummaryCard label="Total mov." value={String(lista.length)} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Buscador e historial</Text>
            <Pressable style={styles.secondaryButton} onPress={openNewModal}>
              <Text style={styles.secondaryButtonText}>Nuevo</Text>
            </Pressable>
          </View>

          <View style={styles.filters}>
            <TextInput
              style={styles.input}
              placeholder="Buscar por concepto o categoría"
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TextInput
              style={styles.input}
              placeholder="Tipo: todos | ingreso | gasto"
              placeholderTextColor="#64748b"
              value={filterType}
              onChangeText={setFilterType}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Categoría"
              placeholderTextColor="#64748b"
              value={filterCategory}
              onChangeText={setFilterCategory}
            />
            <View style={styles.chipsWrap}>
              {activeCategories.slice(0, 8).map((category) => (
                <Pressable
                  key={category}
                  style={[
                    styles.chip,
                    filterCategory === category && styles.chipActive,
                  ]}
                  onPress={() => setFilterCategory(category)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filterCategory === category && styles.chipTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Fecha YYYY-MM-DD"
              placeholderTextColor="#64748b"
              value={filterDate}
              onChangeText={setFilterDate}
            />
            <Pressable style={styles.secondaryButton} onPress={resetFilters}>
              <Text style={styles.secondaryButtonText}>Resetear filtros</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Resultados</Text>
            <Text style={styles.sectionMeta}>{lista.length} movimientos</Text>
          </View>

          <View style={styles.resultsHint}>
            <Text style={styles.resultsHintText}>
              Mostrando {filteredTransactions.length} registros con los filtros
              activos.
            </Text>
          </View>

          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
            ListEmptyComponent={
              <EmptyState
                text={
                  loading
                    ? "Cargando datos..."
                    : "No hay resultados con esos filtros."
                }
              />
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

function SummaryCard({ label, value }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#081120" },
  container: { padding: 16, gap: 16, backgroundColor: "#081120" },
  hero: { gap: 8 },
  kicker: {
    color: "#7dd3fc",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontSize: 12,
  },
  heroTitle: { color: "#f8fafc", fontSize: 24, fontWeight: "800" },
  heroSubtitle: { color: "#cbd5e1", lineHeight: 20 },
  summaryRow: { flexDirection: "row", gap: 12 },
  summaryCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  summaryLabel: { color: "#94a3b8", fontSize: 12, marginBottom: 4 },
  summaryValue: { color: "#f8fafc", fontSize: 18, fontWeight: "800" },
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
  filters: { gap: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#f8fafc",
    backgroundColor: "#111827",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#e2e8f0", fontWeight: "600" },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 2 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#334155",
  },
  chipActive: { backgroundColor: "#1d4ed8", borderColor: "#60a5fa" },
  chipText: { color: "#cbd5e1", fontSize: 12, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
  resultsHint: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  resultsHintText: { color: "#cbd5e1" },
  emptyState: { paddingVertical: 18, alignItems: "center" },
  emptyStateText: { color: "#94a3b8", textAlign: "center" },
});

export { RecordsScreen };
