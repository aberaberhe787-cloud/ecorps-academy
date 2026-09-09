import React from 'react';
import { Award, Star, Zap, Code2, Target, ShieldCheck, Cpu, Flame, Trophy, CheckCircle2, Lock } from 'lucide-react';
import { Achievement } from '../../types';

interface BadgeComponentProps {
  achievement: Achievement;
  isLocked?: boolean;
}

const ICON_MAP: Record<string, React.FC<any>> = {
  'first-lesson': Trophy,
  'first-prompt': Zap,
  'streak-3': Target,
  'streak-7': Flame,
  'streak-10': Trophy,
  'sandbox-1': Code2,
  'sandbox-2': Code2,
  'sandbox-3': Code2,
  'module-1-master': ShieldCheck,
  'module-2-master': Award,
  'perfect-assessment': ShieldCheck,
  'level-up': Award,
  'halfway-scholar': Award,
  'prompt-architect': Trophy,
  'ai-master': Cpu,
  'default': Star,
};

export const BadgeComponent: React.FC<BadgeComponentProps> = ({ achievement, isLocked = false }) => {
  const Icon = ICON_MAP[achievement.id] || ICON_MAP['default'];

  if (isLocked) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-800/60 bg-slate-950/40 p-3 text-center opacity-60 transition-all hover:opacity-80">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-500">
          <Icon className="h-5 w-5" />
          <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-slate-400">
            <Lock className="h-2.5 w-2.5" />
          </div>
        </div>
        <div>
          <h4 className="text-[11px] font-bold text-slate-300">{achievement.title}</h4>
          <p className="mt-1 text-[9px] text-slate-500 leading-tight">{achievement.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex flex-col items-center gap-2 rounded-xl border border-amber-500/30 bg-gradient-to-b from-slate-900 to-amber-950/20 p-3 text-center transition-all hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
        <Icon className="h-5 w-5" />
        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow">
          <CheckCircle2 className="h-3 w-3" />
        </div>
      </div>
      <div>
        <h4 className="text-[11px] font-bold text-white group-hover:text-amber-300 transition-colors">
          {achievement.title}
        </h4>
        <p className="mt-1 text-[9px] text-slate-300 leading-tight">{achievement.description}</p>
        {achievement.earnedAt && (
          <span className="mt-1.5 block text-[8px] font-mono text-amber-400/80">
            Unlocked {new Date(achievement.earnedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
          </span>
        )}
      </div>
    </div>
  );
};

