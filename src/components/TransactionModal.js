import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

function TransactionModal({
  visible,
  editingTransaction,
  closeModal,
  saveTransaction,
  deleteTransaction,
  formType,
  setFormType,
  formMonto,
  setFormMonto,
  formCategoria,
  setFormCategoria,
  formDescripcion,
  setFormDescripcion,
  formFecha,
  setFormFecha,
  categories,
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={closeModal}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modalKicker}>Registrar Operacion</Text>
              <Text style={styles.modalTitle}>
                {editingTransaction
                  ? "Editar transacción"
                  : "Nueva transacción"}
              </Text>
            </View>

            <Pressable onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>⨉</Text>
            </Pressable>
          </View>

          <View style={styles.actionBar}>
            {editingTransaction ? (
              <Pressable
                style={styles.iconAction}
                onPress={() => deleteTransaction(editingTransaction.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#fda4af" />
              </Pressable>
            ) : (
              <View style={styles.iconActionPlaceholder} />
            )}

            <Pressable style={styles.sendButton} onPress={saveTransaction}>
              <Text style={styles.sendButtonText}>Enviar</Text>
            </Pressable>
          </View>

          <View style={styles.segmented}>
            <Pressable
              style={[
                styles.segmentButton,
                formType === "gasto" && styles.segmentButtonActive,
              ]}
              onPress={() => setFormType("gasto")}
            >
              <Text
                style={[
                  styles.segmentText,
                  formType === "gasto" && styles.segmentTextActive,
                ]}
              >
                Gastos
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.segmentButton,
                formType === "ingreso" && styles.segmentButtonActive,
              ]}
              onPress={() => setFormType("ingreso")}
            >
              <Text
                style={[
                  styles.segmentText,
                  formType === "ingreso" && styles.segmentTextActive,
                ]}
              >
                Ingresos
              </Text>
            </Pressable>
          </View>

          <ScrollView>
            <TextInput
              style={styles.input}
              placeholder="Monto"
              placeholderTextColor="#64748b"
              value={formMonto}
              onChangeText={setFormMonto}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder="Categoría"
              placeholderTextColor="#64748b"
              value={formCategoria}
              onChangeText={setFormCategoria}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              placeholderTextColor="#64748b"
              value={formDescripcion}
              onChangeText={setFormDescripcion}
            />
            <TextInput
              style={styles.input}
              placeholder="Fecha YYYY-MM-DD"
              placeholderTextColor="#64748b"
              value={formFecha}
              onChangeText={setFormFecha}
            />

            <Text style={styles.helperText}>
              Categorías sugeridas: {categories.join(" · ")}
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.72)",
    justifyContent: "flex-end",
  },
  modalCard: {
    maxHeight: "92%",
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: { flex: 1, gap: 2 },
  modalKicker: {
    color: "#7dd3fc",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  modalTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: { color: "#e2e8f0", fontSize: 18, lineHeight: 20 },
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 14,
  },
  iconAction: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },
  iconActionPlaceholder: {
    width: 42,
    height: 42,
  },
  sendButton: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#38bdf8",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: { color: "#081120", fontWeight: "800" },
  segmented: { flexDirection: "row", gap: 10, marginBottom: 14 },
  segmentButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  segmentButtonActive: { backgroundColor: "#1d4ed8", borderColor: "#60a5fa" },
  segmentText: { color: "#cbd5e1", fontWeight: "600" },
  segmentTextActive: { color: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#f8fafc",
    backgroundColor: "#111827",
    marginBottom: 10,
  },
  helperText: {
    color: "#94a3b8",
    marginTop: 6,
    marginBottom: 12,
    lineHeight: 18,
  },
});

export { TransactionModal };
