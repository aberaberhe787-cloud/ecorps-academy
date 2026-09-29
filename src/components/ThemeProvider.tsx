import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import "../theme.css";
import {
  loadUserPreferences,
  savePreference,
  subscribeToPreferences,
  type ThemeMode,
} from "../lib/userPreferences";

type Theme = ThemeMode;

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

function resolveIsDark(theme: Theme): boolean {
  if (typeof window === "undefined") return theme !== "light";
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return theme === "dark";
}

/**
 * Theme UI state stays in sync with userPreferences (same store AppContext uses).
 * Does not import AppContext — avoids circular module init crashes.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => loadUserPreferences().theme);
  const [isDarkMode, setIsDarkMode] = useState(() => resolveIsDark(loadUserPreferences().theme));

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const isDark = resolveIsDark(theme);
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.classList.toggle("light", !isDark);
    };

    apply();
    mediaQuery.addEventListener("change", apply);
    return () => mediaQuery.removeEventListener("change", apply);
  }, [theme]);

  useEffect(() => {
    return subscribeToPreferences((prefs) => {
      if (prefs.theme && prefs.theme !== theme) {
        setThemeState(prefs.theme);
      }
    });
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    savePreference("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
