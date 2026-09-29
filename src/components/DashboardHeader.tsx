import React from "react";
import { Flame, LogOut } from "lucide-react";
import { useApp } from "../context/AppContext";

/**
 * Compact dashboard chrome: streak + logout.
 * Mounted on the profile (Academic Dashboard) surface only.
 */
export const DashboardHeader: React.FC = () => {
  const { userProgress, setActiveTab, logout, user } = useApp();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("logout failed", e);
    } finally {
      setActiveTab("home");
    }
  };

  return (
    <header
      id="dashboard-header"
      className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-sm"
    >
      <div className="page-shell page-shell--medium py-2 flex flex-wrap items-center justify-between gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 shrink-0">
            Dashboard
          </span>
          {userProgress && (
            <button
              type="button"
              id="dashboard-header-streak-counter"
              title={`${userProgress.streakDays} day study streak`}
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/20 rounded-full px-2.5 py-1 text-xs font-bold text-orange-400 cursor-pointer transition select-none shadow-sm shrink-0"
            >
              <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-400 shrink-0" aria-hidden="true" />
              <span className="font-mono">{userProgress.streakDays}d streak</span>
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors cursor-pointer"
          aria-label="Log out"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          Log out
        </button>
      </div>
    </header>
  );
};
