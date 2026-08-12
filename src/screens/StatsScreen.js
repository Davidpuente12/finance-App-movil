import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { formatearMonto } from "../utils/formatearMonto";
import { MetricCard } from "../components/MetricCard";
import { ResumenMensual } from "../components/ResumenMensual";

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
}) {
  const annualExpenseByMonth = useMemo(() => {
    const targetYear = Number(filterYear) || new Date().getFullYear();
    const totals = Array.from({ length: 12 }, () => 0);

    lista.forEach((item) => {
      if (item.tipo !== "gasto") return;
      const [year, month] = item.fecha.split("-").map(Number);
      if (year !== targetYear) return;
      totals[month - 1] += item.monto;
    });

    return totals;
  }, [lista, filterYear]);

  const annualExpenseTotal = useMemo(
    () => annualExpenseByMonth.reduce((sum, value) => sum + value, 0),
    [annualExpenseByMonth],
  );

  const hasData = annualExpenseByMonth.some((v) => v > 0);
  const maxAnnualExpense = hasData ? Math.max(...annualExpenseByMonth) : 0;
  const maxIndex = hasData
    ? annualExpenseByMonth.indexOf(maxAnnualExpense)
    : -1;

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
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumen anual</Text>

        <View style={styles.yearSummaryRow}>
          <MetricLine
            label="Gastos del año"
            value={formatearMonto(annualExpenseTotal)}
            tone="neutral"
          />
          <MetricLine
            label="Mes más alto"
            value={formatearMonto(Math.max(...annualExpenseByMonth))}
            tone="negative"
          />
        </View>

        <View style={styles.chartCard}>
          <View style={styles.barChart}>
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
          </View>
        </View>

        <View style={styles.yearGrid}>
          {annualExpenseByMonth.map((value, index) => (
            <View key={monthNames[index]} style={styles.yearItem}>
              <Text style={styles.yearMonth}>{monthNames[index]}</Text>
              <Text style={styles.yearAmount}>{formatearMonto(value)}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function MetricLine({ label, value, tone }) {
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

const styles = StyleSheet.create({
  container: { gap: 8, backgroundColor: "rgb(32, 32, 38)", paddingBottom: 20 },
  summaryRow: { flexDirection: "row", gap: 12 },
  cardsRow: {
    backgroundColor: "rgb(20, 23, 28)",
    flexDirection: "row",
    padding: 10,
  },
  section: {
    marginHorizontal: 10,
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgb(20, 23, 28)",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  sectionTitle: { color: "white", fontSize: 17, fontWeight: "500" },
  metricLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  metricLabel: { color: "#e2e8f0", fontSize: 14 },
  metricValue: { fontWeight: "700" },
  positive: { color: "#34d399" },
  negative: { color: "#fb7185" },
  neutral: { color: "#7dd3fc" },
  yearSummaryRow: {
    gap: 10,
  },
  chartCard: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 6,
    minHeight: 250,
  },
  barColumn: {
    flex: 1,
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
    backgroundColor: "#38bdf8",
  },
  barFillMax: {
    backgroundColor: "#fb7185",
  },
  barLabel: {
    color: "#94a3b8",
    fontSize: 11,
  },
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  yearItem: {
    width: "48%",
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgb(32, 32, 38)",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  yearMonth: { color: "#94a3b8", fontSize: 13, marginBottom: 4 },
  yearAmount: { color: "#f8fafc", fontWeight: "700" },
});

export { StatsScreen };
