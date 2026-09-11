import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 -mt-1 border-t-slate-900 dark:border-t-slate-800",
    bottom: "bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-slate-900 dark:border-b-slate-800",
    left: "left-full top-1/2 -translate-y-1/2 -ml-1 border-l-slate-900 dark:border-l-slate-800",
    right: "right-full top-1/2 -translate-y-1/2 -mr-1 border-r-slate-900 dark:border-r-slate-800",
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children ? (
        children
      ) : (
        <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-slate-200 cursor-help transition-colors" />
      )}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className={`absolute z-50 w-48 p-2 text-[10px] font-medium leading-relaxed rounded-lg border shadow-xl pointer-events-none bg-slate-900 border-slate-800 text-slate-200 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 ${positionClasses[position]} ${className}`}
            role="tooltip"
          >
            {content}
            <div
              className={`absolute h-0 w-0 border-4 border-transparent ${arrowClasses[position]}`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
