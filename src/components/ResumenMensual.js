import React, { useMemo, useState } from "react";
import Svg, { Circle } from "react-native-svg";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { formatearMonto } from "../utils/formatearMonto";
import { categorias_gastos } from "../data/categoriasfinas";
import { getMonthYearFiltered } from "../utils/fechaActual";

function getCategoryInfo(category) {
  const categoryInfo = categorias_gastos.find(
    (item) => item.name.toLowerCase() === category,
  );

  if (categoryInfo) return categoryInfo;

  const parentCategory = categorias_gastos.find((item) =>
    item.subcategorias?.some(
      (subcategory) => subcategory.name.toLowerCase() === category,
    ),
  );
  const subcategoryInfo = parentCategory?.subcategorias?.find(
    (item) => item.name.toLowerCase() === category,
  );

  if (!subcategoryInfo) {
    // Para categorías personalizadas, retornar el icono de "Otros"
    return {
      icon: <Entypo name="wallet" size={20} color="white" />,
      color: "#2d4473",
    };
  }

  return {
    ...subcategoryInfo,
    icon: subcategoryInfo.icon ?? parentCategory.icon,
    color: subcategoryInfo.color ?? parentCategory.color,
  };
}

function getParentCategory(category) {
  return (
    categorias_gastos.find((item) => item.name.toLowerCase() === category) ||
    categorias_gastos.find((item) =>
      item.subcategorias?.some(
        (subcategory) => subcategory.name.toLowerCase() === category,
      ),
    )
  );
}

function formatCategoryName(category) {
  return category.length > 10 ? `${category.slice(0, 10)}...` : category;
}

function ResumenMensual({
  selectedMonthItems,
  totalIngresosMensual,
  filterMonth,
  filterYear,
}) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const totalGastosReales = useMemo(
    () =>
      selectedMonthItems
        .filter(
          (item) => item.tipo === "gasto" && item.categoria !== "Transferencia",
        )
        .reduce((total, item) => total + item.monto, 0),
    [selectedMonthItems],
  );

  const monthExpenseCategories = useMemo(() => {
    const expenses = selectedMonthItems.filter(
      (item) => item.tipo === "gasto" && item.categoria !== "Transferencia",
    );
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
        const catInfo = getCategoryInfo(category);
        const porcentajeSobreGastos =
          totalGastosReales > 0 ? (total / totalGastosReales) * 100 : 0;
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
  }, [selectedMonthItems, totalGastosReales, totalIngresosMensual]);

  const monthExpenseParentCategories = useMemo(() => {
    const totals = new Map();

    monthExpenseCategories.forEach((item) => {
      const parentCategory = getParentCategory(item.category.toLowerCase());
      const category = parentCategory?.name || item.category;
      const currentTotal = totals.get(category);

      totals.set(category, {
        category,
        total: (currentTotal?.total ?? 0) + item.total,
        color: parentCategory?.color || item.color,
      });
    });

    return Array.from(totals.values()).sort((a, b) => b.total - a.total);
  }, [monthExpenseCategories]);

  const handleDonutPress = (event) => {
    const { locationX, locationY } = event.nativeEvent;

    // El SVG es 250x250 píxeles pero tiene viewBox 0 0 180 180
    const scale = 180 / 280;
    const svgX = locationX * scale;
    const svgY = locationY * scale;

    // Centro del viewBox (90, 90)
    const centerX = 90;
    const centerY = 90;

    // Convertir a coordenadas relativas al centro
    const dx = svgX - centerX;
    const dy = svgY - centerY;

    // Calcular distancia desde el centro
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Verificar si está en el rango del donut (aproximadamente 50-74)
    if (distance < 50 || distance > 74) {
      return;
    }

    // Calcular ángulo en grados (0-360)
    // atan2 devuelve radianes de -PI a PI
    // Math.atan2(y, x) donde (0,1) es arriba, (1,0) es derecha
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    // Ajustar para que 0° esté en la parte superior (debido a rotation -90 en el círculo)
    angle = angle + 90;
    if (angle < 0) angle += 360;
    if (angle >= 360) angle -= 360;

    // Calcular posiciones de los segmentos
    let currentAngle = 0;

    for (let i = 0; i < monthExpenseParentCategories.length; i++) {
      const item = monthExpenseParentCategories[i];
      const portion = item.total / totalGastosReales;
      const segmentDegrees = portion * 360;

      const startAngle = currentAngle;
      const endAngle = currentAngle + segmentDegrees;

      // Verificar si el toque cae en este segmento
      if (angle >= startAngle && angle < endAngle) {
        const category = item.category;
        setSelectedCategory(selectedCategory === category ? null : category);
        return;
      }

      currentAngle = endAngle;
    }
  };

  return (
    <View style={styles.section}>
      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.sectionTitle}>Resumen mensual</Text>
          <Text style={styles.sectionDate}>
            {getMonthYearFiltered(filterMonth, filterYear)}
          </Text>
        </View>

        <Text style={styles.description}>
          {selectedMonthItems.length} movimientos
        </Text>
      </View>

      <View style={styles.monthSummaryRow}>
        <TouchableOpacity
          style={styles.donutWrap}
          onPress={handleDonutPress}
          activeOpacity={1}
        >
          <Svg width={280} height={280} viewBox="0 0 180 180">
            <Circle
              cx="90"
              cy="90"
              r="62"
              fill="transparent"
              stroke="#1e293b"
              strokeWidth="20"
            />
            <DonutSlices
              data={monthExpenseParentCategories}
              total={totalGastosReales}
              selectedCategory={selectedCategory}
            />
          </Svg>

          <View style={styles.donutCenter}>
            {selectedCategory ? (
              <>
                <Text style={styles.donutLabel}>{selectedCategory}</Text>
                <Text style={styles.donutValue}>
                  {formatearMonto(
                    monthExpenseParentCategories.find(
                      (item) => item.category === selectedCategory,
                    )?.total || 0,
                  )}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.donutLabel}>Gastos</Text>
                <Text style={styles.donutValue}>
                  {formatearMonto(totalGastosReales)}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.legendList}>
        <View style={styles.legendTitle}>
          <Text style={{ color: "#7dd3fc" }}>% Gastos / Ingresos</Text>
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

                <Text
                  style={styles.legendText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formatCategoryName(item.category)}
                </Text>
              </View>
              <Text style={[styles.legendAmount, styles.legendAmountColumn]}>
                {formatearMonto(item.total)}
              </Text>
              <Text style={[styles.negative, styles.legendPercentageColumn]}>
                {item.porcentajeSobreGastos.toFixed()}%
              </Text>
              <Text style={[styles.positive, styles.legendPercentageColumn]}>
                {item.porcentajeSobreIngresos.toFixed()}%
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function DonutSlices({ data, total, selectedCategory }) {
  if (total <= 0 || data.length === 0) {
    return null;
  }

  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return data.map((item) => {
    const dashLength = (item.total / total) * circumference;
    const dashOffset = circumference - accumulated;
    const isSelected = selectedCategory === item.category;
    const currentStrokeWidth = isSelected ? 28 : 20;
    accumulated += dashLength;

    return (
      <Circle
        key={item.category}
        cx="90"
        cy="90"
        r={radius}
        fill="transparent"
        stroke={item.color}
        strokeWidth={currentStrokeWidth}
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
    paddingBottom: 26,
    borderRadius: 12,
    backgroundColor: "rgb(20, 23, 28)",
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  sectionTitle: { color: "white", fontSize: 17, fontWeight: "500" },
  description: { color: "#cbd5e1", lineHeight: 20, marginTop: 5 },
  sectionDate: { color: "#cbd5e1", fontSize: 16, marginTop: 5 },
  monthSummaryRow: {
    gap: 14,
  },

  // Donut
  donutWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  donutCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 150,
  },
  donutLabel: { color: "#94a3b8", fontSize: 14, marginBottom: 4 },
  donutValue: {
    color: "white",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  legendList: { gap: 5, marginTop: 4 },
  legendTitle: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  emptyText: { color: "#94a3b8", paddingVertical: 6 },
  legendItem: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "rgb(32, 32, 38)",
  },
  legendLeft: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  legendText: {
    color: "#e2e2e2",
    flexShrink: 1,
    fontSize: 16,
  },
  legendAmount: { color: "#f8fafc", fontWeight: "500", fontSize: 15 },
  legendAmountColumn: { flex: 2, textAlign: "center" },
  legendPercentageColumn: {
    flex: 0.9,
    textAlign: "right",
  },
  positive: { color: "#34d399", fontSize: 14 },
  negative: { color: "#fb7185", fontSize: 14 },
});

export { ResumenMensual };
