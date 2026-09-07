import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { formatearMonto } from "../utils/formatearMonto";
import { MetricCard } from "../components/MetricCard";
import { ResumenMensual } from "../components/ResumenMensual";
import { useTheme } from "../theme/ThemeContext";

const monthLabels = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];
const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function StatsScreen({
  lista,
  selectedMonthItems,
  totalIngresosMensual,
  totalGastosMensual,
  balanceTotal,
  filterMonth,
  filterYear,
  selectedAccount,
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const annualSummaryByMonth = useMemo(() => {
    const targetYear = Number(filterYear) || new Date().getFullYear();
    const totals = Array.from({ length: 12 }, () => ({
      expenses: 0,
      income: 0,
      movements: 0,
    }));

    lista.forEach((item) => {
      const [year, month] = item.fecha.split("-").map(Number);
      if (year !== targetYear || month < 1 || month > 12) return;

      const monthSummary = totals[month - 1];
      monthSummary.movements += 1;
      if (item.tipo === "gasto") monthSummary.expenses += item.monto;
      if (item.tipo === "ingreso") monthSummary.income += item.monto;
    });

    return totals;
  }, [lista, filterYear]);

  const annualExpenseByMonth = annualSummaryByMonth.map(
    (month) => month.expenses,
  );
  const annualIncomeByMonth = annualSummaryByMonth.map((month) => month.income);

  const annualExpenseTotal = useMemo(
    () => annualExpenseByMonth.reduce((sum, value) => sum + value, 0),
    [annualExpenseByMonth],
  );

  const hasData = annualExpenseByMonth.some((v) => v > 0);
  const maxAnnualExpense = hasData ? Math.max(...annualExpenseByMonth) : 0;
  const maxIndex = hasData
    ? annualExpenseByMonth.indexOf(maxAnnualExpense)
    : -1;

  const annualIncomeTotal = useMemo(() => {
    const total = annualIncomeByMonth.reduce((sum, value) => sum + value, 0);
    const monthCount = annualIncomeByMonth.filter((value) => value > 0).length;

    return { total, monthCount };
  }, [annualIncomeByMonth]);

  const annualIncomeAmount = annualIncomeTotal.total;
  const annualExpenseMonthCount = annualExpenseByMonth.filter(
    (value) => value > 0,
  ).length;

  const averageMonthlyExpenses = annualExpenseMonthCount
    ? annualExpenseTotal / annualExpenseMonthCount
    : 0;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
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

      <ResumenMensual
        selectedMonthItems={selectedMonthItems}
        totalIngresosMensual={totalIngresosMensual}
        totalGastosMensual={totalGastosMensual}
        filterMonth={filterMonth}
        filterYear={filterYear}
        selectedAccount={selectedAccount}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen anual</Text>

        <View style={styles.yearSummaryRow}>
          <MetricLine
            label="Ingresos totales del año"
            value={formatearMonto(annualIncomeAmount)}
            tone="positive"
            colors={colors}
          />

          <MetricLine
            label="Gasto total del año"
            value={formatearMonto(annualExpenseTotal)}
            tone="negative"
            colors={colors}
          />

          <MetricLine
            label="Promedio mensual de gastos"
            value={formatearMonto(averageMonthlyExpenses)}
            tone="neutral"
            colors={colors}
          />

          <MetricLine
            label="Mes más alto"
            value={`${maxIndex >= 0 ? monthNames[maxIndex] : "Sin datos"}  ${formatearMonto(
              maxAnnualExpense,
            )}`}
            tone="negative"
            colors={colors}
          />
        </View>

        <View style={styles.chartCard}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.barChart}
          >
            {annualExpenseByMonth.map((value, index) => {
              const height = (value / maxAnnualExpense) * 180;
              const isMax = index === maxIndex;

              return (
                <View key={monthLabels[index]} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: Math.max(height, value > 0 ? 8 : 0) },
                        isMax && styles.barFillMax,
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{monthLabels[index]}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.yearGrid}>
          <View style={{ paddingBottom: 20 }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: 500 }}>
              Balance en los meses del año
            </Text>
          </View>
          {annualSummaryByMonth.map((month, index) => (
            <View key={monthNames[index]} style={styles.yearItem}>
              <Text style={styles.yearMonthTitle}>{monthNames[index]}</Text>

              <View style={styles.yearMetric}>
                <Text style={styles.yearMetricLabel}>Ingresos</Text>
                <Text style={styles.monthlyIncomeTitle}>
                  {formatearMonto(month.income)}
                </Text>
              </View>

              <View style={styles.yearMetric}>
                <Text style={styles.yearMetricLabel}>Gastos</Text>
                <Text style={styles.monthlyExpensesTitle}>
                  {formatearMonto(month.expenses)}
                </Text>
              </View>

              <View style={styles.yearMetric}>
                <Text style={styles.yearMetricLabel}>Balance</Text>
                <Text
                  style={[
                    styles.yearBalanceAmount,
                    month.income - month.expenses >= 0
                      ? styles.positive
                      : styles.negative,
                  ]}
                >
                  {formatearMonto(month.income - month.expenses)}
                </Text>
              </View>
              <Text style={styles.yearMovements}>
                {month.movements}{" "}
                {month.movements === 1 ? "movimiento" : "movimientos"}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function MetricLine({ label, value, tone, colors }) {
  const styles = createStyles(colors);

  return (
    <View style={styles.metricLine}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text
        style={[
          styles.metricValue,
          tone === "positive"
            ? styles.positive
            : tone === "negative"
              ? styles.negative
              : styles.neutral,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      gap: 8,
      backgroundColor: colors.background,
      paddingBottom: 20,
    },
    summaryRow: { flexDirection: "row", gap: 12 },
    cardsRow: {
      backgroundColor: colors.surface,
      flexDirection: "row",
      paddingVertical: 14,
      borderRadius: 12,
      marginHorizontal: 10,
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    section: {
      marginHorizontal: 10,
      gap: 12,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "500" },
    metricLine: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    metricLabel: { color: colors.textSecondary, fontSize: 14 },
    metricValue: { fontWeight: "700" },
    positive: { color: colors.positive },
    negative: { color: colors.negative },
    neutral: { color: colors.text },
    yearSummaryRow: {
      gap: 12,
      marginBottom: 4,
    },
    chartCard: {
      paddingVertical: 20,
    },
    barChart: {
      flexDirection: "row",
      gap: 5,
      minHeight: 250,
    },
    barColumn: {
      width: 40,
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 8,
    },
    barTrack: {
      width: "100%",
      height: 180,
      justifyContent: "flex-end",
      overflow: "hidden",
    },
    barFill: {
      width: "100%",
      borderRadius: 10,
      backgroundColor: colors.accent,
    },
    barFillMax: {
      backgroundColor: colors.negative,
    },
    barLabel: {
      color: colors.textMuted,
      fontSize: 11,
    },
    yearGrid: {
      marginTop: 15,
      paddingTop: 30,
      borderTopWidth: 1,
      borderColor: colors.borderStrong,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    yearItem: {
      width: "48%",
      padding: 10,
      borderRadius: 12,
      backgroundColor: colors.surfaceElevated,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    },
    yearMonthTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 10,
    },
    monthlyExpensesTitle: {
      color: colors.negative,
      fontWeight: "600",
      fontSize: 13,
    },
    monthlyIncomeTitle: {
      color: colors.positive,
      fontWeight: "600",
      fontSize: 13,
    },
    yearBalanceAmount: { fontWeight: "600", fontSize: 13 },
    yearMetric: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    yearMetricLabel: { color: colors.textMuted, fontSize: 12 },

    yearMovements: {
      color: colors.textFaint,
      fontSize: 11,
      marginTop: 10,
      fontStyle: "italic",
    },
  });
}

export { StatsScreen };
