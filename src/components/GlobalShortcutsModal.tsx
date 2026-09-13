import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Keyboard,
  X,
  Search,
  BookOpen,
  Terminal,
  Compass,
  Zap,
  Moon,
  Maximize2,
  Play,
  FileText,
  RotateCcw,
  CornerDownLeft,
  Flame,
  Award,
  Grid3X3,
  Sparkles,
  Command,
  Target,
  Bell,
} from "lucide-react";

export interface GlobalShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface ShortcutItem {
  keys: string[];
  description: string;
  category: "Navigation" | "Global Actions" | "Curriculum & Study" | "Sandbox & Editor";
  badge?: string;
}

export const GLOBAL_SHORTCUTS: ShortcutItem[] = [
  // Navigation
  {
    keys: ["G"],
    description: "Navigate to Home / Academic Overview",
    category: "Navigation",
  },
  {
    keys: ["C"],
    description: "Navigate to Curriculum Modules & Lessons",
    category: "Navigation",
  },
  {
    keys: ["F"],
    description: "Navigate to Foundations Prompt Engineering Path",
    category: "Navigation",
  },
  {
    keys: ["P"],
    description: "Navigate to AI Playground & Prompt Sandbox",
    category: "Navigation",
  },
  {
    keys: ["L"],
    description: "Navigate to Prompt Pattern Library",
    category: "Navigation",
  },
  {
    keys: ["R"],
    description: "Navigate to Prompt Engineering Resources & Glossary",
    category: "Navigation",
  },
  {
    keys: ["A"],
    description: "Navigate to Capstone Assessment & Certification",
    category: "Navigation",
  },
  {
    keys: ["U"],
    description: "Navigate to Learner Profile, Badges & Settings",
    category: "Navigation",
  },
  {
    keys: ["Alt", "1-8"],
    description: "Quick Jump to Tabs (1: Home, 2: Curriculum, 3: Foundations...)",
    category: "Navigation",
  },

  // Global Actions
  {
    keys: ["?"],
    description: "Open / Close this Keyboard Shortcuts Reference",
    category: "Global Actions",
    badge: "Toggle",
  },
  {
    keys: ["Ctrl", "/"],
    description: "Alternate shortcut to toggle Keyboard Shortcuts modal",
    category: "Global Actions",
  },
  {
    keys: ["Ctrl", "K"],
    description: "Open Universal Search & Command Palette",
    category: "Global Actions",
    badge: "Popular",
  },
  {
    keys: ["Esc"],
    description: "Universally close open modals, overlays, and search dialogs",
    category: "Global Actions",
  },
  {
    keys: ["Ctrl", "Shift", "T"],
    description: "Cycle Color Theme (Dark / Light / System Preference)",
    category: "Global Actions",
  },
  {
    keys: ["Ctrl", "Shift", "M"],
    description: "Trigger & Test Missed Learning Daily Reminder Notification",
    category: "Global Actions",
    badge: "Notification",
  },

  // Curriculum & Study
  {
    keys: ["Ctrl", "Shift", "R"],
    description: "Instantly resume your active curriculum lesson",
    category: "Curriculum & Study",
    badge: "Resume",
  },
  {
    keys: ["Ctrl", "Shift", "D"],
    description: "Toggle Distraction-Free Focus Study Mode",
    category: "Curriculum & Study",
  },

  // Sandbox & Editor
  {
    keys: ["Ctrl", "Enter"],
    description: "Execute prompt directives in AI Playground Sandbox",
    category: "Sandbox & Editor",
    badge: "Run",
  },
];

export const GlobalShortcutsModal: React.FC<GlobalShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", "Navigation", "Global Actions", "Curriculum & Study", "Sandbox & Editor"];

  const filteredShortcuts = useMemo(() => {
    return GLOBAL_SHORTCUTS.filter((item) => {
      const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.keys.some((k) => k.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-shortcuts-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="w-full max-w-2xl rounded-2xl border border-slate-700/90 bg-slate-900/95 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-100 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                <Keyboard className="h-5 w-5" />
              </div>
              <div>
                <h2 id="global-shortcuts-title" className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  Keyboard Shortcuts
                  <span className="text-[11px] font-mono font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    Press &apos;?&apos; to toggle
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Comprehensive key bindings for lightning navigation and rapid prompt testing
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
              title="Close (Esc)"
              aria-label="Close keyboard shortcuts dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Search & Category Filter Bar */}
          <div className="p-3 sm:px-6 sm:py-3 border-b border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Live Filter Input */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search shortcuts (e.g., Home, Playground, Theme)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-900/90 pl-8 pr-8 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Shortcuts List Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 divide-y divide-slate-800/60">
            {filteredShortcuts.length > 0 ? (
              filteredShortcuts.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 gap-3 group"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-200 group-hover:text-blue-300 transition-colors">
                        {item.description}
                      </span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.keys.map((k, kidx) => (
                      <React.Fragment key={kidx}>
                        <kbd className="inline-flex min-w-[26px] items-center justify-center rounded-lg border border-slate-700 bg-slate-800/90 px-2 py-1 font-mono text-xs font-bold text-slate-200 shadow-sm">
                          {k === "Ctrl" ? (
                            <span>Ctrl / ⌘</span>
                          ) : (
                            k
                          )}
                        </kbd>
                        {kidx < item.keys.length - 1 && (
                          <span className="text-slate-600 text-xs font-mono">+</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No keyboard shortcuts found matching &ldquo;{searchQuery}&rdquo;.
              </div>
            )}
          </div>

          {/* Footer Note & Interactive Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/80 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span>Active in all academy views</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("ecorp:trigger-reminder-test", { detail: { days: 1 } })
                  );
                  onClose();
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1"
                title="Test Missed Learning Alert"
              >
                <Bell className="h-3 w-3" />
                <span>Test Missed Day Alert</span>
              </button>
              <span className="text-slate-600">•</span>
              <span><kbd className="text-slate-300 font-bold bg-slate-800 px-1 py-0.5 rounded border border-slate-700">Esc</kbd> to close</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
