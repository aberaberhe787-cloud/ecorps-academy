import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { UserProgress, CompetencyState, levelMap } from "../../types";

interface CompetencyTrendChartProps {
  userProgress: UserProgress;
  competencyStates?: CompetencyState[];
}

/**
 * Uses account progress synced from Firebase (loginHistory + current competency levels).
 * Historical per-competency time-series is not stored yet — activity days are real;
 * competency panel shows current levels only.
 */
export const CompetencyTrendChart: React.FC<CompetencyTrendChartProps> = ({
  userProgress,
  competencyStates = [],
}) => {
  const loginSet = useMemo(
    () => new Set(userProgress.loginHistory || []),
    [userProgress.loginHistory]
  );

  const activitySeries = useMemo(() => {
    const today = new Date();
    const rows: { date: string; active: number; cumulative: number }[] = [];
    let cumulative = 0;
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const active = loginSet.has(dateStr) ? 1 : 0;
      cumulative += active;
      rows.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        active,
        cumulative,
      });
    }
    return rows;
  }, [loginSet]);

  const competencyBars = useMemo(
    () =>
      competencyStates.map((s) => ({
        name:
          s.competency.title.length > 18
            ? s.competency.title.slice(0, 16) + "…"
            : s.competency.title,
        level: levelMap[s.level] ?? 0,
        fullName: s.competency.title,
      })),
    [competencyStates]
  );

  const activeDays = activitySeries.filter((r) => r.active === 1).length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-6">
      <div className="space-y-1">
        <h2 className="text-base font-bold text-white">Learning activity (30 days)</h2>
        <p className="text-xs text-slate-400">
          Built from your account login history (synced with your progress).{" "}
          {activeDays === 0
            ? "No recorded active days in this window yet — study sessions will appear here."
            : `${activeDays} active day${activeDays === 1 ? "" : "s"} in the last 30 days.`}
        </p>
      </div>

      <div className="h-[220px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={activitySeries}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} interval="preserveStartEnd" />
            <YAxis stroke="#94a3b8" fontSize={10} domain={[0, "auto"]} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                value,
                name === "active" ? "Active that day" : "Cumulative active days",
              ]}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              name="cumulative"
              stroke="#818cf8"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="stepAfter"
              dataKey="active"
              name="active"
              stroke="#34d399"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {competencyBars.length > 0 && (
        <div className="space-y-2 border-t border-slate-800 pt-4">
          <h3 className="text-sm font-bold text-white">Current competency levels</h3>
          <p className="text-[11px] text-slate-500">
            Snapshot from your account — not a historical growth curve (time-series levels are not stored yet).
          </p>
          <div className="h-[180px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={competencyBars} layout="vertical" margin={{ left: 8, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" domain={[0, 4]} stroke="#94a3b8" fontSize={10} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={100} stroke="#94a3b8" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [value, "Level score"]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullName || ""
                  }
                />
                <Bar dataKey="level" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
