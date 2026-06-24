import { StyleSheet, Text, View } from "react-native";

function MetricCard({ label, value, tone }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, styles[tone]]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    flex: 1,
    padding: 10,
    backgroundColor: "rgb(20, 23, 28)",
  },
  metricLabel: { color: "#94a3b8", fontSize: 12 },
  metricValue: { fontSize: 20, fontWeight: "700" },
  primary: { color: "#38bdf8" },
  green: { color: "#34d399" },
  red: { color: "#fb7185" },
});

export { MetricCard };
