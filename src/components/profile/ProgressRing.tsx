import React from 'react';

interface ProgressRingProps {
  progress: number; // 0 to 100
  label: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ progress, label }) => {
  const stroke = 8;
  const radius = 40 - stroke;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg className="w-20 h-20" viewBox="0 0 80 80">
        <circle
          className="text-slate-700"
          strokeWidth={stroke}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="40"
          cy="40"
        />
        <circle
          className="text-blue-500 transition-all duration-500 ease-out"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="40"
          cy="40"
          transform="rotate(-90 40 40)"
        />
      </svg>
      <span className="text-xs font-bold text-slate-300">{label}: {Math.round(progress)}%</span>
    </div>
  );
};
