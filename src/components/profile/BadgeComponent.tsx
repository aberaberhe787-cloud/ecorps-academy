import React from 'react';
import { Achievement } from '../../types';

interface BadgeProps {
  achievement: Achievement;
}

export const BadgeComponent: React.FC<BadgeProps> = ({ achievement }) => {
  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-slate-800 rounded-xl border border-slate-700">
      <span className="text-3xl">{achievement.icon}</span>
      <span className="text-xs font-semibold text-slate-200">{achievement.title}</span>
    </div>
  );
};
