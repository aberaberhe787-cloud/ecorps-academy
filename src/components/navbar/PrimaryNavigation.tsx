import React from "react";
import { motion } from "motion/react";
import {
  Compass,
  BookOpen,
  Target,
  Terminal,
  Grid3X3,
  Award,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { NavTab } from "../../types";

export const PrimaryNavigation: React.FC = () => {
  const { activeTab, setActiveTab, t, user } = useApp();

  const allNavItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "home", label: t.nav.home, icon: Compass },
    { id: "curriculum", label: t.nav.curriculum, icon: BookOpen },
    { id: "foundations", label: "Foundations", icon: Target },
    { id: "playground", label: t.nav.sandbox, icon: Terminal },
    { id: "patterns", label: t.nav.patterns, icon: Grid3X3 },
    { id: "resources", label: t.nav.resources, icon: Award },
  ];

  const navItems = allNavItems.filter(item => {
    if (item.id === "home") return true;
    return !!user;
  });

  return (
    <nav 
      aria-label="Primary Platform Navigation"
      className="hidden md:flex items-center gap-0.5 lg:gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1 shadow-inner relative shrink-0 min-w-0"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={item.label}
            className={`relative flex items-center gap-1.5 rounded-lg px-2 lg:px-2.5 py-1.5 text-xs font-semibold transition-colors duration-200 z-10 cursor-pointer shrink-0 ${
              isActive
                ? "text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="primaryActiveTabIndicator"
                className="absolute inset-0 bg-blue-600 rounded-lg shadow-sm shadow-blue-500/30 -z-10"
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 32,
                }}
              />
            )}
            <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
            <span className="hidden xl:inline whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
