import React from 'react';
import { X, User, Flame, BookOpen, Target, Award, Trophy, Sparkles, ChevronRight, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BadgeComponent } from './BadgeComponent';
import { ProgressRing } from './ProgressRing';
import { CertificateGenerator } from '../CertificateGenerator';

interface ProfilePanelProps {
  onClose: () => void;
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ onClose }) => {
  const { userProgress, currentCurriculum, logout } = useApp();
  const allLessons = currentCurriculum.flatMap((m) => m.lessons);
  const completionPercent = Math.round(
    (userProgress.completedLessons.length / allLessons.length) * 100
  );

  const level = Math.floor(userProgress.xp / 500) + 1;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-sm h-full bg-slate-950 border-l border-slate-800 overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 p-6 pb-8">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-4 mt-2">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Ecorp Scholar</h2>
              <p className="text-xs text-blue-300 font-mono">Prompt Engineer</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Flame className="h-3.5 w-3.5 text-orange-400" />
                <span className="text-xs text-slate-300">{userProgress.streakDays} day streak</span>
              </div>
            </div>
          </div>
          
          <div className="mt-5">
            <div className="flex justify-between text-[11px] font-mono mb-1.5">
              <span className="text-slate-300">Level {level} Progress</span>
              <span className="text-blue-300">{userProgress.xp % 500}/500 XP</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400" style={{ width: `${(userProgress.xp % 500) / 5}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-px bg-slate-800 border-b border-slate-800">
           <div className="bg-slate-950 py-3 px-2 text-center">
              <div className="text-amber-400 font-extrabold font-mono">{userProgress.xp}</div>
              <div className="text-[10px] text-slate-500">Total XP</div>
           </div>
           <div className="bg-slate-950 py-3 px-2 text-center">
              <div className="text-blue-400 font-extrabold font-mono">{userProgress.completedLessons.length}</div>
              <div className="text-[10px] text-slate-500">Lessons</div>
           </div>
           <div className="bg-slate-950 py-3 px-2 text-center">
              <div className="text-emerald-400 font-extrabold font-mono">{userProgress.completedMissions.length}</div>
              <div className="text-[10px] text-slate-500">Missions</div>
           </div>
        </div>

        <div className="p-4 border-b border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-purple-400" />
            Curriculum Progress
          </h3>
          <ProgressRing progress={completionPercent} label="Mastery" />
        </div>

        <div className="p-4">
          <button
            type="button"
            onClick={async () => {
              console.log('ProfilePanel: logout button clicked');
              try {
                await logout();
                console.log('ProfilePanel: logout resolved');
              } catch (err) {
                console.error('Logout failed:', err);
              } finally {
                console.log('ProfilePanel: closing panel');
                onClose();
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-900/60 px-4 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-950/40"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>

        <div className="p-4 border-b border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            Achievement Badges
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {userProgress.achievements.map((ach) => (
              <BadgeComponent key={ach.id} achievement={ach} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
