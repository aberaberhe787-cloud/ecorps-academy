import React from 'react';

interface ProgressRingProps {
  progress: number;
  label: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ progress, label }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative flex items-center justify-center">
        <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 64 64">
          <circle
            className="text-slate-800"
            strokeWidth="4"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="32"
            cy="32"
          />
          <circle
            className="text-blue-500 transition-all duration-1000 ease-out"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="32"
            cy="32"
          />
        </svg>
        <div className="absolute text-xs font-bold text-white">
          {Math.round(progress)}%
        </div>
      </div>
      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
};
