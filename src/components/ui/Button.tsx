import React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-lg shadow-indigo-950/50 border-transparent ring-1 ring-white/15 bg-gradient-to-b from-indigo-500 to-indigo-600",
  secondary:
    "bg-slate-800/90 text-slate-100 hover:bg-slate-700 active:bg-slate-800 border-slate-700/80 shadow-sm",
  outline:
    "bg-transparent text-slate-200 hover:bg-slate-800/70 hover:text-white border-slate-700/80 active:bg-slate-800",
  ghost:
    "bg-transparent text-slate-400 hover:text-white hover:bg-slate-800/50 border-transparent",
  danger:
    "bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 border-transparent shadow-md shadow-rose-950/30",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700 border-transparent shadow-md shadow-emerald-950/30",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg min-h-[32px] gap-1.5",
  md: "px-4 py-2 text-xs sm:text-sm rounded-xl min-h-[40px] gap-2 font-semibold",
  lg: "px-6 py-3 text-sm rounded-xl min-h-[48px] gap-2.5 font-bold",
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center border font-medium transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none max-w-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {isLoading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
      ) : (
        <>
          {icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
          <span className="min-w-0 truncate">{children}</span>
          {icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
};
