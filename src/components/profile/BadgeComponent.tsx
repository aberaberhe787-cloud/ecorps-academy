import React from 'react';
import { Award, Star, Zap, Code2, Target, ShieldCheck, Cpu, Flame } from 'lucide-react';
import { Achievement } from '../../types';

interface BadgeComponentProps {
  achievement: Achievement;
}

const ICON_MAP: Record<string, React.FC<any>> = {
  'first-prompt': Zap,
  'sandbox-1': Code2,
  'sandbox-2': Code2,
  'sandbox-3': Code2,
  'streak-3': Target,
  'streak-7': Flame,
  'perfect-assessment': ShieldCheck,
  'level-up': Award,
  'ai-master': Cpu,
  'default': Star,
};

export const BadgeComponent: React.FC<BadgeComponentProps> = ({ achievement }) => {
  const Icon = ICON_MAP[achievement.id] || ICON_MAP['default'];

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-center transition-all hover:bg-slate-900">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h4 className="text-[11px] font-bold text-white">{achievement.title}</h4>
        <p className="mt-1 text-[9px] text-slate-400 leading-tight">{achievement.description}</p>
      </div>
    </div>
  );
};
