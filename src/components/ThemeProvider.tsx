import { createContext, useContext, ReactNode } from "react";
import "../theme.css";
import { useApp } from "../context/AppContext";
import type { ThemeMode } from "../lib/userPreferences";

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

/**
 * Single source of truth is AppContext (persisted preferences + document class).
 * ThemeProvider only exposes the same API for components using useTheme().
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme, isDarkMode } = useApp();

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
