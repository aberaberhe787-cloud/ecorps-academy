import React from "react";

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "blue" | "emerald" | "amber" | "gradient";
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizeMap = {
  sm: "h-1.5",
  md: "h-2",
  lg: "h-3",
};

const variantMap = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  gradient: "bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500",
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = "md",
  variant = "blue",
  showLabel = false,
  label,
  className = "",
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>{label || "Progress"}</span>
          <span className="font-bold text-slate-200">{percentage}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full overflow-hidden rounded-full bg-slate-800 ${sizeMap[size]}`}
      >
        <div
          className={`h-full transition-all duration-300 ${variantMap[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
