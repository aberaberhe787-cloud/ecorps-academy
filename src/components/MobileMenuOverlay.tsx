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
  Eye,
  EyeOff,
  Flame,
  Languages,
  LogOut,
  ChevronRight,
  Shield,
  Zap,
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
    isDistractionFreeMode,
    setIsDistractionFreeMode,
    language,
    setLanguage,
    aiMode,
    setAiMode,
    t,
    logout,
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

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const navSections: {
    id: NavTab;
    label: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
  }[] = [
    {
      id: "home",
      label: t.nav.home,
      description: "Overview, quick start & mastery path",
      icon: Compass,
    },
    {
      id: "curriculum",
      label: t.nav.curriculum,
      description: "Interactive modules & real-world tasks",
      icon: BookOpen,
      badge: `${userProgress.completedLessons.length} done`,
    },
    {
      id: "foundations",
      label: "Foundations",
      description: "Core prompt engineering principles",
      icon: Target,
    },
    {
      id: "playground",
      label: t.nav.sandbox,
      description: "Dual comparison, CTF & prompt tester",
      icon: Terminal,
      badge: aiMode === "real" ? "Gemini Live" : "Simulated",
    },
    {
      id: "patterns",
      label: t.nav.patterns,
      description: "Production prompts & meta-templates",
      icon: Grid3X3,
      badge: `${userProgress.bookmarkedPatterns.length} saved`,
    },
    {
      id: "resources",
      label: t.nav.resources,
      description: "Cheatsheets, benchmarks & glossaries",
      icon: Sparkles,
    },
    {
      id: "certification",
      label: "Assessment",
      description: "Knowledge validation & certificates",
      icon: Award,
      badge: `${userProgress.completedAssessments.length} verified`,
    },
    {
      id: "profile",
      label: "Academic Dashboard",
      description: "Scholar stats, XP milestones & activity",
      icon: User,
    },
  ];

  const level = Math.floor(userProgress.xp / 500) + 1;
  const currentLevelXp = userProgress.xp % 500;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / 500) * 100));

  const handleNavClick = (tabId: NavTab) => {
    if (tabId === "playground" && activeTab !== "playground") {
      setPrompt("");
      setSystemInstruction("");
    }
    setActiveTab(tabId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Slide-over Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm sm:max-w-md bg-slate-950 border-l border-slate-800/90 shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Top Bar / Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3.5 border-b border-slate-800/90 bg-slate-950/95">
              <div className="flex items-center gap-2.5">
                <EcorpLogo size="sm" />
                <div>
                  <span className="font-mono font-bold text-white text-sm tracking-tight block">
                    {t.nav.brandName}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Prompt Engineering Academy
                  </span>
                </div>
              </div>

              <button
                id="close-mobile-menu-btn"
                onClick={onClose}
                className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Main Menu Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 divide-y divide-slate-800/60">
              
              {/* Quick Search Action */}
              <div className="pt-0">
                <button
                  id="mobile-menu-search-btn"
                  onClick={() => {
                    onClose();
                    onOpenSearch();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all shadow-inner group min-h-[44px]"
                >
                  <div className="flex items-center gap-2.5">
                    <Search className="h-4 w-4 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Search curriculum, patterns & topics...</span>
                  </div>
                  <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                    ⌘K
                  </kbd>
                </button>
              </div>

              {/* Navigation Items List */}
              <div className="pt-4 space-y-1">
                <div className="px-1 mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Navigation Menu
                  </span>
                  <span className="text-[10px] font-mono text-blue-400">
                    {navSections.length} Sections
                  </span>
                </div>

                {navSections.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`mobile-nav-${item.id}`}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left min-h-[48px] ${
                        isActive
                          ? "bg-blue-600/15 border-blue-500/50 text-white shadow-xs"
                          : "bg-slate-900/40 hover:bg-slate-900 border-slate-800/60 text-slate-300 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
                            isActive
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold truncate">
                              {item.label}
                            </span>
                            {item.badge && (
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                  isActive
                                    ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                                    : "bg-slate-800 text-slate-400 border-slate-700/60"
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <ChevronRight
                        className={`h-4 w-4 shrink-0 transition-transform ${
                          isActive ? "text-blue-400 translate-x-0.5" : "text-slate-600"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* User Preferences & Toggles Section */}
              <div className="pt-4 space-y-3">
                <div className="px-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Preferences & Controls
                  </span>
                </div>

                {/* Theme Selector Pill */}
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300 flex items-center gap-1.5">
                      <Sun className="h-3.5 w-3.5 text-amber-400" />
                      Interface Theme
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 capitalize">
                      {theme}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
                    {(
                      [
                        { value: "light", label: "Light", icon: Sun },
                        { value: "dark", label: "Dark", icon: Moon },
                        { value: "system", label: "System", icon: Laptop },
                      ] as const
                    ).map((tOpt) => {
                      const Icon = tOpt.icon;
                      const isSelected = theme === tOpt.value;
                      return (
                        <button
                          key={tOpt.value}
                          id={`mobile-theme-opt-${tOpt.value}`}
                          onClick={() => setTheme(tOpt.value)}
                          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-xs"
                              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span>{tOpt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Distraction-Free Mode Toggle */}
                <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className={`p-2 rounded-lg ${isDistractionFreeMode ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" : "bg-slate-800 text-slate-400"}`}>
                      {isDistractionFreeMode ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-200">
                          Distraction-Free Mode
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                          isDistractionFreeMode
                            ? "bg-purple-500/20 text-purple-300 border-purple-400/30"
                            : "bg-slate-800 text-slate-400 border-slate-700/60"
                        }`}>
                          {isDistractionFreeMode ? "ON" : "OFF"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Hides global chrome during active curriculum lessons
                      </p>
                    </div>
                  </div>

                  <button
                    id="mobile-distraction-free-toggle"
                    type="button"
                    role="switch"
                    aria-checked={isDistractionFreeMode}
                    onClick={() => setIsDistractionFreeMode(!isDistractionFreeMode)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                      isDistractionFreeMode ? "bg-purple-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isDistractionFreeMode ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Language & AI Execution Mode Quick Switchers */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Language switcher */}
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1.5 flex items-center gap-1">
                      <Languages className="h-3 w-3 text-blue-400" />
                      Language
                    </span>
                    <div className="flex gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                      <button
                        onClick={() => setLanguage("en")}
                        className={`flex-1 py-1 rounded text-xs font-semibold transition-colors ${
                          language === "en"
                            ? "bg-blue-600 text-white"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setLanguage("am")}
                        className={`flex-1 py-1 rounded text-xs font-semibold transition-colors ${
                          language === "am"
                            ? "bg-blue-600 text-white"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        አማርኛ
                      </button>
                    </div>
                  </div>

                  {/* AI Engine switcher */}
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1.5 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-amber-400" />
                      AI Engine
                    </span>
                    <div className="flex gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                      <button
                        onClick={() => setAiMode("real")}
                        className={`flex-1 py-1 rounded text-xs font-semibold transition-colors ${
                          aiMode === "real"
                            ? "bg-emerald-600 text-white"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Gemini
                      </button>
                      <button
                        onClick={() => setAiMode("mock")}
                        className={`flex-1 py-1 rounded text-xs font-semibold transition-colors ${
                          aiMode === "mock"
                            ? "bg-purple-600 text-white"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Mock
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scholar Profile & Progress Card */}
              <div className="pt-4 space-y-3">
                <div className="px-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                    Scholar Progress
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white truncate max-w-[180px]">
                        {auth.currentUser?.displayName ||
                          auth.currentUser?.email?.split("@")[0] ||
                          "Prompt Scholar"}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                        {auth.currentUser?.email || "Academic Learner"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                      <Flame className="h-3.5 w-3.5" />
                      <span>{userProgress.streakDays}d Streak</span>
                    </div>
                  </div>

                  {/* Level & XP Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-blue-400 font-semibold">
                        Level {level}
                      </span>
                      <span className="text-slate-400">
                        {userProgress.xp} XP total
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Footer Actions */}
            <div className="shrink-0 p-4 border-t border-slate-800/90 bg-slate-950/95 flex items-center justify-between gap-3">
              <button
                id="mobile-view-profile-btn"
                onClick={() => handleNavClick("profile")}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm min-h-[44px]"
              >
                <User className="h-3.5 w-3.5" />
                <span>Open Dashboard</span>
              </button>

              <button
                id="mobile-logout-btn"
                onClick={async () => {
                  onClose();
                  try {
                    await logout();
                  } catch (e) {
                    console.error("Mobile logout failed", e);
                  }
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/60 text-slate-300 hover:text-rose-300 text-xs font-medium transition-colors min-h-[44px]"
                aria-label="Log out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Sign Out</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
