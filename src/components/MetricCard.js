import { StyleSheet, Text, View } from "react-native";

function MetricCard({ label, value, tone }) {
  return (
    <View style={[styles.metricCard, styles[`metric_${tone}`]]}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "#0f172a",
    borderWidth: 1,
  },
  metricLabel: { color: "#94a3b8", fontSize: 12, marginBottom: 8 },
  metricValue: { color: "#fff", fontSize: 22, fontWeight: "700" },
  metric_primary: { borderColor: "#38bdf8" },
  metric_success: { borderColor: "#34d399" },
  metric_danger: { borderColor: "#fb7185" },
});

export { MetricCard };
