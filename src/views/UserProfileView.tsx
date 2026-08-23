import React from 'react';
import { jsPDF } from 'jspdf';
import { Award, CheckCircle2, Flame, Lock, Star, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { auth } from '../lib/firebase';
import { BadgeComponent } from '../components/profile/BadgeComponent';
import { ProgressRing } from '../components/profile/ProgressRing';

export interface LearningPath {
  id: string;
  title: string;
  lessons: { id: string; title: string; completed: boolean }[];
}

interface UserProfileViewProps {
  path: LearningPath;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ path }) => {
  const { userProgress } = useApp();
  const completedCount = path.lessons.filter((lesson) => lesson.completed).length;
  const totalCount = path.lessons.length;
  const completionPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const isComplete = totalCount > 0 && completedCount === totalCount;
  const userName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Ecorp Scholar';
  const photoUrl = auth.currentUser?.photoURL;
  const level = Math.floor(userProgress.xp / 500) + 1;

  const downloadCertificate = () => {
    if (!isComplete) return;
    const completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const document = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = document.internal.pageSize.getWidth();
    const pageHeight = document.internal.pageSize.getHeight();

    document.setFillColor(15, 23, 42);
    document.rect(0, 0, pageWidth, pageHeight, 'F');
    document.setDrawColor(245, 158, 11);
    document.setLineWidth(1.5);
    document.rect(10, 10, pageWidth - 20, pageHeight - 20);
    document.setTextColor(245, 158, 11);
    document.setFontSize(12);
    document.text('ECORP ACADEMY', pageWidth / 2, 32, { align: 'center' });
    document.setTextColor(248, 250, 252);
    document.setFontSize(30);
    document.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 58, { align: 'center' });
    document.setTextColor(148, 163, 184);
    document.setFontSize(14);
    document.text('This certifies that', pageWidth / 2, 78, { align: 'center' });
    document.setTextColor(96, 165, 250);
    document.setFontSize(24);
    document.text(userName, pageWidth / 2, 98, { align: 'center' });
    document.setTextColor(248, 250, 252);
    document.setFontSize(16);
    document.text(`has successfully completed ${path.title}`, pageWidth / 2, 120, { align: 'center' });
    document.setTextColor(148, 163, 184);
    document.setFontSize(12);
    document.text(`${completedCount}/${totalCount} lessons completed`, pageWidth / 2, 138, { align: 'center' });
    document.text(`Completed on ${completionDate}`, pageWidth / 2, 158, { align: 'center' });
    document.save(`Ecorp_Academy_${path.id}_Certificate.pdf`);
  };

  return (
    <div className="app-view mx-auto max-w-4xl space-y-8 p-6">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:flex-row">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl text-white">{photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover" /> : userName[0]}</div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-white">{userName}</h1>
          <p className="text-blue-300">Prompt Engineer • Level {level}</p>
          <div className="mt-2 flex justify-center gap-4 md:justify-start">
            <span className="flex items-center gap-1 text-slate-400"><Flame className="h-4 w-4 text-orange-500" /> {userProgress.streakDays} day streak</span>
            <span className="flex items-center gap-1 text-slate-400"><Star className="h-4 w-4 text-amber-500" /> {userProgress.xp} Total XP</span>
          </div>
        </div>
        <ProgressRing progress={Math.min(100, (userProgress.xp % 500) / 5)} label="Level Progress" />
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div><h2 className="text-xl font-bold text-white">{path.title}</h2><p className="text-sm text-slate-400">{completedCount}/{totalCount} lessons completed</p></div>
          <span className="text-sm font-semibold text-blue-300">{completionPercent}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-700" role="progressbar" aria-valuenow={completionPercent} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${completionPercent}%` }} />
        </div>
        <ul className="mt-6 space-y-3">
          {path.lessons.map((lesson) => <li key={lesson.id} className="flex items-center gap-3 rounded-lg border border-slate-800 px-4 py-3">
            {lesson.completed ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" /> : <Lock className="h-5 w-5 shrink-0 text-slate-500" />}
            <span className={lesson.completed ? 'text-slate-200' : 'text-slate-400'}>{lesson.title}</span>
            <span className="ml-auto text-xs text-slate-500">{lesson.completed ? 'Completed' : 'Locked'}</span>
          </li>)}
        </ul>
        <button type="button" onClick={downloadCertificate} disabled={!isComplete} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500">
          {isComplete ? <Award className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          {isComplete ? 'Download Certificate' : 'Complete all lessons to unlock'}
        </button>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white"><Award className="text-purple-400" /> Achievements</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {userProgress.achievements.length > 0 ? userProgress.achievements.map((achievement) => <BadgeComponent key={achievement.id} achievement={achievement} />) : <p className="col-span-full text-slate-500">No achievements yet. Keep learning!</p>}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white"><Trophy className="text-amber-400" /> Certification Status</h2>
          <p className="text-slate-400">{isComplete ? 'This learning path is complete.' : `${totalCount - completedCount} lesson${totalCount - completedCount === 1 ? '' : 's'} remaining.`}</p>
        </section>
      </div>
    </div>
  );
};
