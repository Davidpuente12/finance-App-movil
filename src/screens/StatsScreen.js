import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { formatearMonto } from "../utils/formatearMonto";
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

function StatsScreen({ lista, filterYear }) {
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

  const hasExpenseData = annualExpenseByMonth.some((value) => value > 0);
  const maxAnnualExpense = hasExpenseData
    ? Math.max(...annualExpenseByMonth)
    : 0;
  const maxIndex = hasExpenseData
    ? annualExpenseByMonth.indexOf(maxAnnualExpense)
    : -1;
  const maxAnnualAmount = Math.max(
    ...annualExpenseByMonth,
    ...annualIncomeByMonth,
    0,
  );

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
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Ingresos y gastos por mes</Text>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, styles.incomeSwatch]} />
                <Text style={styles.legendText}>Ingresos</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendSwatch, styles.expenseSwatch]} />
                <Text style={styles.legendText}>Gastos</Text>
              </View>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.barChart}
          >
            {annualSummaryByMonth.map((month, index) => {
              const incomeHeight = maxAnnualAmount
                ? (month.income / maxAnnualAmount) * 180
                : 0;
              const expenseHeight = maxAnnualAmount
                ? (month.expenses / maxAnnualAmount) * 180
                : 0;

              return (
                <View key={monthLabels[index]} style={styles.barColumn}>
                  <View style={styles.barGroup}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          styles.barFillIncome,
                          {
                            height: Math.max(
                              incomeHeight,
                              month.income > 0 ? 8 : 0,
                            ),
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          styles.barFillExpense,
                          {
                            height: Math.max(
                              expenseHeight,
                              month.expenses > 0 ? 8 : 0,
                            ),
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={styles.barLabel}>{monthLabels[index]}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.yearsBalance}>
          <View style={{ paddingBottom: 20 }}>
            <Text style={{ color: colors.text, fontSize: 15, fontWeight: 500 }}>
              Balance en los meses del año
            </Text>
          </View>
          <View style={styles.yearGrid}>
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
      paddingBottom: 50,
      paddingTop: 5,
    },
    summaryRow: { flexDirection: "row", gap: 12 },
    section: {
      marginHorizontal: 5,
      gap: 12,
      padding: 16,
      paddingBottom: 30,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderStrong,
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
      gap: 16,
    },
    chartHeader: {
      gap: 8,
    },
    chartTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "500",
    },
    chartLegend: {
      flexDirection: "row",
      gap: 14,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    legendSwatch: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    incomeSwatch: {
      backgroundColor: colors.positive,
    },
    expenseSwatch: {
      backgroundColor: colors.negative,
    },
    legendText: {
      color: colors.textMuted,
      fontSize: 12,
    },
    barChart: {
      flexDirection: "row",
      minHeight: 250,
    },
    barColumn: {
      width: 48,
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 8,
    },
    barGroup: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 4,
    },
    barTrack: {
      width: 15,
      height: 180,
      justifyContent: "flex-end",
      overflow: "hidden",
    },
    barFill: {
      width: "100%",
      borderRadius: 10,
    },
    barFillIncome: {
      backgroundColor: colors.positive,
    },
    barFillExpense: {
      backgroundColor: colors.negative,
    },
    barLabel: {
      color: colors.textMuted,
      fontSize: 11,
    },

    // Balance en los meses del año
    yearsBalance: {
      borderTopWidth: 1,
      borderColor: colors.borderStrong,
      marginTop: 15,
      paddingTop: 30,
    },
    yearGrid: {
      flexDirection: "row",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 10,
    },
    yearItem: {
      width: "48%",
      padding: 10,
      borderWidth: 0.8,
      borderColor: colors.border,
      borderRadius: 10,
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
