import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { GlobalShortcutsModal } from "./GlobalShortcutsModal";
import { NavTab } from "../types";

export const GlobalShortcutsHandler: React.FC = () => {
  const {
    setActiveTab,
    isDistractionFreeMode,
    setIsDistractionFreeMode,
    theme,
    setTheme,
    resumeCurriculum,
  } = useApp();

  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        (activeElement as HTMLElement)?.isContentEditable;

      // Escape key: universally dismiss modals/overlays
      if (e.key === "Escape") {
        if (isShortcutsModalOpen) {
          e.preventDefault();
          setIsShortcutsModalOpen(false);
          return;
        }
        if (isDistractionFreeMode) {
          setIsDistractionFreeMode(false);
          return;
        }
      }

      // Help Modal: '?' or 'Ctrl+/'
      if (
        (e.key === "?" && !isInput) ||
        ((e.metaKey || e.ctrlKey) && e.key === "/")
      ) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // Ctrl+Shift+T: Cycle Theme
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        const nextTheme =
          theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
        setTheme(nextTheme);
        return;
      }

      // Ctrl+Shift+D: Toggle Distraction Free Mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setIsDistractionFreeMode(!isDistractionFreeMode);
        return;
      }

      // Ctrl+Shift+R: Resume Curriculum Lesson
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "r") {
        e.preventDefault();
        if (resumeCurriculum) {
          resumeCurriculum();
        }
        return;
      }

      // Alt + Number: Quick Tab Navigation (Alt+1 through Alt+8)
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const tabMap: Record<string, NavTab> = {
          "1": "home",
          "2": "curriculum",
          "3": "foundations",
          "4": "playground",
          "5": "patterns",
          "6": "resources",
          "7": "certification",
          "8": "profile",
        };

        if (tabMap[e.key]) {
          e.preventDefault();
          setActiveTab(tabMap[e.key]);
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isShortcutsModalOpen,
    isDistractionFreeMode,
    theme,
    setTheme,
    setIsDistractionFreeMode,
    setActiveTab,
    resumeCurriculum,
  ]);

  return (
    <GlobalShortcutsModal
      isOpen={isShortcutsModalOpen}
      onClose={() => setIsShortcutsModalOpen(false)}
    />
  );
};
