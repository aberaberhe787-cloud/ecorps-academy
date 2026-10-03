import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Layers,
  Target,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { CurriculumView } from "./CurriculumView";
import { PromptEngineeringPath } from "./PromptEngineeringPath";
import { FOUNDATION_LESSONS, curriculumModules } from "../data/lessonsData";
import { Button } from "../components/ui/Button";

export type LearningTrackId = "foundations" | "systems";

const TRACKS: {
  id: LearningTrackId;
  title: string;
  audience: string;
  outcome: string;
  duration: string;
  level: string;
}[] = [
  {
    id: "foundations",
    title: "Prompt Engineering Foundations",
    audience: "New learners",
    outcome: "Clear tasks, roles, constraints, and iteration habits",
    duration: "~1 hour",  // matches module-0 estimatedTotalHours ~0.8
    level: "Beginner",
  },
  {
    id: "systems",
    title: "AI Systems & Applied Prompting",
    audience: "Practitioners moving past basics",
    outcome: "In-context mechanics, few-shot calibration, reasoning patterns, structured outputs",
    duration: "Self-paced",
    level: "Intermediate → Advanced",
  },
];

/**
 * Unified Learning Hub: Track → (Modules) → Lessons.
 * Foundations and Curriculum share one shell; lesson IDs and XP unchanged.
 */
export const LearningHubView: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    activeLessonId,
    setActiveLessonId,
    userProgress,
    isDistractionFreeMode,
  } = useApp();

  const [trackId, setTrackId] = useState<LearningTrackId>(() =>
    activeTab === "foundations" ? "foundations" : "systems"
  );

  // Deep-link: nav tab Foundations / Curriculum selects track
  useEffect(() => {
    if (activeTab === "foundations") setTrackId("foundations");
    if (activeTab === "curriculum") setTrackId("systems");
  }, [activeTab]);

  const foundationsDone = useMemo(
    () =>
      FOUNDATION_LESSONS.filter((l) =>
        userProgress.completedLessons.includes(l.id)
      ).length,
    [userProgress.completedLessons]
  );

  // Systems track owns module-1..3 only; module-0 is Foundations track exclusively.
  const systemsModules = useMemo(
    () => curriculumModules.filter((m) => m.id !== "module-0"),
    []
  );
  const systemsLessons = useMemo(
    () => systemsModules.flatMap((m) => m.lessons),
    [systemsModules]
  );
  const systemsDone = useMemo(
    () =>
      systemsLessons.filter((l) =>
        userProgress.completedLessons.includes(l.id)
      ).length,
    [userProgress.completedLessons, systemsLessons]
  );

  const hideChrome =
    isDistractionFreeMode && trackId === "systems" && Boolean(activeLessonId);

  const selectTrack = (id: LearningTrackId) => {
    setTrackId(id);
    // Keep lesson IDs intact; clear systems lesson focus when switching away
    if (id === "foundations") {
      setActiveLessonId(null);
      if (activeTab !== "foundations" && activeTab !== "curriculum") {
        setActiveTab("foundations");
      } else {
        setActiveTab("foundations");
      }
    } else {
      setActiveTab("curriculum");
    }
  };

  const activeTrack = TRACKS.find((t) => t.id === trackId) || TRACKS[0];
  const trackProgress =
    trackId === "foundations"
      ? { done: foundationsDone, total: FOUNDATION_LESSONS.length }
      : { done: systemsDone, total: systemsLessons.length };

  return (
    <div className="w-full max-w-full min-w-0">
      {!hideChrome && (
        <div className="page-shell page-shell--medium pt-3 sm:pt-5 pb-2 space-y-4">
          {/* Hub identity */}
          <header className="space-y-2 min-w-0">
            <p className="ec-section-label flex items-center gap-1.5 text-indigo-300">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              Learning Hub
            </p>
            <h1 className="ecorp-display text-2xl sm:text-3xl text-white">
              Structured tracks. Measurable skill.
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Choose Foundations or Systems, complete lessons in order, then practice in the sandbox.
              Progress and lesson IDs stay consistent across the platform.
            </p>
          </header>

          {/* Track picker — Level 2 of hub depth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TRACKS.map((track) => {
              const selected = trackId === track.id;
              const progress =
                track.id === "foundations"
                  ? { done: foundationsDone, total: FOUNDATION_LESSONS.length }
                  : { done: systemsDone, total: systemsLessons.length };
              const pct =
                progress.total === 0
                  ? 0
                  : Math.round((progress.done / progress.total) * 100);

              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => selectTrack(track.id)}
                  className={`text-left rounded-2xl border p-4 sm:p-5 transition-colors cursor-pointer min-w-0 ${
                    selected
                      ? "border-indigo-500/45 bg-indigo-950/50 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-400/20"
                      : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="inline-flex text-[10px] font-mono font-semibold uppercase tracking-wide text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                      {track.level}
                    </span>
                    {track.id === "foundations" ? (
                      <Target className="h-4 w-4 text-indigo-300 shrink-0" aria-hidden="true" />
                    ) : (
                      <Layers className="h-4 w-4 text-indigo-300 shrink-0" aria-hidden="true" />
                    )}
                  </div>
                  <h2 className="font-bold text-white text-sm sm:text-base leading-snug">
                    {track.title}
                  </h2>
                  <ul className="mt-2 text-[11px] sm:text-xs text-slate-400 space-y-0.5">
                    <li>For: {track.audience}</li>
                    <li>Outcome: {track.outcome}</li>
                    <li>Time: {track.duration}</li>
                  </ul>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {progress.done}/{progress.total}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active track strip */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/60 px-3 sm:px-4 py-2.5">
            <div className="flex items-center gap-2 min-w-0 text-xs text-slate-300">
              <GraduationCap className="h-4 w-4 text-indigo-300 shrink-0" aria-hidden="true" />
              <span className="font-semibold text-white truncate">{activeTrack.title}</span>
              <span className="text-slate-500 hidden sm:inline">·</span>
              <span className="text-slate-500 font-mono shrink-0">
                {trackProgress.done}/{trackProgress.total} lessons
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trackId === "foundations" && foundationsDone >= FOUNDATION_LESSONS.length && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => selectTrack("systems")}
                  icon={<ArrowRight className="h-3.5 w-3.5" />}
                  iconPosition="right"
                >
                  Continue to Systems track
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab("playground")}
              >
                Practice in sandbox
              </Button>
            </div>
          </div>

          {/* Systems modules overview (when systems track, no lesson focused) */}
          {trackId === "systems" && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 leading-relaxed">
                <span className="font-semibold text-slate-300">Prerequisite: </span>
                Complete Foundations (module-0) first—or treat the opening Systems lesson
                (constraint bounding) as a rigorous review of clarity, then continue into
                delimiters and few-shot calibration.
              </p>
              <p className="text-xs text-slate-400 rounded-lg border border-indigo-500/20 bg-indigo-950/20 px-3 py-2 leading-relaxed">
                <span className="font-semibold text-indigo-200">Skill focus — Few-shot: </span>
                Module 1 lesson 3 covers label/format exemplars, order ablation, and retrieved
                few-shot. Module 2 extends the same idea to Chain-of-Thought (reasoning) demos.
              </p>
            </div>
          )}

          {trackId === "systems" && !activeLessonId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {systemsModules.map((mod, index) => {
                const done = mod.lessons.filter((l) =>
                  userProgress.completedLessons.includes(l.id)
                ).length;
                return (
                  <div
                    key={mod.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 min-w-0"
                  >
                    <p className="text-[10px] font-mono text-slate-500">
                      Module {index + 1} · {mod.id.replace("module-", "")}
                    </p>
                    <p className="text-xs font-semibold text-white leading-snug mt-0.5 line-clamp-2">
                      {mod.title}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 mt-2">
                      {done}/{mod.lessons.length} lessons
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Level 3–5: existing lesson UIs (IDs & XP preserved) */}
      <div className={hideChrome ? "" : "pb-4"}>
        {trackId === "foundations" ? (
          <PromptEngineeringPath />
        ) : (
          <CurriculumView excludeModuleIds={["module-0"]} />
        )}
      </div>
    </div>
  );
};
