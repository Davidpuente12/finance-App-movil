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
import { categoriasGasto, categoriasIngreso } from "../data/categorias";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";

function RecordsScreen({
  loading,
  lista,
  allFilteredTransactions,
  searchQuery,
  setSearchQuery,
  filterDate,
  setFilterDate,
  getTodayDate,
  openEditModal,
  openNewModal,
  formFecha,
  // filtro meses
  filterMonth,
  setFilterMonth,
  mesesMap,
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMonthModal, setShowMonthModal] = useState(false);

  const handleSelectMonth = (mes) => {
    setFilterMonth(mes);
    const mesNumero = mesesMap[mes];
    const mesStr = String(mesNumero).padStart(2, "0");
    setFilterDate(`${yearActual}-${mesStr}`);
    setShowMonthModal(false);
  };

  const mesesArray = Object.keys(mesesMap);
  const yearActual = new Date().getFullYear();

  return (
    <ScrollView style={styles.container}>
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
                      onPress={() => handleSelectMonth(mes)}
                    >
                      <Text style={styles.gridItemText}>{mes}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </Modal>

          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            <Text style={styles.inputDateText}>
              {filterDate || "Fecha YYYY-MM-DD"}
            </Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={filterDate ? new Date(filterDate) : new Date()}
              mode="date"
              display="default"
              onValueChange={(event, selectedDate) => {
                if (selectedDate) {
                  const isoDate = selectedDate.toISOString().split("T")[0];
                  setFilterDate(isoDate);

                  // sincronizar el Picker de meses
                  const mesNumero = selectedDate.getMonth();
                  const mesNombre = Object.keys(mesesMap)[mesNumero];
                  setFilterMonth(mesNombre);
                }
                setShowDatePicker(false);
              }}
              onDismiss={() => setShowDatePicker(false)}
            />
          )}
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
    backgroundColor: " rgb(32, 32, 38)",
  },
  section: {
    gap: 12,
    padding: 16,
    backgroundColor: " rgb(20, 23, 28)",
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
    paddingVertical: 14,
    color: "#f8fafc",
    fontSize: 17,
    backgroundColor: " rgb(20, 23, 28)",
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
    backgroundColor: " rgb(32, 32, 38)",
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
    color: " rgb(119, 119, 255)",
    fontWeight: "700",
  },
});

export { RecordsScreen };
