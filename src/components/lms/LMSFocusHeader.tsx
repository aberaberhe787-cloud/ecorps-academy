import React from "react";
import {
  ArrowLeft,
  Flame,
  Maximize2,
  Minimize2,
  Bookmark
} from "lucide-react";
import { Lesson, CurriculumModule } from "../../types";

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
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export const LMSFocusHeader: React.FC<LMSFocusHeaderProps> = ({
  currentLesson,
  currentModule,
  progressPercent,
  streakDays,
  isDistractionFree,
  onToggleDistractionFree,
  onExitLesson,
  isBookmarked,
  onToggleBookmark,
}) => {
  return (
    <div
      id="lms-focus-header"
      className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm safe-top"
    >
      <div className="mx-auto flex max-w-7xl 2xl:max-w-[1536px] items-center justify-between gap-2 sm:gap-3 min-w-0 w-full">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            id="exit-lesson-btn"
            onClick={onExitLesson}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:text-white transition-all shrink-0 min-h-[36px] cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </button>

          <div className="min-w-0 truncate">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-900 shrink-0">
                {currentModule?.code || "MODULE"}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                {currentLesson.title}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Clean Progress */}
        <div className="hidden md:flex flex-col items-center justify-center w-40 lg:w-48 min-w-0 shrink">
          <div className="flex justify-between w-full text-xs font-mono text-slate-400 mb-1">
            <span>Progress</span>
            <span className="text-blue-400 font-bold">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>

        {/* Right: Streak, Bookmark, Focus Mode */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Streak Indicator (Calm, no ping) */}
          <div className="flex items-center gap-1 rounded-lg bg-orange-500/10 border border-orange-500/20 px-2 py-1 text-xs font-semibold text-orange-400">
            <Flame className="h-3.5 w-3.5 text-orange-400 fill-orange-400/20" />
            <span className="font-mono">{streakDays}d</span>
          </div>

          {/* Bookmark Button */}
          {onToggleBookmark && (
            <button
              id="lms-focus-bookmark-btn"
              onClick={onToggleBookmark}
              title={isBookmarked ? "Remove bookmark" : "Bookmark lesson"}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                isBookmarked
                  ? "border-amber-500/60 bg-amber-950/60 text-amber-300"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
              <span className="hidden sm:inline">{isBookmarked ? "Saved" : "Save"}</span>
            </button>
          )}

          {/* Focus Mode Toggle */}
          <button
            id="toggle-distraction-free-btn"
            onClick={onToggleDistractionFree}
            title={isDistractionFree ? "Exit Focus" : "Enter Focus"}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
              isDistractionFree
                ? "border-blue-500 bg-blue-950 text-blue-300"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            }`}
          >
            {isDistractionFree ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span className="text-xs">Exit Focus</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="text-xs">Enter Focus</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
