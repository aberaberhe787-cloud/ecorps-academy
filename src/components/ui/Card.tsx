import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { hoverLift, tapScale } from "../../lib/motionPresets";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive" | "accent";
  padding?: "none" | "sm" | "md" | "lg";
}

const variantStyles = {
  default:
    "bg-slate-900/70 border-slate-800/90 text-slate-100 shadow-sm backdrop-blur-sm",
  elevated:
    "bg-slate-900/85 border-slate-700/70 shadow-xl shadow-black/20 text-slate-100 backdrop-blur-md",
  interactive:
    "bg-slate-900/70 border-slate-800/90 hover:border-indigo-500/40 hover:bg-slate-900/90 text-slate-100 transition-colors cursor-pointer shadow-sm hover:shadow-lg hover:shadow-indigo-950/20",
  accent:
    "bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-indigo-950/40 border-indigo-500/25 text-slate-100 shadow-xl shadow-indigo-950/20",
};

const paddingStyles = {
  none: "p-0",
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5 lg:p-6",
  lg: "p-4 sm:p-6 lg:p-8",
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "md",
  className = "",
  ...props
}) => {
  const reduceMotion = useReducedMotion();
  const base = `rounded-2xl border min-w-0 ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`;

  // Micro-interaction only on interactive cards (primary clickable surfaces)
  if (variant === "interactive" && !reduceMotion) {
    const { onDrag: _d, onDragStart: _ds, onDragEnd: _de, ...rest } = props as any;
    return (
      <motion.div
        {...rest}
        className={base}
        whileHover={hoverLift}
        whileTap={tapScale}
        transition={{ duration: 0.15 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div {...props} className={base}>
      {children}
    </div>
  );
};
