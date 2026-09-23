import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TransactionRow } from "../components/TransactionRow";
import { useTheme } from "../theme/ThemeContext";
import { formatearMonto } from "../utils/formatearMonto";

function findTransferPair(transaction, transactions, cuentas) {
  const isOrigin = transaction.tipo === "gasto";
  const account = cuentas.find((cuenta) => cuenta.id === transaction.cuenta_id);
  const pairedDescription = account
    ? isOrigin
      ? `Transferencia desde ${account.nombre}`
      : `Transferencia a ${account.nombre}`
    : null;

  return transactions
    .filter(
      (current) =>
        current.id !== transaction.id &&
        current.categoria === "Transferencia" &&
        current.tipo === (isOrigin ? "ingreso" : "gasto") &&
        Number(current.monto) === Number(transaction.monto) &&
        current.fecha === transaction.fecha &&
        current.descripcion === pairedDescription,
    )
    .sort(
      (first, second) =>
        Math.abs(Number(first.id) - Number(transaction.id)) -
        Math.abs(Number(second.id) - Number(transaction.id)),
    )[0];
}

function TransferRow({ origin, destination, cuentas, onEdit }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const originAccount = cuentas.find(
    (cuenta) => cuenta.id === origin.cuenta_id,
  );
  const destinationAccount = cuentas.find(
    (cuenta) => cuenta.id === destination.cuenta_id,
  );

  return (
    <Pressable style={styles.transactionRow} onPress={onEdit}>
      <View style={styles.transferIcon}>
        <Ionicons name="swap-horizontal" size={22} color="white" />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>Transferencia</Text>
        <Text style={styles.transferRoute} numberOfLines={1}>
          {originAccount?.nombre ?? "Cuenta desconocida"} →{" "}
          {destinationAccount?.nombre ?? "Cuenta desconocida"}
        </Text>
      </View>
      <View style={styles.transactionActions}>
        <Text style={styles.transferAmount}>
          {formatearMonto(origin.monto)}
        </Text>
        <Text style={styles.transactionSubtitle}>{origin.fecha}</Text>
      </View>
    </Pressable>
  );
}

function RecordsScreen({
  loading,
  lista,
  allFilteredTransactions,
  searchQuery,
  setSearchQuery,
  openEditModal,
  cuentas,
  selectedAccount,
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const displayedRecords = [];
  const displayedTransferIds = new Set();

  for (const item of allFilteredTransactions) {
    if (item.categoria !== "Transferencia") {
      displayedRecords.push({ type: "transaction", item });
      continue;
    }

    if (displayedTransferIds.has(item.id)) continue;

    const pairedTransaction = findTransferPair(item, lista, cuentas);
    if (!pairedTransaction) {
      displayedRecords.push({ type: "transaction", item });
      continue;
    }

    const origin = item.tipo === "gasto" ? item : pairedTransaction;
    const destination = item.tipo === "ingreso" ? item : pairedTransaction;
    displayedTransferIds.add(origin.id);
    displayedTransferIds.add(destination.id);
    displayedRecords.push({ type: "transfer", origin, destination });
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sectionFilter}>
        <TextInput
          style={styles.input}
          placeholder="Busca por descripción o categoría"
          placeholderTextColor={colors.textFaint}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resultados</Text>
          <View style={styles.sectionMetaContainer}>
            <Text style={styles.sectionMeta}>
              {displayedRecords.length} registros
            </Text>
            {selectedAccount && (
              <Text
                style={[
                  styles.accountFilterText,
                  { color: selectedAccount.color },
                ]}
                numberOfLines={1}
              >
                {selectedAccount.nombre}
              </Text>
            )}
          </View>
        </View>

        {displayedRecords.length === 0 ? (
          <EmptyState
            text={loading ? "Cargando datos..." : "No hay resultados."}
          />
        ) : (
          displayedRecords.map((record) =>
            record.type === "transfer" ? (
              <TransferRow
                key={`transfer-${record.origin.id}-${record.destination.id}`}
                origin={record.origin}
                destination={record.destination}
                cuentas={cuentas}
                onEdit={() => openEditModal(record.origin)}
              />
            ) : (
              <TransactionRow
                key={String(record.item.id)}
                item={record.item}
                cuentas={cuentas}
                onEdit={() => openEditModal(record.item)}
              />
            ),
          )
        )}
      </View>
    </ScrollView>
  );
}

function EmptyState({ text }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>{text}</Text>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.surface,
    },
    section: {
      flex: 1,
      gap: 4,
      padding: 16,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: { color: colors.textStrong, fontSize: 17, fontWeight: "500" },
    sectionMetaContainer: {
      flexDirection: "row",
      gap: 10,
    },
    sectionMeta: { color: colors.textMuted, fontSize: 13 },
    accountFilterText: { fontSize: 14, fontWeight: "500" },
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
    transactionActions: { alignItems: "flex-end", gap: 6 },
    transactionSubtitle: { color: colors.textMuted, fontSize: 13 },
    transferIcon: {
      width: 42,
      height: 42,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },
    transferRoute: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    transferAmount: {
      color: colors.primaryText,
      fontSize: 16,
      fontWeight: "600",
    },
    sectionFilter: { padding: 10 },
    input: {
      borderWidth: 1,
      borderRadius: 20,
      padding: 15,
      borderColor: colors.borderStrong,
      color: colors.textStrong,
      fontSize: 17,
    },
    emptyState: { paddingVertical: 18, alignItems: "center" },
    emptyStateText: { color: colors.textMuted, textAlign: "center" },
  });
}

export { RecordsScreen };
