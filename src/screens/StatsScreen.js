import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";
import { formatearMonto } from "../utils/formatearMonto";

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
const categoryColors = [
  "#38bdf8",
  "#34d399",
  "#f59e0b",
  "#f472b6",
  "#a78bfa",
  "#fb7185",
  "#22c55e",
  "#06b6d4",
  "#eab308",
  "#60a5fa",
];

function StatsScreen({
  lista,
  selectedMonthItems,
  totalIngresosMensual,
  totalGastosMensual,
}) {
  const monthExpenseCategories = useMemo(() => {
    const expenses = selectedMonthItems.filter((item) => item.tipo === "gasto");
    const totals = new Map();

    expenses.forEach((item) => {
      totals.set(
        item.categoria,
        (totals.get(item.categoria) ?? 0) + item.monto,
      );
    });

    return Array.from(totals.entries())
      .map(([category, total], index) => ({
        category,
        total,
        color: categoryColors[index % categoryColors.length],
      }))
      .sort((a, b) => b.total - a.total);
  }, [selectedMonthItems]);

  const monthExpenseTotal = useMemo(
    () => monthExpenseCategories.reduce((sum, item) => sum + item.total, 0),
    [monthExpenseCategories],
  );

  const annualExpenseByMonth = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const totals = Array.from({ length: 12 }, () => 0);

    lista.forEach((item) => {
      if (item.tipo !== "gasto") {
        return;
      }

      const date = new Date(item.fecha);
      if (date.getFullYear() !== currentYear) {
        return;
      }

      totals[date.getMonth()] += item.monto;
    });

    return totals;
  }, [lista]);

  const annualExpenseTotal = useMemo(
    () => annualExpenseByMonth.reduce((sum, value) => sum + value, 0),
    [annualExpenseByMonth],
  );

  const maxAnnualExpense = Math.max(...annualExpenseByMonth, 1);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>Estadísticas</Text>
          <Text style={styles.heroTitle}>Resumen mensual y anual</Text>
          <Text style={styles.heroSubtitle}>
            Donut por categorías y columnas por mes para entender el gasto.
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard
            label="Ingresos mes"
            value={formatearMonto(totalIngresosMensual)}
          />
          <SummaryCard
            label="Gastos mes"
            value={formatearMonto(totalGastosMensual)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen mensual</Text>
          <Text style={styles.description}>
            {selectedMonthItems.length} movimientos en el mes seleccionado.
          </Text>

          <View style={styles.monthSummaryRow}>
            <View style={styles.donutWrap}>
              <Svg width={180} height={180} viewBox="0 0 180 180">
                <Circle
                  cx="90"
                  cy="90"
                  r="62"
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="20"
                />
                <DonutSlices
                  data={monthExpenseCategories}
                  total={monthExpenseTotal}
                />
              </Svg>

              <View style={styles.donutCenter}>
                <Text style={styles.donutLabel}>Gastos</Text>
                <Text style={styles.donutValue}>
                  {formatearMonto(totalGastosMensual)}
                </Text>
              </View>
            </View>

            <View style={styles.monthMetrics}>
              <MetricLine
                label="Ingresos"
                value={formatearMonto(totalIngresosMensual)}
                tone="positive"
              />
              <MetricLine
                label="Gastos"
                value={formatearMonto(totalGastosMensual)}
                tone="negative"
              />
              <MetricLine
                label="Categorías"
                value={String(monthExpenseCategories.length)}
                tone="neutral"
              />
            </View>
          </View>

          <View style={styles.legendList}>
            {monthExpenseCategories.length === 0 ? (
              <Text style={styles.emptyText}>
                No hay gastos en el mes seleccionado.
              </Text>
            ) : (
              monthExpenseCategories.map((item) => (
                <View key={item.category} style={styles.legendItem}>
                  <View style={styles.legendLeft}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text style={styles.legendText}>{item.category}</Text>
                  </View>
                  <Text style={styles.legendAmount}>
                    {formatearMonto(item.total)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen anual</Text>
          <Text style={styles.description}>
            Estilo de columnas para los gastos del año actual.
          </Text>

          <View style={styles.yearSummaryRow}>
            <MetricLine
              label="Gastos del año"
              value={formatearMonto(annualExpenseTotal)}
              tone="negative"
            />
            <MetricLine
              label="Mes más alto"
              value={formatearMonto(Math.max(...annualExpenseByMonth))}
              tone="neutral"
            />
          </View>

          <View style={styles.chartCard}>
            <View style={styles.barChart}>
              {annualExpenseByMonth.map((value, index) => {
                const height = (value / maxAnnualExpense) * 180;

                return (
                  <View key={monthLabels[index]} style={styles.barColumn}>
                    <View style={styles.barValueWrap}>
                      <Text style={styles.barValue}>
                        {value > 0 ? formatearMonto(value) : ""}
                      </Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { height: Math.max(height, value > 0 ? 8 : 2) },
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
    </SafeAreaView>
  );
}

function DonutSlices({ data, total }) {
  if (total <= 0 || data.length === 0) {
    return null;
  }

  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return data.map((item) => {
    const dashLength = (item.total / total) * circumference;
    const dashOffset = circumference - accumulated;
    accumulated += dashLength;

    return (
      <Circle
        key={item.category}
        cx="90"
        cy="90"
        r={radius}
        fill="transparent"
        stroke={item.color}
        strokeWidth="20"
        strokeDasharray={`${dashLength} ${circumference - dashLength}`}
        strokeDashoffset={dashOffset}
        rotation="-90"
        originX="90"
        originY="90"
      />
    );
  });
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

function SummaryCard({ label, value }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#081120" },
  container: { padding: 16, gap: 16, backgroundColor: "#081120" },
  hero: { gap: 8 },
  kicker: {
    color: "#7dd3fc",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontSize: 12,
  },
  heroTitle: { color: "#f8fafc", fontSize: 24, fontWeight: "800" },
  heroSubtitle: { color: "#cbd5e1", lineHeight: 20 },
  summaryRow: { flexDirection: "row", gap: 12 },
  summaryCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  summaryLabel: { color: "#94a3b8", fontSize: 12, marginBottom: 4 },
  summaryValue: { color: "#f8fafc", fontSize: 18, fontWeight: "800" },
  section: {
    gap: 12,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  sectionTitle: { color: "#f8fafc", fontSize: 18, fontWeight: "700" },
  description: { color: "#cbd5e1", lineHeight: 20 },
  monthSummaryRow: {
    gap: 14,
  },
  donutWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  donutCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 120,
    height: 120,
  },
  donutLabel: { color: "#94a3b8", fontSize: 12, marginBottom: 4 },
  donutValue: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  monthMetrics: {
    gap: 10,
    paddingHorizontal: 4,
  },
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
  legendList: { gap: 10, marginTop: 4 },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  legendLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: "#e2e8f0", flexShrink: 1 },
  legendAmount: { color: "#f8fafc", fontWeight: "700" },
  emptyText: { color: "#94a3b8", paddingVertical: 6 },
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
  barValueWrap: {
    minHeight: 22,
    justifyContent: "flex-end",
  },
  barValue: {
    color: "#cbd5e1",
    fontSize: 9,
    textAlign: "center",
  },
  barTrack: {
    width: "100%",
    height: 180,
    justifyContent: "flex-end",
    borderRadius: 14,
    backgroundColor: "#111827",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: "#38bdf8",
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
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  yearMonth: { color: "#94a3b8", fontSize: 12, marginBottom: 4 },
  yearAmount: { color: "#f8fafc", fontWeight: "700" },
});

export { StatsScreen };
