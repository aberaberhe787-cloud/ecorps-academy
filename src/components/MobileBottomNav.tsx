import React from "react";
import { Compass, BookOpen, GraduationCap, Terminal, User } from "lucide-react";
import { useApp } from "../context/AppContext";
import { NavTab } from "../types";

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, userProgress, activeLessonId, isDistractionFreeMode } = useApp();

  // Hide bottom nav during active lesson view or distraction-free mode
  if (isDistractionFreeMode || activeLessonId !== null) return null;

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "home", label: "Home", icon: Compass },
    { id: "curriculum", label: "Curriculum", icon: BookOpen },
    { id: "foundations", label: "Foundations", icon: GraduationCap },
    { id: "playground", label: "Playground", icon: Terminal },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg px-2 py-1 shadow-2xl transition-all"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 min-h-[48px] rounded-xl transition-all active:scale-95 cursor-pointer relative ${
                isActive
                  ? "text-blue-400 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? "scale-110 text-blue-400" : "text-slate-400"
                  }`}
                />
                {item.id === "profile" && userProgress.streakDays > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                )}
              </div>
              <span className="text-xs font-medium tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0.5 w-6 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
