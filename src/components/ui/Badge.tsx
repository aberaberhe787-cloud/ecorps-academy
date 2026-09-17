import React from "react";

export type BadgeVariant = "neutral" | "blue" | "emerald" | "amber" | "rose" | "purple" | "indigo";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: "bg-slate-800/80 text-slate-300 border-slate-700/80",
  blue: "bg-blue-950/80 text-blue-300 border-blue-800/80",
  emerald: "bg-emerald-950/80 text-emerald-300 border-emerald-800/80",
  amber: "bg-amber-950/80 text-amber-300 border-amber-800/80",
  rose: "bg-rose-950/80 text-rose-300 border-rose-800/80",
  purple: "bg-purple-950/80 text-purple-300 border-purple-800/80",
  indigo: "bg-indigo-950/80 text-indigo-300 border-indigo-800/80",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px] font-mono font-medium rounded-md gap-1",
  md: "px-2.5 py-1 text-xs font-mono font-semibold rounded-lg gap-1.5",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "blue",
  size = "sm",
  icon,
  className = "",
  ...props
}) => {
  return (
    <span
      {...props}
      className={`inline-flex items-center border select-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};
