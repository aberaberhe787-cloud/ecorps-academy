import React from "react";

export interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  variant?: "neutral" | "blue" | "emerald" | "amber" | "orange";
  className?: string;
}

const iconBgMap = {
  neutral: "bg-slate-800 text-slate-300 border-slate-700",
  blue: "bg-indigo-500/15 text-indigo-300 border-indigo-500/25",
  emerald: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  orange: "bg-orange-500/15 text-orange-300 border-orange-500/25",
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  variant = "neutral",
  className = "",
}) => {
  return (
    <div
      className={`rounded-2xl border border-slate-800/80 bg-slate-900/70 p-3.5 sm:p-5 flex items-center gap-3 sm:gap-3.5 shadow-sm backdrop-blur-sm min-w-0 ${className}`}
    >
      {icon && (
        <div
          className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border ${iconBgMap[variant]}`}
        >
          {icon}
        </div>
      )}
      <div className="space-y-0.5 min-w-0 flex-1">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block truncate">
          {label}
        </span>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0">
          <span className="text-base sm:text-lg font-bold text-white tracking-tight break-all">
            {value}
          </span>
          {subValue && (
            <span className="text-xs text-slate-400 font-mono break-words">
              {subValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
