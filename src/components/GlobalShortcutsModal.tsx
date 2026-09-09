import React from "react";
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
} from "lucide-react";

interface GlobalShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: "Navigation" | "Global Actions" | "Curriculum & Study" | "Sandbox";
}

const SHORTCUTS: ShortcutItem[] = [
  {
    keys: ["Ctrl", "K"],
    description: "Open Global Search & Command Palette",
    category: "Global Actions",
  },
  {
    keys: ["Esc"],
    description: "Close open dialogs, search, menus, or exit study mode",
    category: "Global Actions",
  },
  {
    keys: ["?"],
    description: "Open this Keyboard Shortcuts cheat sheet",
    category: "Global Actions",
  },
  {
    keys: ["Ctrl", "Shift", "T"],
    description: "Toggle Color Theme (Dark / Light / System)",
    category: "Global Actions",
  },
  {
    keys: ["Alt", "1"],
    description: "Navigate to Home / Dashboard",
    category: "Navigation",
  },
  {
    keys: ["Alt", "2"],
    description: "Navigate to Curriculum Academy",
    category: "Navigation",
  },
  {
    keys: ["Alt", "3"],
    description: "Navigate to Foundations",
    category: "Navigation",
  },
  {
    keys: ["Alt", "4"],
    description: "Navigate to Prompt Playground Sandbox",
    category: "Navigation",
  },
  {
    keys: ["Alt", "5"],
    description: "Navigate to Pattern Library",
    category: "Navigation",
  },
  {
    keys: ["Alt", "6"],
    description: "Navigate to Resources & Glossary",
    category: "Navigation",
  },
  {
    keys: ["Alt", "7"],
    description: "Navigate to Capstone Assessment",
    category: "Navigation",
  },
  {
    keys: ["Alt", "8"],
    description: "Navigate to Learner Profile",
    category: "Navigation",
  },
  {
    keys: ["Ctrl", "Shift", "R"],
    description: "Resume last curriculum lesson immediately",
    category: "Curriculum & Study",
  },
  {
    keys: ["Ctrl", "Shift", "D"],
    description: "Toggle Distraction-Free Focus Mode",
    category: "Curriculum & Study",
  },
  {
    keys: ["Ctrl", "Enter"],
    description: "Execute prompt in Playground Sandbox",
    category: "Sandbox",
  },
];

export const GlobalShortcutsModal: React.FC<GlobalShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");

  if (!isOpen) return null;

  const categories = ["All", "Global Actions", "Navigation", "Curriculum & Study", "Sandbox"];

  const filteredShortcuts =
    selectedCategory === "All"
      ? SHORTCUTS
      : SHORTCUTS.filter((s) => s.category === selectedCategory);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-2xl rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Keyboard className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  Keyboard Shortcuts
                </h2>
                <p className="text-xs text-slate-400">
                  Quick key bindings for rapid navigation and productivity
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-800/80 bg-slate-950/50 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Shortcuts Grid */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 divide-y divide-slate-800/60">
            {filteredShortcuts.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 gap-4"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-slate-200">
                    {item.description}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.keys.map((k, kidx) => (
                    <React.Fragment key={kidx}>
                      <kbd className="inline-flex min-w-[24px] items-center justify-center rounded border border-slate-700 bg-slate-800/90 px-2 py-1 font-mono text-[11px] font-semibold text-slate-300 shadow-sm">
                        {k === "Ctrl" ? (
                          <span className="text-[10px]">Ctrl / ⌘</span>
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
            ))}
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/70 text-xs text-slate-400 font-mono">
            <span>Tip: Press <kbd className="text-slate-300 font-bold">Esc</kbd> anytime to dismiss overlays</span>
            <span className="text-[11px] text-blue-400">Ctrl+K for Universal Search</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
