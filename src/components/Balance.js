import { View, Text, StyleSheet } from "react-native";
import { formatearMonto } from "../utils/formatearMonto";
import { MetricCard } from "./MetricCard";
import { useTheme } from "../theme/ThemeContext";

function Balance({ balanceTotal, totalIngresosMensual, totalGastosMensual }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

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

function createStyles(colors) {
  return StyleSheet.create({
  section: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 8,
    borderRadius: 12,
  },
  cardsRow: {
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  });
}

export { Balance };
