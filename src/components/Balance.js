import { View, StyleSheet } from "react-native";
import { formatearMonto } from "../utils/formatearMonto";
import { MetricCard } from "./MetricCard";
import { useTheme } from "../theme/ThemeContext";

function Balance({ balanceTotal, totalIngresosMensual, totalGastosMensual }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
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
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    cardsRow: {
      backgroundColor: colors.surface,
      flexDirection: "row",
      padding: 12,
      borderBottomEndRadius: 12,
      borderBottomStartRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
  });
}

export { Balance };
