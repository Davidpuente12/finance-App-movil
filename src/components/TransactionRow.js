import { Pressable, StyleSheet, Text, View } from "react-native";

function TransactionRow({ item, formatearMonto, onEdit, onDelete }) {
  return (
    <Pressable style={styles.transactionRow} onPress={onEdit}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>
          {item.descripcion || item.categoria}
        </Text>
        <Text style={styles.transactionSubtitle}>
          {item.categoria} · {item.fecha}
        </Text>
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
        <Pressable onPress={onDelete}>
          <Text style={styles.deleteText}>Eliminar</Text>
        </Pressable>
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
  transactionTitle: { color: "#f8fafc", fontSize: 16, fontWeight: "600" },
  transactionSubtitle: { color: "#94a3b8", fontSize: 12 },
  transactionActions: { alignItems: "flex-end", gap: 6 },
  transactionAmount: { fontWeight: "700" },
  amountPositive: { color: "#34d399" },
  amountNegative: { color: "#fb7185" },
  deleteText: { color: "#fda4af", fontSize: 12 },
});

export { TransactionRow };
