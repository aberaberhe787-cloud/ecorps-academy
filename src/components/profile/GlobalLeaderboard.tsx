import React from 'react';
import { Trophy, User } from 'lucide-react';
import { CompetencyState, levelMap } from '../../types';

interface GlobalLeaderboardProps {
  userCompetencyStates: CompetencyState[];
}

// Mock global leaderboard data
const MOCK_LEADERBOARD = [
  { name: 'Dr. Aris Thorne', points: 38 },
  { name: 'Sarah Connor', points: 36 },
  { name: 'Ecorp Scholar (You)', points: 0 }, // Placeholder to be calculated
  { name: 'Marcus Wright', points: 34 },
  { name: 'Kyle Reese', points: 32 },
  { name: 'John Doe', points: 30 },
  { name: 'Alice Smith', points: 28 },
  { name: 'Bob Jones', points: 26 },
  { name: 'Charlie Brown', points: 24 },
  { name: 'Diana Prince', points: 22 },
];

export const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({ userCompetencyStates }) => {
  const userTotalPoints = userCompetencyStates.reduce((sum, s) => sum + (levelMap[s.level] || 0), 0);
  
  const leaderboard = MOCK_LEADERBOARD.map(item => 
    item.name === 'Ecorp Scholar (You)' ? { ...item, points: userTotalPoints } : item
  ).sort((a, b) => b.points - a.points);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
      <h2 className="text-base font-bold text-white flex items-center gap-2">
        <Trophy className="text-amber-400 h-5 w-5" />
        Global Leaderboard
      </h2>
      <div className="space-y-2">
        {leaderboard.map((learner, index) => (
          <div 
            key={learner.name} 
            className={`flex items-center justify-between p-2 rounded-lg text-xs ${
              learner.name === 'Ecorp Scholar (You)' ? 'bg-blue-950/40 border border-blue-900/50' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`font-mono font-bold ${index < 3 ? 'text-amber-400' : 'text-slate-500'}`}>#{index + 1}</span>
              <span className={learner.name === 'Ecorp Scholar (You)' ? 'font-bold text-blue-300' : 'text-slate-300'}>{learner.name}</span>
            </div>
            <span className="font-mono font-bold text-slate-300">{learner.points} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
};
