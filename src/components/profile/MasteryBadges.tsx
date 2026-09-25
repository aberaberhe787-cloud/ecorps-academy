import React from 'react';
import { Award } from 'lucide-react';
import { CompetencyState } from '../../types';

export const MasteryBadges: React.FC<{ competencyStates: CompetencyState[] }> = ({ competencyStates }) => {
  const mastered = competencyStates.filter(s => s.level === 'Mastered');

  if (mastered.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-4">
      {mastered.map(state => (
        <div key={state.competency.id} className="flex items-center gap-2 bg-amber-950/40 border border-amber-800 text-amber-300 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
          <Award className="h-4 w-4" />
          {state.competency.title} Master
        </div>
      ))}
    </div>
  );
};
