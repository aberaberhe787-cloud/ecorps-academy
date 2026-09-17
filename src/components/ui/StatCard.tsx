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
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
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
      className={`rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 flex items-center gap-3.5 shadow-md ${className}`}
    >
      {icon && (
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconBgMap[variant]}`}
        >
          {icon}
        </div>
      )}
      <div className="space-y-0.5 min-w-0 flex-1">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block truncate">
          {label}
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
            {value}
          </span>
          {subValue && (
            <span className="text-xs text-slate-400 font-mono truncate">
              {subValue}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
