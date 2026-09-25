import React from 'react';
import { analyzeLessonComplexity, estimateMasteryTime } from '../../lib/complexity';
import { Lesson } from '../../types';
import { BookOpen, Timer } from 'lucide-react';

interface LessonSidebarProps {
  lesson: Lesson;
}

export const LessonSidebar: React.FC<LessonSidebarProps> = ({ lesson }) => {
  const complexity = analyzeLessonComplexity(lesson);
  const masteryTime = estimateMasteryTime(complexity);
  
  const complexityColors = {
    Easy: "bg-emerald-500",
    Intermediate: "bg-amber-500",
    Expert: "bg-rose-500",
  };
  
  const complexityBg = {
    Easy: "bg-emerald-950/80 text-emerald-300 border-emerald-700/50",
    Intermediate: "bg-amber-950/80 text-amber-300 border-amber-700/50",
    Expert: "bg-rose-950/80 text-rose-300 border-rose-700/50",
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl sticky top-24">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-blue-400" />
        Lesson Navigation
      </h3>
      
      <div className="space-y-4">
        <div>
          <span className="text-xs text-slate-400 font-medium">Depth-of-Worthiness</span>
          <div className={`mt-1 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold border ${complexityBg[complexity]}`}>
            {complexity}
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 font-mono uppercase">
              <span className="flex items-center gap-1">
                <Timer className="h-3 w-3" /> Est. Mastery
              </span>
              <span>{masteryTime}</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${complexityColors[complexity]} rounded-full`} style={{ width: complexity === 'Easy' ? '30%' : complexity === 'Intermediate' ? '60%' : '100%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
