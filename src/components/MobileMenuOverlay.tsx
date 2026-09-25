import React, { useEffect } from "react";
import {
  X,
  Search,
  Compass,
  BookOpen,
  Target,
  Terminal,
  Grid3X3,
  Sparkles,
  Award,
  User,
  Sun,
  Moon,
  Laptop,
  Flame,
  Languages,
  LogOut,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { NavTab } from "../types";
import { EcorpLogo } from "./EcorpLogo";
import { auth } from "../lib/firebase";

interface MobileMenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
}

export const MobileMenuOverlay: React.FC<MobileMenuOverlayProps> = ({
  isOpen,
  onClose,
  onOpenSearch,
}) => {
  const {
    activeTab,
    setActiveTab,
    setPrompt,
    setSystemInstruction,
    userProgress,
    theme,
    setTheme,
    language,
    setLanguage,
    t,
    logout,
    openAuthModal,
    resumeCurriculum,
  } = useApp();

  // Lock body scroll when mobile overlay is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const navItems: {
    id: NavTab;
    label: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
  }[] = [
    {
      id: "home",
      label: t.nav.home,
      description: "Overview & recommended actions",
      icon: Compass,
    },
    {
      id: "curriculum",
      label: t.nav.curriculum,
      description: "Modules, lessons & practice",
      icon: BookOpen,
      badge: `${userProgress.completedLessons.length} done`,
    },
    {
      id: "foundations",
      label: "Foundations",
      description: "Core prompt engineering fundamentals",
      icon: Target,
    },
    {
      id: "playground",
      label: t.nav.sandbox,
      description: "Prompt sandbox & mission lab",
      icon: Terminal,
    },
    {
      id: "patterns",
      label: t.nav.patterns,
      description: "Production prompt blueprints",
      icon: Grid3X3,
    },
    {
      id: "resources",
      label: t.nav.resources,
      description: "Citations & cheatsheets",
      icon: Sparkles,
    },
    {
      id: "certification",
      label: "Assessment",
      description: "Verify mastery & credentials",
      icon: Award,
    },
  ];

  const handleNavClick = (tabId: NavTab) => {
    if (tabId === "playground" && activeTab !== "playground") {
      setPrompt("");
      setSystemInstruction("");
    }
    setActiveTab(tabId);
    onClose();
  };

  const level = Math.floor((userProgress?.xp || 0) / 250) + 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-[320px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden z-50"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <EcorpLogo size="sm" />
                <div>
                  <span className="font-mono font-bold text-white text-sm tracking-tight block">
                    {t.nav.brandName} Academy
                  </span>
                </div>
              </div>

              <button
                id="close-mobile-menu-btn"
                onClick={onClose}
                className="h-9 w-9 flex items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* Search Trigger */}
              <button
                id="mobile-drawer-search-btn"
                onClick={() => {
                  onClose();
                  onOpenSearch();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-blue-400" />
                  <span>Search lessons, patterns...</span>
                </div>
                <kbd className="text-[10px] font-mono text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  ⌘K
                </kbd>
              </button>

              {/* Learning Progress Summary */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-blue-400 font-bold">
                    <span>Level {level}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-300">{userProgress.xp || 0} XP</span>
                  </div>
                  {userProgress.streakDays > 0 && (
                    <div className="flex items-center gap-1 text-orange-400 font-bold font-mono">
                      <Flame className="h-3 w-3 fill-orange-500" />
                      <span>{userProgress.streakDays}d</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    onClose();
                    if (resumeCurriculum) {
                      resumeCurriculum();
                    } else {
                      setActiveTab("curriculum");
                    }
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-600/20"
                >
                  <span>Continue Learning</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Primary Academy Navigation */}
              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2 mb-1">
                  Academy Navigation
                </p>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? "bg-blue-600/15 border border-blue-500/30 text-white font-semibold"
                          : "hover:bg-slate-900 text-slate-300 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                        <div className="truncate">
                          <p className="text-xs truncate">{item.label}</p>
                          <p className="text-[10px] text-slate-500 truncate">{item.description}</p>
                        </div>
                      </div>
                      {item.badge ? (
                        <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400 shrink-0">
                          {item.badge}
                        </span>
                      ) : (
                        <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-blue-400" : "text-slate-600"}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Account & Quick Settings */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2">
                  Account &amp; Appearance
                </p>

                <button
                  onClick={() => handleNavClick("profile")}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Academic Dashboard</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                </button>

                {/* Quick Theme Buttons */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 min-w-0">
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex items-center justify-center gap-1 py-2 min-h-[40px] rounded-lg text-[11px] font-medium transition-all cursor-pointer min-w-0 ${
                      theme === "dark" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Moon className="h-3 w-3 shrink-0" />
                    <span className="truncate">Dark</span>
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex items-center justify-center gap-1 py-2 min-h-[40px] rounded-lg text-[11px] font-medium transition-all cursor-pointer min-w-0 ${
                      theme === "light" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Sun className="h-3 w-3 shrink-0" />
                    <span className="truncate">Light</span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`flex items-center justify-center gap-1 py-2 min-h-[40px] rounded-lg text-[11px] font-medium transition-all cursor-pointer min-w-0 ${
                      theme === "system" ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Laptop className="h-3 w-3 shrink-0" />
                    <span className="truncate">Auto</span>
                  </button>
                </div>

                {/* Language Switch */}
                <button
                  onClick={() => setLanguage(language === "en" ? "am" : "en")}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Languages className="h-3.5 w-3.5 text-blue-400" />
                    <span>{language === "en" ? "Switch to አማርኛ (Amharic)" : "Switch to English"}</span>
                  </div>
                  <span className="font-mono text-[10px] font-bold text-blue-400 uppercase">
                    {language}
                  </span>
                </button>
              </div>
            </div>

            {/* Footer / Auth action */}
            <div className="p-3 border-t border-slate-800 bg-slate-950">
              {auth.currentUser ? (
                <button
                  onClick={async () => {
                    onClose();
                    try {
                      await logout();
                    } catch (e) {
                      console.error("Logout failed", e);
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-rose-900/40 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    openAuthModal("Sign in to save your progress and unlock learner features.");
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Sign In / Register</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
