import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatearMonto } from "../utils/formatearMonto";
import {
  categorias_gastos,
  categorias_ingresos,
} from "../data/categoriasfinas.js";
import Entypo from "@expo/vector-icons/Entypo";
import { useTheme } from "../theme/ThemeContext";

const getCategoryIcon = (categoria, tipo, styles, colors) => {
  if (!categoria) {
    return (
      <View style={[styles.categoryIcon, { backgroundColor: "transparent" }]}>
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

  // Buscar categoría de primer nivel
  const topCat = lista.find(
    (c) => c.name.toLowerCase() === categoria.toLowerCase(),
  );
  if (topCat) {
    return (
      <View
        style={[
          styles.categoryIcon,
          { backgroundColor: topCat.color || "transparent" },
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
              { backgroundColor: color || "transparent" },
            ]}
          >
            {icon}
          </View>
        );
      }
    }
  }

  return (
    <View style={[styles.categoryIcon, { backgroundColor: "transparent" }]}>
      <Entypo name="wallet" size={20} color={colors.text} />
    </View>
  );
};

function TransactionRow({ item, cuentas, onEdit }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const accountName = cuentas?.find(
    (cuenta) => cuenta.id === item.cuenta_id,
  )?.nombre;

  return (
    <Pressable style={styles.transactionRow} onPress={onEdit}>
      {getCategoryIcon(item.categoria, item.tipo, styles, colors)}
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{item.categoria}</Text>
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
  transactionTitle: { color: colors.textStrong, fontSize: 16, fontWeight: "600" },
  accountName: { color: colors.textSecondary, fontSize: 13, fontWeight: "600" },
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
