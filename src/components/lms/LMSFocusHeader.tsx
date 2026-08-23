import React from "react";
import {
  ArrowLeft,
  Sparkles,
  Flame,
  Maximize2,
  Minimize2,
  CheckCircle2,
  GraduationCap,
  Award
} from "lucide-react";
import { Lesson, CurriculumModule } from "../../types";
import { EcorpLogo } from "../EcorpLogo";

interface LMSFocusHeaderProps {
  currentLesson: Lesson;
  currentModule?: CurriculumModule;
  progressPercent: number;
  isCompleted: boolean;
  streakDays: number;
  totalXp: number;
  isDistractionFree: boolean;
  onToggleDistractionFree: () => void;
  onExitLesson: () => void;
}

export const LMSFocusHeader: React.FC<LMSFocusHeaderProps> = ({
  currentLesson,
  currentModule,
  progressPercent,
  isCompleted,
  streakDays,
  totalXp,
  isDistractionFree,
  onToggleDistractionFree,
  onExitLesson,
}) => {
  return (
    <div
      id="lms-focus-header"
      className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-3 shadow-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        {/* Left: Exit button & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            id="exit-lesson-btn"
            onClick={onExitLesson}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-blue-500 hover:bg-slate-800 hover:text-white transition-all shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Syllabus Overview</span>
            <span className="sm:hidden">Exit</span>
          </button>

          <div className="min-w-0 truncate">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-blue-400 bg-blue-950 px-1.5 py-0.2 rounded border border-blue-800/60 shrink-0">
                {currentModule?.code || "MODULE"}
              </span>
              <span className="text-xs font-bold text-white truncate">
                {currentLesson.title}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Interactive Lesson Progress Bar (on medium+ screens) */}
        <div className="hidden md:flex flex-col items-center justify-center w-64">
          <div className="flex justify-between w-full text-[10px] font-mono text-slate-400 mb-1">
            <span>Lesson Mastery:</span>
            <span className="text-blue-400 font-bold">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Streak, XP, and Distraction-free toggle */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Streak */}
          <div className="flex items-center gap-1 rounded-lg bg-orange-500/10 border border-orange-500/30 px-2.5 py-1 text-xs font-semibold text-orange-300">
            <Flame className="h-3.5 w-3.5 text-orange-400 fill-orange-400/20" />
            <span>{streakDays}d Streak</span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-semibold text-amber-300 font-mono">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>{totalXp} XP</span>
          </div>

          {/* Distraction Free Toggle */}
          <button
            id="toggle-distraction-free-btn"
            onClick={onToggleDistractionFree}
            title={isDistractionFree ? "Exit Distraction-Free Mode" : "Enter Distraction-Free Mode"}
            className={`hidden sm:flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
              isDistractionFree
                ? "border-blue-500 bg-blue-950 text-blue-300"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            {isDistractionFree ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span className="text-[11px]">Compact</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="text-[11px]">Focus Mode</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
