import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { TransactionRow } from "../components/TransactionRow";
import { useTheme } from "../theme/ThemeContext";

function RecordsScreen({
  loading,
  allFilteredTransactions,
  searchQuery,
  setSearchQuery,
  openEditModal,
  cuentas,
  selectedAccount,
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sectionFilter}>
        <TextInput
          style={styles.input}
          placeholder="Busca por descripción o categoría"
          placeholderTextColor={colors.textFaint}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resultados</Text>
          <View style={styles.sectionMetaContainer}>
            <Text style={styles.sectionMeta}>
              {allFilteredTransactions.length} movimientos
            </Text>
            {selectedAccount && (
              <Text
                style={[
                  styles.accountFilterText,
                  { color: selectedAccount.color },
                ]}
                numberOfLines={1}
              >
                {selectedAccount.nombre}
              </Text>
            )}
          </View>
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
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>{text}</Text>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.surface,
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
  sectionTitle: { color: colors.textStrong, fontSize: 17, fontWeight: "500" },
  sectionMetaContainer: {
    flexDirection: "row",
    gap: 10,
  },
  sectionMeta: { color: colors.textMuted, fontSize: 13 },
  accountFilterText: { fontSize: 14, fontWeight: "500" },
  sectionFilter: { padding: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 15,
    borderColor: colors.borderStrong,
    color: colors.textStrong,
    fontSize: 17,
  },
  emptyState: { paddingVertical: 18, alignItems: "center" },
  emptyStateText: { color: colors.textMuted, textAlign: "center" },
  });
}

export { RecordsScreen };
