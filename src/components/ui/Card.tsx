import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive" | "accent";
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles = {
  default: "bg-slate-900/80 border-slate-800 text-slate-100",
  elevated: "bg-slate-900 border-slate-800 shadow-xl text-slate-100",
  interactive:
    "bg-slate-900/80 border-slate-800 hover:border-blue-500/40 hover:bg-slate-900 text-slate-100 transition-all cursor-pointer shadow-md",
  accent:
    "bg-gradient-to-r from-slate-900 via-slate-900/95 to-blue-950/40 border-blue-500/20 text-slate-100 shadow-xl",
};

const paddingStyles = {
  none: "p-0",
  sm: "p-3.5 sm:p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "md",
  className = "",
  ...props
}) => {
  return (
    <div
      {...props}
      className={`rounded-2xl border ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
};
