import { View, Text, StyleSheet } from "react-native";
import { formatearMonto } from "../utils/formatearMonto";
import { MetricCard } from "./MetricCard";

function Balance({ balanceTotal, totalIngresosMensual, totalGastosMensual }) {
  return (
    <View style={styles.section}>
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
  cardsRow: {
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    borderTopWidth: 1,
    borderColor: "#1e293b",
  },
});

export { Balance };
