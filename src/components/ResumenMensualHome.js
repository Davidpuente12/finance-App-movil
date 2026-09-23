import React, { useMemo, useState } from "react";
import Svg, { Circle } from "react-native-svg";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
import { formatearMonto } from "../utils/formatearMonto";
import { categorias_gastos } from "../data/categoriasfinas";
import { getMonthYearFiltered } from "../utils/fechaActual";
import { useTheme } from "../theme/ThemeContext";

function getCategoryInfo(category, parentCategoryName) {
  const parentCategory = getParentCategory(category, parentCategoryName);
  const subcategoryInfo = parentCategory?.subcategorias?.find(
    (item) => item.name.toLowerCase() === category,
  );

  if (subcategoryInfo) {
    return {
      ...subcategoryInfo,
      icon: subcategoryInfo.icon ?? parentCategory.icon,
      color: subcategoryInfo.color ?? parentCategory.color,
    };
  }

  const categoryInfo = categorias_gastos.find(
    (item) => item.name.toLowerCase() === category,
  );

  if (categoryInfo) return categoryInfo;

  if (!subcategoryInfo) {
    return {
      icon: <Entypo name="wallet" size={20} color="white" />,
      color: "#2d4473",
    };
  }
}

function getParentCategory(category, parentCategoryName) {
  const explicitParentCategory = parentCategoryName
    ? categorias_gastos.find(
        (item) => item.name.toLowerCase() === parentCategoryName.toLowerCase(),
      )
    : null;

  if (explicitParentCategory) return explicitParentCategory;

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
  return category.length > 14 ? `${category.slice(0, 14)}...` : category;
}

function ResumenMensualHome({
  selectedMonthItems,
  totalIngresosMensual,
  filterMonth,
  filterYear,
  selectedAccount,
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAllLegendItems, setShowAllLegendItems] = useState(false);
  const [expandedSubcategoryKeys, setExpandedSubcategoryKeys] = useState([]);

  const monthExpenseItems = useMemo(
    () =>
      selectedMonthItems.filter(
        (item) => item.tipo === "gasto" && item.categoria !== "Transferencia",
      ),
    [selectedMonthItems],
  );

  const totalGastosReales = useMemo(
    () => monthExpenseItems.reduce((total, item) => total + item.monto, 0),
    [monthExpenseItems],
  );

  const monthExpenseCategories = useMemo(() => {
    const totals = new Map();

    monthExpenseItems.forEach((item) => {
      const category = item.categoria.trim();
      const parentCategory = getParentCategory(
        category.toLowerCase(),
        item.categoria_padre,
      );
      const categoryInfo = getCategoryInfo(
        category.toLowerCase(),
        item.categoria_padre,
      );
      const parentCategoryName = parentCategory?.name || category;
      const categoryKey = `${parentCategoryName.toLowerCase()}:${category.toLowerCase()}`;
      const currentCategory = totals.get(categoryKey);

      totals.set(categoryKey, {
        key: categoryKey,
        category: categoryInfo.name || category,
        parentCategory: parentCategoryName,
        total: (currentCategory?.total ?? 0) + item.monto,
        color: categoryInfo.color || "#6b7280",
        icon: categoryInfo.icon || null,
      });
    });

    return Array.from(totals.entries())
      .map(([, item]) => {
        const porcentajeSobreGastos =
          totalGastosReales > 0 ? (item.total / totalGastosReales) * 100 : 0;
        const porcentajeSobreIngresos =
          totalIngresosMensual > 0
            ? (item.total / totalIngresosMensual) * 100
            : 0;

        return {
          ...item,
          displayName:
            item.parentCategory === item.category
              ? item.category
              : `${item.parentCategory} · ${item.category}`,
          porcentajeSobreGastos,
          porcentajeSobreIngresos,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [monthExpenseItems, totalGastosReales, totalIngresosMensual]);

  const monthExpenseParentCategories = useMemo(() => {
    const totals = new Map();

    monthExpenseCategories.forEach((item) => {
      const category = item.parentCategory || item.category;
      const currentTotal = totals.get(category);
      const categoryInfo = getCategoryInfo(category.toLowerCase());

      totals.set(category, {
        category,
        total: (currentTotal?.total ?? 0) + item.total,
        color: currentTotal?.color || categoryInfo.color || item.color,
        icon: currentTotal?.icon || categoryInfo.icon || item.icon,
      });
    });

    return Array.from(totals.values())
      .map((item) => ({
        ...item,
        porcentajeSobreIngresos:
          totalIngresosMensual > 0
            ? (item.total / totalIngresosMensual) * 100
            : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [monthExpenseCategories, totalIngresosMensual]);

  const selectedCategoryExpenses = useMemo(() => {
    if (!selectedCategory) return [];

    return selectedMonthItems.filter((item) => {
      if (item.tipo !== "gasto" || item.categoria === "Transferencia") {
        return false;
      }

      const parentCategory = getParentCategory(
        item.categoria.trim().toLowerCase(),
        item.categoria_padre,
      );
      const category = parentCategory?.name || item.categoria;

      return category === selectedCategory;
    });
  }, [selectedCategory, selectedMonthItems]);

  const selectedCategorySubcategories = useMemo(() => {
    const totals = new Map();

    selectedCategoryExpenses.forEach((item) => {
      const category = item.categoria.trim();
      const key = category.toLowerCase();
      const categoryInfo = getCategoryInfo(key, item.categoria_padre);
      const currentCategory = totals.get(key);

      totals.set(key, {
        key,
        category,
        total: (currentCategory?.total ?? 0) + item.monto,
        color: categoryInfo.color || "#6b7280",
        icon: categoryInfo.icon || null,
      });
    });

    return Array.from(totals.values())
      .map((item) => ({
        ...item,
        porcentajeSobreIngresos:
          totalIngresosMensual > 0
            ? (item.total / totalIngresosMensual) * 100
            : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [selectedCategoryExpenses, totalIngresosMensual]);

  const toggleSubcategory = (subcategoryKey) => {
    setExpandedSubcategoryKeys((currentKeys) =>
      currentKeys.includes(subcategoryKey)
        ? currentKeys.filter((key) => key !== subcategoryKey)
        : [...currentKeys, subcategoryKey],
    );
  };

  const handleDonutPress = (event) => {
    const { locationX, locationY } = event.nativeEvent;

    const scale = 180 / 280;
    const svgX = locationX * scale;
    const svgY = locationY * scale;

    const centerX = 90;
    const centerY = 90;

    const dx = svgX - centerX;
    const dy = svgY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 50 || distance > 74) {
      return;
    }

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);

    angle = angle + 90;
    if (angle < 0) angle += 360;
    if (angle >= 360) angle -= 360;

    let currentAngle = 0;

    for (let i = 0; i < monthExpenseParentCategories.length; i++) {
      const item = monthExpenseParentCategories[i];
      const portion = item.total / totalGastosReales;
      const segmentDegrees = portion * 360;

      const startAngle = currentAngle;
      const endAngle = currentAngle + segmentDegrees;

      if (angle >= startAngle && angle < endAngle) {
        const category = item.category;
        setSelectedCategory(selectedCategory === category ? null : category);
        setShowAllLegendItems(false);
        setExpandedSubcategoryKeys([]);
        return;
      }

      currentAngle = endAngle;
    }
  };

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.sectionTitle}>Resumen mensual de gastos</Text>
          <Text style={styles.sectionDate}>
            {getMonthYearFiltered(filterMonth, filterYear)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.headerDescription}>
            {monthExpenseItems.length} movimientos
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

      {/* Leyenda */}
      <View style={styles.detailsList}>
        {/* <View style={styles.legendTitle}>
          <Text style={{ color: colors.accentLight }}>% sobre Ingresos</Text>
        </View> */}
        {monthExpenseParentCategories.length === 0 ? (
          <Text style={styles.emptyText}>
            No hay gastos en el mes seleccionado.
          </Text>
        ) : selectedCategory ? (
          selectedCategorySubcategories
            .slice(0, showAllLegendItems ? undefined : 5)
            .map((subcategory) => {
              const isExpanded = expandedSubcategoryKeys.includes(
                subcategory.key,
              );
              const subcategoryExpenses = selectedCategoryExpenses.filter(
                (item) =>
                  item.categoria.trim().toLowerCase() === subcategory.key,
              );

              return (
                <View key={subcategory.key}>
                  <View style={styles.detailsItem}>
                    <View style={styles.legendLeft}>
                      <View
                        style={[
                          styles.detailsIcon,
                          { backgroundColor: subcategory.color },
                        ]}
                      >
                        {subcategory.icon}
                      </View>
                      <Text
                        style={styles.detailsText}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {formatCategoryName(subcategory.category)}
                      </Text>
                    </View>
                    <View style={styles.legendRight}>
                      <Text
                        style={[styles.legendAmount, styles.legendAmountColumn]}
                      >
                        {formatearMonto(subcategory.total)}
                      </Text>
                      <Text style={styles.legendPercentageColumn}>
                        {subcategory.porcentajeSobreIngresos.toFixed()}%
                      </Text>
                      <TouchableOpacity
                        accessibilityLabel={`${isExpanded ? "Ocultar" : "Ver"} movimientos de ${subcategory.category}`}
                        onPress={() => toggleSubcategory(subcategory.key)}
                        style={styles.subcategoryToggle}
                      >
                        <Entypo
                          name={
                            isExpanded
                              ? "chevron-small-up"
                              : "chevron-small-down"
                          }
                          size={26}
                          color={colors.primaryText}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedSection}>
                      {subcategoryExpenses.map((item, index) => {
                        const categoryInfo = getCategoryInfo(
                          item.categoria.trim().toLowerCase(),
                          item.categoria_padre,
                        );

                        return (
                          <View
                            key={
                              item.id ??
                              `${item.fecha}-${item.categoria}-${index}`
                            }
                            style={styles.detailsItem}
                          >
                            <View style={styles.legendLeft}>
                              {categoryInfo.icon &&
                                React.cloneElement(categoryInfo.icon, {
                                  color: categoryInfo.color,
                                })}
                              <View style={styles.legendMovementInfo}>
                                <Text
                                  style={[styles.detailsText, { fontSize: 14 }]}
                                  numberOfLines={1}
                                  ellipsizeMode="tail"
                                >
                                  {item.categoria}
                                </Text>
                                {item.descripcion && (
                                  <Text
                                    style={[
                                      styles.legendMovementDetail,
                                      { fontSize: 11 },
                                    ]}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                  >
                                    {item.descripcion}
                                  </Text>
                                )}
                              </View>
                            </View>
                            <View style={styles.legendRightExpanded}>
                              <Text
                                style={[styles.legendAmount, { fontSize: 14 }]}
                              >
                                {formatearMonto(item.monto)}
                              </Text>
                              <Text
                                style={[
                                  styles.legendMovementDetail,
                                  { fontSize: 11 },
                                ]}
                              >
                                {item.fecha}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })
        ) : (
          monthExpenseParentCategories
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
                  <Text
                    style={styles.detailsText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {formatCategoryName(item.category)}
                  </Text>
                </View>

                <View style={styles.legendRight}>
                  <Text
                    style={[styles.legendAmount, styles.legendAmountColumn]}
                  >
                    {formatearMonto(item.total)}
                  </Text>
                  <Text style={styles.legendPercentageColumn}>
                    {item.porcentajeSobreIngresos.toFixed()}%
                  </Text>
                </View>
              </View>
            ))
        )}
        {(selectedCategory
          ? selectedCategorySubcategories
          : monthExpenseParentCategories
        ).length > 5 &&
          !showAllLegendItems && (
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
    const currentStrokeWidth = isSelected ? 25 : 20;
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

function createStyles(colors) {
  return StyleSheet.create({
    section: {
      margin: 5,
      gap: 12,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    sectionHeader: {
      gap: 5,
    },
    sectionTitle: { color: colors.text, fontSize: 17, fontWeight: "500" },
    headerDescription: {
      color: colors.textSecondary,
      lineHeight: 20,
    },
    sectionDate: { color: colors.textSecondary, fontSize: 16, marginTop: 5 },
    accountFilterText: { fontSize: 14, fontWeight: "500" },

    // Donut
    donutWrap: {
      alignItems: "center",
      justifyContent: "center",
    },
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

    // Leyenda Detallada
    detailsList: { minHeight: 350, gap: 5, marginTop: 4, paddingBottom: 20 },
    legendTitle: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 10,
    },
    detailsItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
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
    subcategoryToggle: {
      alignItems: "center",
      justifyContent: "center",
      width: 26,
      height: 26,
    },
    expandedSection: {
      backgroundColor: colors.surfaceElevated,
      paddingHorizontal: 16,
      marginBottom: 20,
      borderRadius: 10,
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
    legendAmount: { color: colors.negative, fontWeight: "500", fontSize: 15 },
    legendAmountColumn: {
      flex: 2,
      textAlign: "right",
    },
    legendPercentageColumn: {
      flex: 0.8,
      color: colors.text,
      backgroundColor: "#00b03eb3",
      borderWidth: 1,
      borderColor: colors.positive,
      borderRadius: 5,
      fontSize: 13,
      fontWeight: "500",
      textAlign: "center",
    },
    showAllLegendButton: { alignSelf: "flex-end", marginTop: 15 },
    showAllLegendButtonText: {
      color: colors.primaryText,
      fontSize: 15,
      fontWeight: "600",
    },
    negative: { color: colors.negative, fontSize: 14 },
    neutral: { color: colors.accentLight, fontSize: 14 },

    emptyText: { color: colors.textMuted, paddingVertical: 6 },

    // Footer
    sectionFooter: {
      borderTopWidth: 1,
      borderColor: colors.border,
      paddingTop: 15,
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    sectionFooterText: {
      color: colors.primaryText,
      fontSize: 15,
      fontWeight: "600",
    },
  });
}

export { ResumenMensualHome };
