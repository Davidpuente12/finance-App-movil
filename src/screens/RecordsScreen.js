import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
  filterDate,
  setFilterDate,
  getTodayDate,
  openEditModal,
  openNewModal,
}) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Buscador e historial</Text>
        </View>

        <View style={styles.filters}>
          <TextInput
            style={styles.input}
            placeholder="Buscar por concepto o categoría"
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resultados</Text>
          <Text style={styles.sectionMeta}>{lista.length} movimientos</Text>
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
            <TransactionRow item={item} onEdit={() => openEditModal(item)} />
          )}
        />
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
    flex: 1,
    padding: 10,
    paddingTop: 20,
    gap: 16,
    backgroundColor: " rgb(32, 32, 38)",
  },
  section: {
    gap: 12,
    padding: 16,
    borderRadius: 24,
    backgroundColor: " rgb(20, 23, 28)",
    borderWidth: 1,
    // borderColor: "transparent",
    borderColor: " rgb(31, 42, 60)",
    // sombras ios
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // sombras android
    // elevation: 5,
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
  emptyState: { paddingVertical: 18, alignItems: "center" },
  emptyStateText: { color: "#94a3b8", textAlign: "center" },
});

export { RecordsScreen };
