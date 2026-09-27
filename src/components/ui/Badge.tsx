import React from "react";

export type BadgeVariant = "neutral" | "blue" | "emerald" | "amber" | "rose" | "purple" | "indigo";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  neutral: "bg-slate-800/70 text-slate-300 border-slate-700/70",
  blue: "bg-indigo-950/80 text-indigo-300 border-indigo-700/50",
  emerald: "bg-emerald-950/70 text-emerald-300 border-emerald-700/50",
  amber: "bg-amber-950/70 text-amber-300 border-amber-700/50",
  rose: "bg-rose-950/70 text-rose-300 border-rose-700/50",
  purple: "bg-purple-950/70 text-purple-300 border-purple-700/50",
  indigo: "bg-indigo-950/80 text-indigo-200 border-indigo-600/40",
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[11px] font-mono font-medium rounded-md gap-1",
  md: "px-2.5 py-1 text-xs font-mono font-semibold rounded-lg gap-1.5",
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "indigo",
  size = "sm",
  icon,
  className = "",
  ...props
}) => {
  return (
    <span
      {...props}
      className={`inline-flex items-center border select-none max-w-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate">{children}</span>
    </span>
  );
};
