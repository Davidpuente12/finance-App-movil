import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatearMonto } from "../utils/formatearMonto";
import {
  categorias_gastos,
  categorias_ingresos,
} from "../data/categoriasfinas.js";
import Entypo from "@expo/vector-icons/Entypo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../theme/ThemeContext";

const getCategoryIcon = (categoria, categoriaPadre, tipo, styles, colors) => {
  if (categoria === "Transferencia") {
    return (
      <View style={[styles.categoryIcon, { backgroundColor: colors.primary }]}>
        <Ionicons name="swap-horizontal" size={22} color="white" />
      </View>
    );
  }

  if (!categoria) {
    return (
      <View style={[styles.categoryIcon, { backgroundColor: "#2d4473" }]}>
        <Entypo name="wallet" size={20} color={colors.text} />
      </View>
    );
  }

  const lista =
    tipo === "gasto"
      ? categorias_gastos
      : tipo === "ingreso"
        ? categorias_ingresos
        : [];

  const parentCategory = categoriaPadre
    ? lista.find(
        (category) =>
          category.name.toLowerCase() === categoriaPadre.toLowerCase(),
      )
    : null;
  const parentSubcategory = parentCategory?.subcategorias?.find(
    (subcategory) => subcategory.name.toLowerCase() === categoria.toLowerCase(),
  );

  if (parentSubcategory) {
    return (
      <View
        style={[
          styles.categoryIcon,
          {
            backgroundColor:
              parentSubcategory.color || parentCategory.color || "#2d4473",
          },
        ]}
      >
        {parentSubcategory.icon || parentCategory.icon}
      </View>
    );
  }

  // Buscar categoría de primer nivel
  const topCat = lista.find(
    (c) => c.name.toLowerCase() === categoria.toLowerCase(),
  );
  if (topCat) {
    return (
      <View
        style={[
          styles.categoryIcon,
          { backgroundColor: topCat.color || "#2d4473" },
        ]}
      >
        {topCat.icon}
      </View>
    );
  }

  // Buscar en subcategorías y usar el icono/color de la subcategoría si existe,
  // o el del padre si no
  for (const parent of lista) {
    if (parent.subcategorias) {
      const sub = parent.subcategorias.find(
        (s) => s.name.toLowerCase() === categoria.toLowerCase(),
      );
      if (sub) {
        const icon = sub.icon || parent.icon;
        const color = sub.color || parent.color;
        return (
          <View
            style={[
              styles.categoryIcon,
              { backgroundColor: color || "#2d4473" },
            ]}
          >
            {icon}
          </View>
        );
      }
    }
  }

  return (
    <View style={[styles.categoryIcon, { backgroundColor: "#2d4473" }]}>
      <Entypo name="wallet" size={20} color={colors.text} />
    </View>
  );
};

const getCategoryLabel = (categoria, categoriaPadre, tipo) => {
  if (!categoria || !categoriaPadre) return categoria;

  const lista = tipo === "gasto" ? categorias_gastos : categorias_ingresos;
  const normalizedCategory = categoria.toLowerCase();
  const matches = lista.reduce(
    (total, category) =>
      total +
      Number(category.name.toLowerCase() === normalizedCategory) +
      Number(
        category.subcategorias?.some(
          (subcategory) =>
            subcategory.name.toLowerCase() === normalizedCategory,
        ),
      ),
    0,
  );

  return matches > 1 ? `${categoriaPadre} · ${categoria}` : categoria;
};

function TransactionRow({ item, cuentas, onEdit }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const accountName = cuentas?.find(
    (cuenta) => cuenta.id === item.cuenta_id,
  )?.nombre;
  const categoryLabel = getCategoryLabel(
    item.categoria,
    item.categoria_padre,
    item.tipo,
  );

  return (
    <Pressable style={styles.transactionRow} onPress={onEdit}>
      {getCategoryIcon(
        item.categoria,
        item.categoria_padre,
        item.tipo,
        styles,
        colors,
      )}
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{categoryLabel}</Text>
        {accountName ? (
          <Text style={styles.accountName}>{accountName}</Text>
        ) : null}
        {item.descripcion ? (
          <Text style={styles.transactionSubtitle}>{item.descripcion}</Text>
        ) : null}
      </View>
      <View style={styles.transactionActions}>
        <Text
          style={[
            styles.transactionAmount,
            item.tipo === "ingreso"
              ? styles.amountPositive
              : styles.amountNegative,
          ]}
        >
          {formatearMonto(item.monto)}
        </Text>
        <Text style={styles.transactionSubtitle}>{item.fecha}</Text>
      </View>
    </Pressable>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    transactionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    transactionInfo: { flex: 1, gap: 4 },
    transactionTitle: {
      color: colors.textStrong,
      fontSize: 16,
      fontWeight: "600",
    },
    accountName: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    transactionSubtitle: { color: colors.textMuted, fontSize: 13 },
    transactionActions: { alignItems: "flex-end", gap: 6 },
    transactionAmount: { fontWeight: "600", fontSize: 16 },
    amountPositive: { color: colors.positive },
    amountNegative: { color: colors.negative },
    categoryIcon: {
      width: 42,
      height: 42,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}

export { TransactionRow };
