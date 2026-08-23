import React from "react";
import { Terminal } from "lucide-react";

interface EcorpLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export const EcorpLogo: React.FC<EcorpLogoProps> = ({
  className = "",
  size = "md",
  showText = false,
}) => {
  const sizeClasses = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`relative overflow-hidden rounded-xl bg-gradient-to-b from-blue-950/80 to-slate-950 border border-blue-500/30 p-0.5 shadow-md shadow-blue-900/30 flex items-center justify-center flex-shrink-0 ${sizeClasses[size]}`}
      >
        <Terminal className="h-full w-full p-1.5 text-blue-400 drop-shadow transition-all hover:scale-110" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-mono text-base font-extrabold tracking-wider text-white">
            ECORP <span className="text-blue-400 font-bold">ACADAMY</span>
          </span>
          <span className="text-[10px] text-slate-400 tracking-wide font-sans">
            Prompt Engineering & AI Systems
          </span>
        </div>
      )}
    </div>
  );
};
