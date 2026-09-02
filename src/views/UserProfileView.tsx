import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Award, 
  CheckCircle2, 
  Flame, 
  Lock, 
  Star, 
  Trophy, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Download,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { auth } from '../lib/firebase';
import { BadgeComponent } from '../components/profile/BadgeComponent';
import { ProgressRing } from '../components/profile/ProgressRing';
import { FOUNDATION_LESSONS } from './PromptEngineeringPath';
import { curriculumModules } from '../data/lessonsData';
import { NavTab } from '../types';

export interface LearningPath {
  id: string;
  title: string;
  description?: string;
  targetTab: NavTab;
  lessons: { id: string; title: string; completed: boolean }[];
}

interface UserProfileViewProps {
  path?: LearningPath;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ path: customPath }) => {
  const { userProgress, setActiveTab } = useApp();
  
  // Build both tracks from system source data
  const foundationsTrack: LearningPath = {
    id: 'prompt-engineering-foundations',
    title: 'Prompt Engineering Foundations',
    description: '5 Core Prompting Principles, Delimitation & Latent Steering',
    targetTab: 'foundations',
    lessons: FOUNDATION_LESSONS.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      completed: userProgress.completedLessons.includes(lesson.id),
    })),
  };

  const comprehensiveCurriculumTrack: LearningPath = {
    id: 'advanced-ai-systems',
    title: 'Advanced Prompt Engineering & AI Systems',
    description: '10 In-Depth Modules across In-Context Reasoning & Red-Teaming',
    targetTab: 'curriculum',
    lessons: curriculumModules.flatMap((module) => module.lessons).map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      completed: userProgress.completedLessons.includes(lesson.id),
    })),
  };

  const availableTracks = [foundationsTrack, comprehensiveCurriculumTrack];
  const [selectedTrackId, setSelectedTrackId] = useState<string>(customPath?.id || foundationsTrack.id);

  const currentTrack = availableTracks.find((t) => t.id === selectedTrackId) || foundationsTrack;
  const completedCount = currentTrack.lessons.filter((l) => l.completed).length;
  const totalCount = currentTrack.lessons.length;
  const completionPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const isCurrentTrackComplete = totalCount > 0 && completedCount === totalCount;

  // Global Multi-Track Stats
  const totalCompletedLessonsAllTracks = userProgress.completedLessons.length;
  const totalLessonsAllTracks = foundationsTrack.lessons.length + comprehensiveCurriculumTrack.lessons.length;
  const foundationsComplete = foundationsTrack.lessons.every((l) => l.completed);
  const curriculumComplete = comprehensiveCurriculumTrack.lessons.every((l) => l.completed);
  const totalCertificatesEarned = (foundationsComplete ? 1 : 0) + (curriculumComplete ? 1 : 0);

  const userName = auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Ecorp Scholar';
  const photoUrl = auth.currentUser?.photoURL;
  const level = Math.floor(userProgress.xp / 500) + 1;

  const downloadCertificate = (track: LearningPath) => {
    const isTrackComplete = track.lessons.every((l) => l.completed);
    if (!isTrackComplete) return;

    const completionDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const isFoundations = track.id === 'prompt-engineering-foundations';
    const document = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageWidth = document.internal.pageSize.getWidth();
    const pageHeight = document.internal.pageSize.getHeight();

    // Background
    document.setFillColor(11, 17, 32);
    document.rect(0, 0, pageWidth, pageHeight, 'F');

    // Outer Border (Gold)
    document.setDrawColor(245, 158, 11);
    document.setLineWidth(1.5);
    document.rect(10, 10, pageWidth - 20, pageHeight - 20);

    // Inner Border (Blue for Advanced, Emerald for Foundations)
    if (isFoundations) {
      document.setDrawColor(16, 185, 129);
    } else {
      document.setDrawColor(59, 130, 246);
    }
    document.setLineWidth(0.8);
    document.rect(14, 14, pageWidth - 28, pageHeight - 28);

    // Header Branding
    document.setTextColor(245, 158, 11);
    document.setFontSize(12);
    document.text('ECORP ACADEMY OF ARTIFICIAL INTELLIGENCE', pageWidth / 2, 28, { align: 'center' });

    // Main Certificate Heading
    document.setTextColor(248, 250, 252);
    document.setFontSize(28);
    document.text(isFoundations ? 'CERTIFICATE OF MASTERY' : 'PROFESSIONAL CERTIFICATE', pageWidth / 2, 50, { align: 'center' });

    // Subtitle
    document.setTextColor(148, 163, 184);
    document.setFontSize(13);
    document.text('This official credential certifies that', pageWidth / 2, 68, { align: 'center' });

    // Scholar Name
    if (isFoundations) {
      document.setTextColor(52, 211, 153);
    } else {
      document.setTextColor(96, 165, 250);
    }
    document.setFontSize(24);
    document.text(userName, pageWidth / 2, 88, { align: 'center' });

    // Underline
    document.setDrawColor(148, 163, 184);
    document.setLineWidth(0.5);
    document.line(pageWidth / 2 - 60, 93, pageWidth / 2 + 60, 93);

    // Achievement Statement
    document.setTextColor(248, 250, 252);
    document.setFontSize(15);
    document.text(`has successfully fulfilled all curriculum requirements for`, pageWidth / 2, 110, { align: 'center' });

    // Track Title
    document.setTextColor(251, 191, 36);
    document.setFontSize(18);
    document.text(track.title, pageWidth / 2, 126, { align: 'center' });

    // Metrics & Details
    document.setTextColor(148, 163, 184);
    document.setFontSize(11);
    document.text(
      isFoundations 
        ? '5 Foundational In-Context Engineering Modules · Context Boundary Calibration · Latent Steering'
        : '10 In-Depth Interactive Modules · 5 Graded Missions · Red-Teaming CTF Lab Validation',
      pageWidth / 2,
      138,
      { align: 'center' }
    );

    // Issue Date & Verification ID
    const hash = Math.abs(userName.split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0)).toString(16).toUpperCase();
    const certCode = `ECORP-${isFoundations ? 'FND' : 'ADV'}-${hash.padStart(6, '0')}`;
    
    document.text(`Date Issued: ${completionDate}`, 30, 175);
    document.text(`Credential ID: ${certCode}`, 30, 183);

    // Signatures
    document.setTextColor(248, 250, 252);
    document.setFontSize(12);
    document.text('Ecorp Academy Academic Board', pageWidth - 85, 175);
    document.setTextColor(148, 163, 184);
    document.setFontSize(10);
    document.text('Authorized Verification Authority', pageWidth - 85, 183);

    document.save(`Ecorp_Academy_${track.id}_Certificate.pdf`);
  };

  return (
    <div className="app-view mx-auto max-w-5xl space-y-8 p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Learner Profile Header */}
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 md:flex-row shadow-xl">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl text-white font-bold shadow-lg shadow-blue-900/30">
          {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover" /> : userName[0]}
        </div>
        <div className="flex-1 text-center md:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-2xl font-black text-white">{userName}</h1>
            <span className="rounded-full bg-blue-950/80 border border-blue-800 px-3 py-0.5 text-xs font-semibold text-blue-300 font-mono">
              Level {level} Scholar
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Enrolled in Multi-Track Prompt Engineering & Applied AI Curriculum
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-4 md:justify-start text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
              <Flame className="h-4 w-4 text-orange-400" /> {userProgress.streakDays} Day Streak
            </span>
            <span className="flex items-center gap-1.5 text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
              <Star className="h-4 w-4 text-amber-400" /> {userProgress.xp} Total XP
            </span>
            <span className="flex items-center gap-1.5 text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> {totalCertificatesEarned}/2 Certificates
            </span>
          </div>
        </div>
        <div className="shrink-0">
          <ProgressRing progress={Math.min(100, (userProgress.xp % 500) / 5)} label="Level XP" />
        </div>
      </div>

      {/* Multi-Track Overview Cards */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-400" />
              Academic Credential Tracks
            </h2>
            <p className="text-xs text-slate-400">
              Select a learning track to inspect module mastery and claim verified certificates.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/60 px-3 py-1 rounded-lg border border-slate-700">
            Total Modules Mastered: {totalCompletedLessonsAllTracks} / {totalLessonsAllTracks}
          </span>
        </div>

        {/* Track Selection Tabs / Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableTracks.map((track) => {
            const isTrackCompleted = track.lessons.every((l) => l.completed);
            const compLessons = track.lessons.filter((l) => l.completed).length;
            const pct = Math.round((compLessons / track.lessons.length) * 100);
            const isSelected = selectedTrackId === track.id;

            return (
              <div
                key={track.id}
                onClick={() => setSelectedTrackId(track.id)}
                className={`cursor-pointer rounded-2xl border p-5 transition-all relative overflow-hidden ${
                  isSelected
                    ? 'border-blue-500 bg-gradient-to-b from-blue-950/40 to-slate-900 ring-1 ring-blue-500/50 shadow-lg'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-blue-400">
                      Track {track.id === 'prompt-engineering-foundations' ? '01' : '02'}
                    </span>
                    <h3 className="text-base font-bold text-white">{track.title}</h3>
                    <p className="text-xs text-slate-400">{track.description}</p>
                  </div>
                  {isTrackCompleted ? (
                    <span className="shrink-0 flex items-center gap-1 rounded-full bg-emerald-950 border border-emerald-700/80 px-2.5 py-1 text-[11px] font-bold text-emerald-300">
                      <Award className="h-3.5 w-3.5" /> Certified
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-slate-800 border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                      {compLessons}/{track.lessons.length} Done
                    </span>
                  )}
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Completion</span>
                    <span className={pct === 100 ? 'text-emerald-400 font-bold' : 'text-blue-300'}>{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        pct === 100 ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Selected Track Detail View & Certificate Download */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-blue-400">Active Syllabus</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400">{completedCount} of {totalCount} Modules Completed</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{currentTrack.title}</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab(currentTrack.targetTab)}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-950/60 border border-blue-800/80 px-3.5 py-2 rounded-xl transition-colors"
            >
              <span>Go to Track Lessons</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Module Checklist */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {currentTrack.lessons.map((lesson, idx) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-950/50 px-4 py-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-500 text-[11px]">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                {lesson.completed ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <Lock className="h-4 w-4 shrink-0 text-slate-600" />
                )}
                <span className={lesson.completed ? 'font-medium text-slate-200' : 'text-slate-400'}>
                  {lesson.title}
                </span>
              </div>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                lesson.completed 
                  ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60' 
                  : 'text-slate-500 bg-slate-900 border border-slate-800'
              }`}>
                {lesson.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
          ))}
        </div>

        {/* Certificate Claim & Action Banner */}
        <div className="rounded-xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className={`h-4 w-4 ${isCurrentTrackComplete ? 'text-amber-400' : 'text-slate-500'}`} />
              {isCurrentTrackComplete
                ? `Verified ${currentTrack.title} Certificate Unlocked!`
                : `Complete all ${totalCount} modules to unlock certificate`}
            </h3>
            <p className="text-xs text-slate-400">
              {isCurrentTrackComplete
                ? 'Your credential is authenticated and ready to export as an official PDF.'
                : `${totalCount - completedCount} module${totalCount - completedCount === 1 ? '' : 's'} left to unlock this verified credential.`}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isCurrentTrackComplete ? (
              <button
                type="button"
                onClick={() => downloadCertificate(currentTrack)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-5 py-3 font-bold text-xs sm:text-sm text-slate-950 shadow-lg shadow-amber-950/50 hover:brightness-110 active:scale-95 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Download Verified Certificate (PDF)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab(currentTrack.targetTab)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 font-bold text-xs sm:text-sm text-white shadow-lg transition-all"
              >
                <span>Continue Learning</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Achievements & Credential Badges */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
          <h2 className="flex items-center gap-2 text-base font-bold text-white">
            <Award className="text-purple-400 h-5 w-5" /> 
            <span>Mastery Achievements</span>
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {userProgress.achievements && userProgress.achievements.length > 0 ? (
              userProgress.achievements.map((achievement) => (
                <BadgeComponent key={achievement.id} achievement={achievement} />
              ))
            ) : (
              <p className="col-span-full text-xs text-slate-500 py-4 text-center">
                No achievements unlocked yet. Complete lessons and quizzes to earn badges!
              </p>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
          <h2 className="flex items-center gap-2 text-base font-bold text-white">
            <Trophy className="text-amber-400 h-5 w-5" /> 
            <span>Credential Portfolio</span>
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className={`h-4 w-4 ${foundationsComplete ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <div className="font-bold text-white">Foundations of Prompt Engineering</div>
                  <div className="text-[11px] text-slate-400">5 Foundational Modules</div>
                </div>
              </div>
              <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                foundationsComplete 
                  ? 'text-emerald-300 bg-emerald-950 border border-emerald-800' 
                  : 'text-slate-400 bg-slate-800'
              }`}>
                {foundationsComplete ? 'Certified' : `${foundationsTrack.lessons.filter(l=>l.completed).length}/5`}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-950/60 text-xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className={`h-4 w-4 ${curriculumComplete ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div>
                  <div className="font-bold text-white">Advanced AI Systems & Prompting</div>
                  <div className="text-[11px] text-slate-400">10 Comprehensive Modules</div>
                </div>
              </div>
              <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                curriculumComplete 
                  ? 'text-emerald-300 bg-emerald-950 border border-emerald-800' 
                  : 'text-slate-400 bg-slate-800'
              }`}>
                {curriculumComplete ? 'Certified' : `${comprehensiveCurriculumTrack.lessons.filter(l=>l.completed).length}/10`}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

