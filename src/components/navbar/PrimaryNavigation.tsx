import React from "react";
import { motion } from "motion/react";
import {
  Compass,
  BookOpen,
  Target,
  Terminal,
  Grid3X3,
  Library,
  ClipboardCheck,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { NavTab } from "../../types";
import { isWorkspaceTab } from "../../lib/platformSections";

export const PrimaryNavigation: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();

  const publicItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "home", label: t.nav.home, icon: Compass },
    { id: "curriculum", label: "Learning Hub", icon: BookOpen },
    { id: "foundations", label: "Foundations", icon: Target },
    { id: "playground", label: t.nav.sandbox, icon: Terminal },
    { id: "patterns", label: t.nav.patterns, icon: Grid3X3 },
    { id: "resources", label: t.nav.resources, icon: Library },
  ];

  const workspaceItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "certification", label: "Assess", icon: ClipboardCheck },
  ];

  const renderItem = (item: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    const workspace = isWorkspaceTab(item.id);

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => setActiveTab(item.id)}
        title={workspace ? `${item.label} (Workspace)` : item.label}
        className={`relative flex items-center gap-1.5 rounded-lg px-2 lg:px-2.5 py-1.5 text-xs font-semibold transition-colors duration-200 z-10 cursor-pointer shrink-0 ${
          isActive ? "text-white" : "text-slate-300 hover:text-white"
        }`}
      >
        {isActive && (
          <motion.div
            layoutId="primaryActiveTabIndicator"
            className={`absolute inset-0 rounded-lg shadow-sm -z-10 ${
              workspace
                ? "bg-violet-600 shadow-violet-500/30"
                : "bg-indigo-600 shadow-indigo-500/30"
            }`}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
          />
        )}
        <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
        <span className="hidden xl:inline whitespace-nowrap">{item.label}</span>
      </button>
    );
  };

  return (
    <nav
      aria-label="Primary Platform Navigation"
      className="hidden md:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1 shadow-inner relative shrink-0 min-w-0"
    >
      <div className="flex items-center gap-0.5 lg:gap-1 min-w-0" aria-label="Public learning">
        {publicItems.map(renderItem)}
      </div>
      <div
        className="hidden lg:block w-px h-5 bg-slate-700/80 mx-0.5 shrink-0"
        aria-hidden="true"
      />
      <div className="flex items-center gap-0.5 min-w-0" aria-label="Learner workspace">
        {workspaceItems.map(renderItem)}
      </div>
    </nav>
  );
};
