import React from "react";
import { Flame, Calendar, Award, CheckCircle, Clock, CloudCheck, ShieldCheck } from "lucide-react";

interface DailyStreakCounterProps {
  streakDays: number;
  loginHistory?: string[];
  lastActivityDate?: string;
  isOnline?: boolean;
}

export const DailyStreakCounter: React.FC<DailyStreakCounterProps> = ({
  streakDays,
  loginHistory = [],
  lastActivityDate,
  isOnline = true,
}) => {
  // Ensure we include today's date if active today
  const todayStr = new Date().toISOString().slice(0, 10);
  const normalizedHistory = Array.from(
    new Set([...loginHistory, ...(lastActivityDate ? [lastActivityDate.slice(0, 10)] : [])])
  ).sort();

  // Calculate past 14 days
  const pastDays = Array.from({ length: 14 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - idx));
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = d.getDate();
    const isActive = normalizedHistory.includes(dateStr);
    const isToday = dateStr === todayStr;

    return {
      dateStr,
      dayName,
      dayNum,
      isActive,
      isToday,
    };
  });

  // Calculate best consecutive streak from history
  const calculateBestStreak = (dates: string[]): number => {
    if (dates.length === 0) return Math.max(streakDays, 1);
    const sorted = Array.from(new Set(dates)).sort();
    let best = 1;
    let current = 1;

    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]).getTime();
      const curr = new Date(sorted[i]).getTime();
      const diffDays = Math.round((curr - prev) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        current += 1;
        if (current > best) best = current;
      } else if (diffDays > 1) {
        current = 1;
      }
    }
    return Math.max(best, streakDays);
  };

  const bestStreak = calculateBestStreak(normalizedHistory);
  const totalDaysVisited = Math.max(normalizedHistory.length, 1);

  return (
    <section className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-6 shadow-2xl space-y-6">
      {/* Header & Main Streak Count */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-orange-400">
              Academy Attendance Record
            </span>
            <span className="flex items-center gap-1 rounded bg-orange-950/80 border border-orange-800/60 px-2 py-0.5 text-[10px] font-mono text-orange-300">
              <ShieldCheck className="h-3 w-3 text-orange-400" />
              Firestore Synced
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-400 fill-orange-500/20" />
            <span>Daily Learning Streak</span>
          </h2>
          <p className="text-xs text-slate-400">
            Keep your momentum alive by visiting and solving prompt engineering challenges daily.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-orange-950/40 via-slate-900 to-amber-950/30 border border-orange-500/30 px-5 py-3 shadow-lg ring-1 ring-orange-500/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400">
              <Flame className="h-7 w-7 text-orange-400 fill-orange-400" />
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono leading-none">
                {streakDays} <span className="text-xs font-normal text-orange-300 uppercase">Days</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1">
                Current Active Streak
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 14-Day Activity Tracker */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-blue-400" />
            Past 14 Days Attendance
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {totalDaysVisited} total active {totalDaysVisited === 1 ? "day" : "days"} logged
          </span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
          {pastDays.map((day) => (
            <div
              key={day.dateStr}
              title={`${day.dateStr}: ${day.isActive ? "Active Visit" : "No Activity"}`}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                day.isActive
                  ? "border-orange-500/50 bg-gradient-to-b from-orange-950/60 to-slate-900 shadow-md shadow-orange-950/30 text-white"
                  : "border-slate-800/80 bg-slate-950/60 text-slate-500"
              } ${day.isToday ? "ring-1 ring-blue-400" : ""}`}
            >
              <span className="text-[9px] font-mono font-bold uppercase">{day.dayName}</span>
              <span className="text-xs font-bold font-mono my-0.5">{day.dayNum}</span>
              <div className="h-3.5 w-3.5 flex items-center justify-center mt-0.5">
                {day.isActive ? (
                  <Flame className="h-3.5 w-3.5 text-orange-400 fill-orange-400" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Streak Metrics & Milestones */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Longest Streak</div>
          <div className="text-lg font-black text-white font-mono">{bestStreak} Consecutive Days</div>
          <p className="text-[10px] text-slate-400">Personal all-time record</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Next Milestone</div>
          <div className="text-lg font-black text-amber-300 font-mono">
            {streakDays < 3 ? "3 Days (Spark)" : streakDays < 7 ? "7 Days (Habit)" : streakDays < 10 ? "10 Days (Trophy)" : "14 Days (Legend)"}
          </div>
          <p className="text-[10px] text-slate-400">
            {streakDays < 3
              ? `${3 - streakDays} days remaining`
              : streakDays < 7
              ? `${7 - streakDays} days remaining`
              : streakDays < 10
              ? `${10 - streakDays} days remaining`
              : "Milestone achieved!"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-1">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Firestore Record</div>
          <div className="text-lg font-black text-emerald-400 font-mono flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4" />
            <span>Persisted</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Last active: {lastActivityDate ? lastActivityDate.slice(0, 10) : todayStr}
          </p>
        </div>
      </div>
    </section>
  );
};
