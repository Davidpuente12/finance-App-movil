import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { TransactionRow } from "../components/TransactionRow";

function RecordsScreen({
  loading,
  allFilteredTransactions,
  searchQuery,
  setSearchQuery,
  openEditModal,
  cuentas,
}) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sectionFilter}>
        <TextInput
          style={styles.input}
          placeholder="Buscar por concepto o categoría"
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resultados</Text>
          <Text style={styles.sectionMeta}>
            {allFilteredTransactions.length} movimientos
          </Text>
        </View>

        {allFilteredTransactions.length === 0 ? (
          <EmptyState
            text={
              loading
                ? "Cargando datos..."
                : "No hay resultados con esos filtros."
            }
          />
        ) : (
          allFilteredTransactions.map((item) => (
            <TransactionRow
              key={String(item.id)}
              item={item}
              cuentas={cuentas}
              onEdit={() => openEditModal(item)}
            />
          ))
        )}

        {/* <FlatList
          data={allFilteredTransactions}
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
        /> */}
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
    backgroundColor: "rgb(20, 23, 28)",
  },
  section: {
    flex: 1,
    gap: 4,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { color: "#f8fafc", fontSize: 17, fontWeight: "500" },
  sectionMeta: { color: "#94a3b8", fontSize: 12 },
  sectionFilter: { padding: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 15,
    borderColor: "#334155",
    color: "#f8fafc",
    fontSize: 17,
  },
  emptyState: { paddingVertical: 18, alignItems: "center" },
  emptyStateText: { color: "#94a3b8", textAlign: "center" },
});

export { RecordsScreen };
