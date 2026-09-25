import React, { useState } from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { Lesson } from '../../types';

interface LearningTimelineProps {
  allLessons: Lesson[];
  completedLessonIds: string[];
}

export const LearningTimeline: React.FC<LearningTimelineProps> = ({ allLessons, completedLessonIds }) => {
  const [hoveredLesson, setHoveredLesson] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-blue-400" />
        Learning Journey
      </h3>
      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {allLessons.map((lesson) => {
          const isCompleted = completedLessonIds.includes(lesson.id);
          return (
            <div 
              key={lesson.id} 
              className="relative flex items-center gap-4 group"
              onMouseEnter={() => setHoveredLesson(lesson.id)}
              onMouseLeave={() => setHoveredLesson(null)}
            >
              <div className={`absolute -left-[30px] rounded-full p-1 border ${isCompleted ? 'bg-emerald-950 border-emerald-700' : 'bg-slate-900 border-slate-700'}`}>
                {isCompleted ? <CheckCircle2 className="h-3 w-3 text-emerald-400" /> : <Lock className="h-3 w-3 text-slate-600" />}
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 w-full relative">
                <p className={`text-xs ${isCompleted ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>{lesson.title}</p>
                
                {isCompleted && hoveredLesson === lesson.id && (
                  <div className="absolute left-0 -top-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap border border-slate-700">
                    Completed on: {new Date().toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
