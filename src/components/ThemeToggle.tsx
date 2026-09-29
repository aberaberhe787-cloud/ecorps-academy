import React, { useEffect, useRef, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const OPTIONS: { label: string; value: "light" | "dark" | "system"; icon: typeof Sun }[] = [
  { label: "Light", value: "light", icon: Sun },
  { label: "Dark", value: "dark", icon: Moon },
  { label: "System", value: "system", icon: Laptop },
];

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const ActiveIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Laptop;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
        aria-label={`Theme: ${theme}. Change color theme`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <ActiveIcon
          className={`h-5 w-5 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Color theme"
          className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-xl z-50"
        >
          {OPTIONS.map((option) => {
            const Icon = option.icon;
            const selected = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors cursor-pointer ${
                  selected
                    ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
