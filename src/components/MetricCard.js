import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

function MetricCard({ label, value, tone }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, styles[tone]]}>{value}</Text>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
  metricCard: {
    flex: 1,
    alignItems: "center",
  },
  metricLabel: { color: colors.textMuted, fontSize: 13 },
  metricValue: { fontSize: 16, fontWeight: "700" },
  primary: { color: colors.accent },
  green: { color: colors.positive },
  red: { color: colors.negative },
  });
}

export { MetricCard };
