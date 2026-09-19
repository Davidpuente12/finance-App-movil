import React, { useMemo, useState } from "react";
import Svg, { Circle } from "react-native-svg";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { formatearMonto } from "../utils/formatearMonto";
import { categorias_ingresos } from "../data/categoriasfinas";
import { getMonthYearFiltered } from "../utils/fechaActual";
import { useTheme } from "../theme/ThemeContext";

function getCategoryInfo(category) {
  return (
    categorias_ingresos.find(
      (item) => item.name.toLowerCase() === category,
    ) ?? {
      icon: <Entypo name="wallet" size={20} color="white" />,
      color: "#2d4473",
    }
  );
}

function formatCategoryName(category) {
  return category.length > 14 ? `${category.slice(0, 14)}...` : category;
}

function ResumenMensualIngresos({
  selectedMonthItems,
  filterMonth,
  filterYear,
  selectedAccount,
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAllLegendItems, setShowAllLegendItems] = useState(false);

  const monthIncomeItems = useMemo(
    () =>
      selectedMonthItems.filter(
        (item) => item.tipo === "ingreso" && item.categoria !== "Transferencia",
      ),
    [selectedMonthItems],
  );

  const totalIngresosReales = useMemo(
    () => monthIncomeItems.reduce((total, item) => total + item.monto, 0),
    [monthIncomeItems],
  );

  const monthIncomeCategories = useMemo(() => {
    const totals = new Map();

    monthIncomeItems.forEach((item) => {
      const category = item.categoria.trim().toLowerCase();
      totals.set(category, (totals.get(category) ?? 0) + item.monto);
    });

    return Array.from(totals.entries())
      .map(([category, total]) => {
        const categoryInfo = getCategoryInfo(category);

        return {
          category: categoryInfo.name || category,
          total,
          color: categoryInfo.color || "#6b7280",
          icon: categoryInfo.icon || null,
          percentage:
            totalIngresosReales > 0 ? (total / totalIngresosReales) * 100 : 0,
        };
      })
      .sort((firstItem, secondItem) => secondItem.total - firstItem.total);
  }, [monthIncomeItems, totalIngresosReales]);

  const selectedCategoryIncomes = useMemo(
    () =>
      selectedCategory
        ? selectedMonthItems.filter(
            (item) =>
              item.tipo === "ingreso" &&
              item.categoria !== "Transferencia" &&
              (getCategoryInfo(item.categoria.trim().toLowerCase()).name ||
                item.categoria) === selectedCategory,
          )
        : [],
    [selectedCategory, selectedMonthItems],
  );

  const handleDonutPress = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    const scale = 180 / 280;
    const dx = locationX * scale - 90;
    const dy = locationY * scale - 90;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 50 || distance > 74) return;

    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    let currentAngle = 0;

    for (const item of monthIncomeCategories) {
      const segmentDegrees = (item.total / totalIngresosReales) * 360;

      if (angle >= currentAngle && angle < currentAngle + segmentDegrees) {
        setSelectedCategory(
          selectedCategory === item.category ? null : item.category,
        );
        setShowAllLegendItems(false);
        return;
      }

      currentAngle += segmentDegrees;
    }
  };

  const legendItems = selectedCategory
    ? selectedCategoryIncomes
    : monthIncomeCategories;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Resumen mensual de ingresos</Text>
          <Text style={styles.sectionDate}>
            {getMonthYearFiltered(filterMonth, filterYear)}
          </Text>
        </View>
        <View style={styles.headerRow}>
          <Text style={styles.headerDescription}>
            {monthIncomeItems.length} movimientos
          </Text>
          {selectedAccount && (
            <Text
              style={[
                styles.accountFilterText,
                { color: selectedAccount.color },
              ]}
            >
              {selectedAccount.nombre}
            </Text>
          )}
        </View>
      </View>

      {/* Donut */}
      <View style={styles.donutWrap}>
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
              stroke={colors.border}
              strokeWidth="20"
            />
            <DonutSlices
              data={monthIncomeCategories}
              total={totalIngresosReales}
              selectedCategory={selectedCategory}
            />
          </Svg>
          <View style={styles.donutCenter}>
            <Text style={styles.donutLabel}>
              {selectedCategory || "Ingresos"}
            </Text>
            <Text style={styles.donutValue}>
              {formatearMonto(
                selectedCategory
                  ? monthIncomeCategories.find(
                      (item) => item.category === selectedCategory,
                    )?.total || 0
                  : totalIngresosReales,
              )}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Leyenda */}
      <View style={styles.detailsList}>
        {monthIncomeCategories.length === 0 ? (
          <Text style={styles.emptyText}>
            No hay ingresos en el mes seleccionado.
          </Text>
        ) : selectedCategory ? (
          legendItems
            .slice(0, showAllLegendItems ? undefined : 5)
            .map((item, index) => {
              const categoryInfo = getCategoryInfo(
                item.categoria.trim().toLowerCase(),
              );

              return (
                <View
                  key={item.id ?? `${item.fecha}-${item.categoria}-${index}`}
                  style={styles.detailsItem}
                >
                  <View style={styles.legendLeft}>
                    {categoryInfo.icon &&
                      React.cloneElement(categoryInfo.icon, {
                        color: categoryInfo.color,
                      })}
                    <View style={styles.legendMovementInfo}>
                      <Text style={styles.detailsText} numberOfLines={1}>
                        {item.categoria}
                      </Text>
                      {item.descripcion && (
                        <Text
                          style={styles.legendMovementDetail}
                          numberOfLines={1}
                        >
                          {item.descripcion}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.legendRightExpanded}>
                    <Text style={styles.legendAmountColumn}>
                      {formatearMonto(item.monto)}
                    </Text>
                    <Text style={styles.legendMovementDetail}>
                      {item.fecha}
                    </Text>
                  </View>
                </View>
              );
            })
        ) : (
          legendItems
            .slice(0, showAllLegendItems ? undefined : 5)
            .map((item) => (
              <View key={item.category} style={styles.detailsItem}>
                <View style={styles.legendLeft}>
                  <View
                    style={[
                      styles.detailsIcon,
                      { backgroundColor: item.color },
                    ]}
                  >
                    {item.icon}
                  </View>
                  <Text style={styles.detailsText} numberOfLines={1}>
                    {formatCategoryName(item.category)}
                  </Text>
                </View>

                <View style={styles.legendRight}>
                  <Text style={styles.legendAmountColumn}>
                    {formatearMonto(item.total)}
                  </Text>
                  <Text style={styles.legendPercentageColumn}>
                    {item.percentage.toFixed()}%
                  </Text>
                </View>
              </View>
            ))
        )}
        {legendItems.length > 5 && !showAllLegendItems && (
          <TouchableOpacity
            accessibilityLabel="Ver todos los elementos de la leyenda"
            onPress={() => setShowAllLegendItems(true)}
            style={styles.showAllLegendButton}
          >
            <Text style={styles.showAllLegendButtonText}>Ver todos</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function DonutSlices({ data, total, selectedCategory }) {
  if (total <= 0 || data.length === 0) return null;

  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return data.map((item) => {
    const dashLength = (item.total / total) * circumference;
    const dashOffset = circumference - accumulated;
    const isSelected = selectedCategory === item.category;
    accumulated += dashLength;

    return (
      <Circle
        key={item.category}
        cx="90"
        cy="90"
        r={radius}
        fill="transparent"
        stroke={item.color}
        strokeWidth={isSelected ? 25 : 20}
        strokeDasharray={`${dashLength} ${circumference - dashLength}`}
        strokeDashoffset={dashOffset}
        rotation="-90"
        originX="90"
        originY="90"
      />
    );
  });
}

function createStyles(colors) {
  return StyleSheet.create({
    section: {
      marginHorizontal: 5,
      gap: 12,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    sectionHeader: { gap: 5 },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "500" },
    headerDescription: { color: colors.textSecondary, lineHeight: 20 },
    sectionDate: { color: colors.textSecondary, fontSize: 16, marginTop: 5 },
    accountFilterText: { fontSize: 14, fontWeight: "500" },
    donutWrap: { alignItems: "center", justifyContent: "center" },
    donutCenter: {
      position: "absolute",
      alignItems: "center",
      justifyContent: "center",
      width: 150,
      height: 150,
    },
    donutLabel: { color: colors.textMuted, fontSize: 14, marginBottom: 4 },
    donutValue: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "600",
      textAlign: "center",
    },
    detailsList: { minHeight: 350, gap: 5, marginTop: 4, paddingBottom: 20 },
    detailsItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 13,
      borderBottomWidth: 1,
      borderColor: colors.background,
    },
    legendLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
    },
    legendRight: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
    },
    legendRightExpanded: {
      alignItems: "center",
    },
    detailsText: {
      color: colors.text,
      flexShrink: 1,
      fontSize: 16,
      fontWeight: "500",
    },
    detailsIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    legendMovementInfo: { flex: 1, gap: 2 },
    legendMovementDetail: { color: colors.textMuted, fontSize: 12 },
    legendAmountColumn: {
      flex: 2,
      color: colors.positive,
      fontWeight: "500",
      fontSize: 15,
      textAlign: "right",
    },
    legendPercentageColumn: {
      flex: 0.8,
      color: colors.text,
      backgroundColor: colors.primarySelected,
      textAlign: "center",
      borderRadius: 5,
      fontSize: 13,
      fontWeight: "500",
    },
    showAllLegendButton: { alignSelf: "flex-end", marginTop: 15 },
    showAllLegendButtonText: {
      color: colors.primaryText,
      fontSize: 15,
      fontWeight: "600",
    },
    emptyText: { color: colors.textMuted, paddingVertical: 6 },
  });
}

export { ResumenMensualIngresos };
