import React, { useEffect, useState } from "react";
import { Award, Trophy, X, Sparkles, Flame, Zap, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";
import { Achievement } from "../types";
import { subscribeToAchievementUnlocked } from "../lib/achievementEngine";

export const AchievementNotificationToast: React.FC = () => {
  const [activeQueue, setActiveQueue] = useState<Achievement[]>([]);
  const current = activeQueue[0] || null;

  useEffect(() => {
    const unsubscribe = subscribeToAchievementUnlocked((achievement) => {
      setActiveQueue((prev) => [...prev, achievement]);
      // Trigger festive confetti burst
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.8 },
          colors: ["#60a5fa", "#a855f7", "#fbbf24", "#34d399"],
        });
      } catch (err) {
        console.warn("Confetti effect unavailable", err);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto-dismiss current toast after 6 seconds
  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => {
      setActiveQueue((prev) => prev.slice(1));
    }, 6000);

    return () => clearTimeout(timer);
  }, [current]);

  const handleDismiss = () => {
    setActiveQueue((prev) => prev.slice(1));
  };

  if (!current) return null;

  return (
    <aside
      aria-label="Achievement notifications"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-full pointer-events-none animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="pointer-events-auto rounded-2xl border border-amber-500/40 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 p-4 shadow-2xl backdrop-blur-xl ring-1 ring-amber-500/20">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20">
            <Trophy className="h-6 w-6" />
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span>Achievement Unlocked!</span>
            </div>
            <h4 className="text-sm font-bold text-white truncate mt-0.5">
              {current.title}
            </h4>
            <p className="text-xs text-slate-300 leading-snug mt-1">
              {current.description || "You reached a new milestone in your curriculum journey!"}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/80 border border-amber-700/50 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-300">
                +100 XP Bonus
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                View in Profile
              </span>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Dismiss achievement notification"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
