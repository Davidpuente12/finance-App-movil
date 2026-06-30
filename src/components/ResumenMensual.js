import React, { useMemo } from "react";
import Svg, { Circle } from "react-native-svg";
import { StyleSheet, Text, View } from "react-native";
import { formatearMonto } from "../utils/formatearMonto";
import { categorias_gastos } from "../data/categoriasfinas";

function ResumenMensual({
  selectedMonthItems,
  totalIngresosMensual,
  totalGastosMensual,
}) {
  const monthExpenseCategories = useMemo(() => {
    const expenses = selectedMonthItems.filter((item) => item.tipo === "gasto");
    const totals = new Map();

    expenses.forEach((item) => {
      const categoriaNormalizada = item.categoria.trim().toLowerCase();
      totals.set(
        categoriaNormalizada,
        (totals.get(categoriaNormalizada) ?? 0) + item.monto,
      );
    });

    return Array.from(totals.entries())
      .map(([category, total]) => {
        const catInfo = categorias_gastos.find(
          (c) => c.name.toLowerCase() === category,
        );
        const porcentajeSobreGastos =
          totalGastosMensual > 0 ? (total / totalGastosMensual) * 100 : 0;
        const porcentajeSobreIngresos =
          totalIngresosMensual > 0 ? (total / totalIngresosMensual) * 100 : 0;

        return {
          category: catInfo?.name || category,
          total,
          color: catInfo?.color || "#6b7280",
          icon: catInfo?.icon || null,
          porcentajeSobreGastos,
          porcentajeSobreIngresos,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [selectedMonthItems, totalGastosMensual]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Resumen mensual</Text>
      <Text style={styles.description}>
        {selectedMonthItems.length} movimientos en el mes seleccionado.
      </Text>

      <View style={styles.monthSummaryRow}>
        <View style={styles.donutWrap}>
          <Svg width={250} height={250} viewBox="0 0 180 180">
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
              total={totalGastosMensual}
            />
          </Svg>

          <View style={styles.donutCenter}>
            <Text style={styles.donutLabel}>Gastos</Text>
            <Text style={styles.donutValue}>
              {formatearMonto(totalGastosMensual)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.legendList}>
        <View style={styles.legendTitle}>
          <Text style={styles.neutral}>% sobre gasto / ingreso</Text>
        </View>
        {monthExpenseCategories.length === 0 ? (
          <Text style={styles.emptyText}>
            No hay gastos en el mes seleccionado.
          </Text>
        ) : (
          monthExpenseCategories.map((item) => (
            <View key={item.category} style={styles.legendItem}>
              <View style={styles.legendLeft}>
                {item.icon &&
                  React.cloneElement(item.icon, { color: item.color })}

                <Text style={styles.legendText}>{item.category}</Text>
              </View>
              <View style={styles.legendLeft}>
                <Text style={styles.legendAmount}>
                  {formatearMonto(item.total)}
                </Text>
                <Text style={styles.negative}>
                  {item.porcentajeSobreGastos.toFixed()}%
                </Text>
                <Text style={styles.positive}>
                  {item.porcentajeSobreIngresos.toFixed()}%
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
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

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 10,
    gap: 12,
    padding: 16,
    borderRadius: 24,
    backgroundColor: "rgb(20, 23, 28)",
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
  donutLabel: { color: "#94a3b8", fontSize: 13, marginBottom: 4 },
  donutValue: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  legendList: { gap: 5, marginTop: 4 },
  legendTitle: { flexDirection: "row", justifyContent: "flex-end" },
  emptyText: { color: "#94a3b8", paddingVertical: 6 },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
  },
  legendLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  legendText: { color: "white", flexShrink: 1, fontSize: 17 },
  legendAmount: { color: "#f8fafc", fontWeight: "700", fontSize: 15 },
  positive: { color: "#34d399", fontSize: 15 },
  negative: { color: "#fb7185", fontSize: 15 },
  neutral: { color: "#7dd3fc" },
});

export { ResumenMensual };
