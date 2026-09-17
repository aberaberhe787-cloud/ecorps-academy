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
  const { activeTab, setActiveTab, t } = useApp();

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "home", label: t.nav.home, icon: Compass },
    { id: "curriculum", label: t.nav.curriculum, icon: BookOpen },
    { id: "foundations", label: "Foundations", icon: Target },
    { id: "playground", label: t.nav.sandbox, icon: Terminal },
    { id: "patterns", label: t.nav.patterns, icon: Grid3X3 },
    { id: "resources", label: t.nav.resources, icon: Award },
  ];

  return (
    <>
      {/* Desktop Nav Links (Full) */}
      <nav 
        aria-label="Primary Desktop Navigation"
        className="hidden xl:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1 shadow-inner relative"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors duration-200 z-10 cursor-pointer ${
                isActive
                  ? "text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="desktopActiveTabIndicator"
                  className="absolute inset-0 bg-blue-600 rounded-lg shadow-sm shadow-blue-500/30 -z-10"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 32,
                  }}
                />
              )}
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Compact Nav for Intermediate Desktop (md-lg) */}
      <nav 
        aria-label="Primary Compact Navigation"
        className="hidden md:flex xl:hidden items-center gap-0.5 rounded-xl border border-slate-800 bg-slate-900/60 p-1 shadow-inner relative"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`relative flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors duration-200 z-10 cursor-pointer ${
                isActive
                  ? "text-white"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="compactActiveTabIndicator"
                  className="absolute inset-0 bg-blue-600 rounded-lg shadow-sm shadow-blue-500/30 -z-10"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 32,
                  }}
                />
              )}
              <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span className="hidden lg:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
