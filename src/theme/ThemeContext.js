import { createContext, useContext } from "react";
import { useColorScheme } from "react-native";

const themes = {
  dark: {
    background: "rgb(32, 32, 38)",
    surface: "rgb(20, 23, 28)",
    surfaceElevated: "rgba(30, 41, 59, 0.7)",
    border: "#1e293b",
    borderStrong: "#334155",
    text: "white",
    textStrong: "#f8fafc",
    textSecondary: "#cbd5e1",
    textMuted: "#94a3b8",
    textFaint: "#64748b",
    primary: "rgb(79, 57, 246)",
    primarytextLink: "rgb(102, 86, 223)",
    primarySoft: "rgba(79, 57, 246, 0.2)",
    primarySelected: "rgba(79, 57, 246, 0.7)",
    primaryText: "rgb(205, 205, 254)",
    inputText: "rgb(200, 200, 200)",
    overlay: "rgba(0, 0, 0, 0.6)",
    modalOverlay: "rgba(25, 25, 25, 0.72)",
    positive: "#34d399",
    negative: "#fb7185",
    negativeSoft: "#fda4af",
    expense: "rgb(254, 83, 83)",
    income: "rgb(0, 212, 146)",
    accent: "#38bdf8",
    accentLight: "#7dd3fc",
  },
  light: {
    background: "#f1f5f9",
    surface: "#ffffff",
    surfaceElevated: "#f8fafc",
    border: "#cbd5e1",
    borderStrong: "#94a3b8",
    text: "#0f172a",
    textStrong: "#0f172a",
    textSecondary: "#334155",
    textMuted: "#64748b",
    textFaint: "#64748b",
    primary: "rgb(79, 57, 246)",
    primarySoft: "rgba(79, 57, 246, 0.12)",
    primarySelected: "rgba(79, 57, 246, 0.18)",
    primaryText: "#3730a3",
    inputText: "#475569",
    overlay: "rgba(15, 23, 42, 0.35)",
    modalOverlay: "rgba(15, 23, 42, 0.35)",
    positive: "#059669",
    negative: "#e11d48",
    negativeSoft: "#be123c",
    expense: "#dc2626",
    income: "#059669",
    accent: "#0284c7",
    accentLight: "#0369a1",
  },
};

const ThemeContext = createContext(themes.dark);

function ThemeProvider({ children }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme !== "light";

  return (
    <ThemeContext.Provider
      value={{ colors: themes[isDark ? "dark" : "light"], isDark }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  return useContext(ThemeContext);
}

export { ThemeProvider, useTheme };
