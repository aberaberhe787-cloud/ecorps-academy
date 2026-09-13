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

  // Allow other UI components to request opening the modal via custom event
  useEffect(() => {
    const handleOpenModal = () => setIsShortcutsModalOpen(true);
    const handleCloseModal = () => setIsShortcutsModalOpen(false);
    const handleToggleModal = () => setIsShortcutsModalOpen((prev) => !prev);

    window.addEventListener("ecorp:open-shortcuts-modal", handleOpenModal);
    window.addEventListener("ecorp:close-shortcuts-modal", handleCloseModal);
    window.addEventListener("ecorp:toggle-shortcuts-modal", handleToggleModal);

    return () => {
      window.removeEventListener("ecorp:open-shortcuts-modal", handleOpenModal);
      window.removeEventListener("ecorp:close-shortcuts-modal", handleCloseModal);
      window.removeEventListener("ecorp:toggle-shortcuts-modal", handleToggleModal);
    };
  }, []);

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

      // Help Modal: '?' or 'Ctrl+/' or 'Cmd+/'
      if (
        (e.key === "?" && !isInput) ||
        ((e.metaKey || e.ctrlKey) && e.key === "/")
      ) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // Ctrl+Shift+M: Trigger Inactivity Reminder Notification Test
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        window.dispatchEvent(
          new CustomEvent("ecorp:trigger-reminder-test", { detail: { days: 1 } })
        );
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

      // Single key Expert Navigation (only when outside inputs and no modifiers)
      if (!isInput && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        const keyMap: Record<string, NavTab> = {
          "g": "home",
          "c": "curriculum",
          "f": "foundations",
          "p": "playground",
          "l": "patterns",
          "r": "resources",
          "a": "certification",
          "u": "profile",
        };
        const targetTab = keyMap[e.key.toLowerCase()];
        if (targetTab) {
          e.preventDefault();
          setActiveTab(targetTab);
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
