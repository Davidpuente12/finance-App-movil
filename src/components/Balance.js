import { View, Text, StyleSheet } from "react-native";
import { formatearMonto } from "../utils/formatearMonto";
import { MetricCard } from "./MetricCard";
import { getMonthYearFiltered } from "../utils/fechaActual";

function Balance({
  balanceTotal,
  totalIngresosMensual,
  totalGastosMensual,

  filterMonth,
  filterYear,
}) {
  return (
    <View style={styles.section}>
      <View style={styles.seccionFecha}>
        <Text style={styles.sectionDate}>
          {getMonthYearFiltered(filterMonth, filterYear)}
        </Text>
      </View>

      <View style={styles.cardsRow}>
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
        <MetricCard
          label="Balance"
          value={formatearMonto(balanceTotal)}
          tone="primary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "rgb(20, 23, 28)",
    borderWidth: 1,
    borderColor: "#1e293b",
    marginHorizontal: 8,
    borderRadius: 12,
  },
  seccionFecha: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionDate: { color: "#cbd5e1", fontSize: 16 },
  cardsRow: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgb(20, 23, 28)",
    borderTopWidth: 1,
    borderColor: "#1e293b",
    flexDirection: "row",
  },
});

export { Balance };
