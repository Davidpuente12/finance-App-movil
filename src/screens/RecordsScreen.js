import {
  FlatList,
  ScrollView,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  View,
  Modal,
} from "react-native";
import { TransactionRow } from "../components/TransactionRow";
import { useState } from "react";
import { mesesMap, yearsArray } from "../utils/fechaActual";

function RecordsScreen({
  loading,
  allFilteredTransactions,
  searchQuery,
  setSearchQuery,
  openEditModal,
  // filtro fecha
  filterYear,
  setFilterYear,
  filterMonth,
  setFilterMonth,
  cuentas,
}) {
  const [showMonthModal, setShowMonthModal] = useState(false);
  const [showYearModal, setShowYearModal] = useState(false);

  const mesesArray = Object.keys(mesesMap);

  const handleSelectYear = (year) => {
    setFilterYear(year.toString());
    setShowYearModal(false);
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <View style={styles.sectionHeaderPrincipal}>
          <Pressable
            style={styles.monthButton}
            onPress={() => setShowMonthModal(true)}
          >
            <Text style={styles.monthButtonText}>
              {filterMonth || "Seleccionar mes"}
            </Text>
          </Pressable>

          <Modal visible={showMonthModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalContentHeader}>
                  <Text style={styles.modalTitle}>Selecciona un mes</Text>
                  <Pressable
                    style={styles.closeButton}
                    onPress={() => setShowMonthModal(false)}
                  >
                    <Text style={styles.closeButtonText}>⨉</Text>
                  </Pressable>
                </View>
                <View style={styles.gridContainer}>
                  {mesesArray.map((mes) => (
                    <Pressable
                      key={mes}
                      style={styles.gridItem}
                      onPress={() => {
                        setFilterMonth(mes);
                        setShowMonthModal(false);
                      }}
                    >
                      <Text style={styles.gridItemText}>{mes}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </Modal>

          <Pressable
            onPress={() => setShowYearModal(true)}
            style={styles.dateButton}
          >
            <Text style={styles.inputDateText}>
              {filterYear || "Selecciona año"}
            </Text>
          </Pressable>

          <Modal visible={showYearModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalContentHeader}>
                  <Text style={styles.modalTitle}>Selecciona un año</Text>
                  <Pressable
                    style={styles.closeButton}
                    onPress={() => setShowYearModal(false)}
                  >
                    <Text style={styles.closeButtonText}>⨉</Text>
                  </Pressable>
                </View>

                <ScrollView style={{ maxHeight: 300 }}>
                  {yearsArray.map((year) => (
                    <Pressable
                      key={year}
                      style={styles.gridItem}
                      onPress={() => handleSelectYear(year)}
                    >
                      <Text style={styles.gridItemText}>{year}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
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
    backgroundColor: "rgb(32, 32, 38)",
  },
  section: {
    flex: 1,
    gap: 4,
    padding: 16,
    backgroundColor: "rgb(20, 23, 28)",
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
    borderBottomWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 14,
    paddingVertical: 16,
    color: "#f8fafc",
    fontSize: 17,
    backgroundColor: "rgb(20, 23, 28)",
  },
  emptyState: { paddingVertical: 18, alignItems: "center" },
  emptyStateText: { color: "#94a3b8", textAlign: "center" },

  // selectores de fechas
  sectionHeaderPrincipal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
  },
  // Date
  dateButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  inputDateText: {
    color: "white",
    fontSize: 17,
  },
  // Date Month
  monthButton: {
    flex: 1,
    alignItems: "center",
  },
  monthButtonText: {
    color: "white",
    fontSize: 17,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "rgb(32, 32, 38)",
    borderRadius: 12,
    padding: 16,
  },
  modalContentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
    color: "white",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 17,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  gridItem: {
    width: "30%",
    margin: 5,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  gridItemText: {
    fontSize: 17,
    color: "rgb(119, 119, 255)",
    fontWeight: "700",
  },
});

export { RecordsScreen };
