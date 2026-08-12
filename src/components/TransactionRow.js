import { Pressable, StyleSheet, Text, View } from "react-native";
import { formatearMonto } from "../utils/formatearMonto";
import {
  categorias_gastos,
  categorias_ingresos,
} from "../data/categoriasfinas.js";
import Entypo from "@expo/vector-icons/Entypo";

const getCategoryIcon = (categoria, tipo) => {
  let cat;

  if (categoria) {
    const lista =
      tipo === "gasto"
        ? categorias_gastos
        : tipo === "ingreso"
          ? categorias_ingresos
          : [];
    cat = lista.find((c) => c.name.toLowerCase() === categoria.toLowerCase());
  }

  return (
    <View
      style={[
        styles.categoryIcon,
        { backgroundColor: cat?.color || "transparent" },
      ]}
    >
      {cat ? cat.icon : <Entypo name="wallet" size={20} color="white" />}
    </View>
  );
};

function TransactionRow({ item, onEdit }) {
  return (
    <Pressable style={styles.transactionRow} onPress={onEdit}>
      {getCategoryIcon(item.categoria, item.tipo)}
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>
          {item.descripcion || item.categoria}
        </Text>
        <Text style={styles.transactionSubtitle}>{item.categoria}</Text>
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

const styles = StyleSheet.create({
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  transactionInfo: { flex: 1, gap: 4 },
  transactionTitle: { color: "#f8fafc", fontSize: 17, fontWeight: "600" },
  transactionSubtitle: { color: "#94a3b8", fontSize: 13 },
  transactionActions: { alignItems: "flex-end", gap: 6 },
  transactionAmount: { fontWeight: "700", fontSize: 16 },
  amountPositive: { color: "#34d399" },
  amountNegative: { color: "#fb7185" },
  categoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export { TransactionRow };
