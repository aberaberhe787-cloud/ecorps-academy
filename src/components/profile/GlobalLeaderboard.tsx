import React from "react";
import { Trophy, User } from "lucide-react";
import { CompetencyState, levelMap } from "../../types";

interface GlobalLeaderboardProps {
  userCompetencyStates: CompetencyState[];
}

/**
 * Personal competency scoreboard — not a fabricated global ranking of fictional users.
 */
export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({ userCompetencyStates }) => {
  const rows = [...userCompetencyStates]
    .map((s) => ({
      id: s.competency.id,
      title: s.competency.title,
      points: levelMap[s.level] || 0,
      level: s.level,
    }))
    .sort((a, b) => b.points - a.points);

  const total = rows.reduce((sum, r) => sum + r.points, 0);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 space-y-4 shadow-xl">
      <div className="space-y-1">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Trophy className="text-amber-400 h-5 w-5 shrink-0" aria-hidden="true" />
          Your competency scores
        </h2>
        <p className="text-xs text-slate-400">
          Based on your progress in this account — not a public global leaderboard.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-950/30 px-3 py-2 text-xs">
        <span className="text-slate-300 inline-flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-indigo-300" aria-hidden="true" />
          Combined score
        </span>
        <span className="font-mono font-bold text-indigo-200">{total} pts</span>
      </div>

      <div className="space-y-2">
        {rows.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">
            Complete lessons and assessments to build competency scores here.
          </p>
        ) : (
          rows.map((row, index) => (
            <div
              key={row.id}
              className="flex items-center justify-between gap-2 p-2 rounded-lg text-xs border border-transparent hover:border-slate-800 min-w-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`font-mono font-bold shrink-0 ${
                    index < 3 ? "text-amber-400" : "text-slate-500"
                  }`}
                >
                  #{index + 1}
                </span>
                <div className="min-w-0">
                  <span className="text-slate-200 truncate block">{row.title}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{row.level}</span>
                </div>
              </div>
              <span className="font-mono font-bold text-slate-300 shrink-0">{row.points} pts</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
