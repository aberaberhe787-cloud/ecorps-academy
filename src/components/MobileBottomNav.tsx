import React from "react";
import { Compass, BookOpen, GraduationCap, Terminal, User } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { NavTab } from "../types";

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, userProgress, isDistractionFreeMode, activeLessonId } = useApp();

  // Hide on mobile when inside active lesson or in distraction-free mode
  if (isDistractionFreeMode || (activeTab === "curriculum" && Boolean(activeLessonId))) {
    return null;
  }

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "home", label: "Home", icon: Compass },
    { id: "curriculum", label: "Curriculum", icon: BookOpen },
    { id: "foundations", label: "Foundations", icon: GraduationCap },
    { id: "playground", label: "Sandbox", icon: Terminal },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md px-2 py-1 shadow-2xl transition-all"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-xl transition-colors active:scale-95 cursor-pointer relative ${
                isActive
                  ? "text-blue-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? "scale-105 text-blue-400" : "text-slate-400"
                  }`}
                />
                {item.id === "profile" && userProgress.streakDays > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-2 w-2 rounded-full bg-orange-500" />
                )}
              </div>
              <span className="text-xs tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTabIndicator"
                  className="absolute bottom-0.5 w-6 h-0.5 bg-blue-500 rounded-full"
                  transition={{
                    type: "spring",
                    stiffness: 450,
                    damping: 35,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
