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

  const navItems: { id: NavTab; label: string; shortLabel: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "home", label: "Home", shortLabel: "Home", icon: Compass },
    { id: "curriculum", label: "Curriculum", shortLabel: "Learn", icon: BookOpen },
    { id: "foundations", label: "Foundations", shortLabel: "Base", icon: GraduationCap },
    { id: "playground", label: "Sandbox", shortLabel: "Lab", icon: Terminal },
    { id: "profile", label: "Profile", shortLabel: "You", icon: User },
  ];

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-md px-1 pt-0.5 pb-[max(0.35rem,env(safe-area-inset-bottom,0px))] shadow-[0_-4px_24px_rgba(0,0,0,0.35)] transition-all"
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 py-1.5 px-0.5 min-h-[52px] rounded-lg transition-colors active:scale-95 cursor-pointer relative ${
                isActive
                  ? "text-blue-400 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-[22px] w-[22px] transition-transform ${
                    isActive ? "scale-105 text-blue-400" : "text-slate-400"
                  }`}
                />
                {item.id === "profile" && userProgress.streakDays > 0 && (
                  <span className="absolute -top-0.5 -right-1 flex h-2 w-2 rounded-full bg-orange-500 ring-2 ring-slate-950" />
                )}
              </div>
              {/* Short labels on very narrow screens; full labels from ~380px */}
              <span className="text-[10px] leading-tight tracking-tight mt-0.5 whitespace-nowrap truncate max-w-full px-0.5">
                <span className="min-[380px]:hidden">{item.shortLabel}</span>
                <span className="hidden min-[380px]:inline">{item.label}</span>
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTabIndicator"
                  className="absolute top-0.5 w-5 h-0.5 bg-blue-500 rounded-full"
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
