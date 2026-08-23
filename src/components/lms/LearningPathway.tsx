import React from "react";
import {
  CheckCircle2,
  Lock,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { CurriculumModule, Lesson, BloomsTaxonomyLevel } from "../../types";
import { useApp } from "../../context/AppContext";

interface LearningPathwayProps {
  modules: CurriculumModule[];
  currentLessonId: string;
  completedLessonIds: string[];
  onSelectLesson: (lesson: Lesson) => void;
  selectedBloomFilter?: BloomsTaxonomyLevel | "All";
  onSelectBloomFilter?: (level: BloomsTaxonomyLevel | "All") => void;
}

const BLOOM_COLORS: Record<BloomsTaxonomyLevel, { bg: string; text: string; border: string }> = {
  Remembering: { bg: "bg-slate-800", text: "text-slate-300", border: "border-slate-700" },
  Understanding: { bg: "bg-blue-950/80", text: "text-blue-300", border: "border-blue-700/50" },
  Applying: { bg: "bg-emerald-950/80", text: "text-emerald-300", border: "border-emerald-700/50" },
  Analyzing: { bg: "bg-amber-950/80", text: "text-amber-300", border: "border-amber-700/50" },
  Evaluating: { bg: "bg-purple-950/80", text: "text-purple-300", border: "border-purple-700/50" },
  Creating: { bg: "bg-rose-950/80", text: "text-rose-300", border: "border-rose-700/50" },
};

export const LearningPathway: React.FC<LearningPathwayProps> = ({
  modules,
  currentLessonId,
  completedLessonIds,
  onSelectLesson,
  selectedBloomFilter = "All",
  onSelectBloomFilter,
}) => {
  const { t } = useApp();

  const bloomLevels: (BloomsTaxonomyLevel | "All")[] = [
    "All",
    "Remembering",
    "Understanding",
    "Applying",
    "Analyzing",
    "Evaluating",
    "Creating",
  ];

  return (
    <div className="space-y-6" id="learning-pathway-root">
      {/* Bloom's Taxonomy Filter Bar */}
      {onSelectBloomFilter && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-blue-400" /> {t.curriculum.bloomLevel} Cognitive Progression
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Pedagogical Framework</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {bloomLevels.map((lvl) => {
              const isSelected = selectedBloomFilter === lvl;
              return (
                <button
                  key={lvl}
                  id={`bloom-filter-${lvl.toLowerCase()}`}
                  onClick={() => onSelectBloomFilter(lvl)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    isSelected
                      ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400"
                      : "bg-slate-950/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {lvl}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Module Pathways */}
      <div className="space-y-5">
        {modules.map((module, modIdx) => {
          const allLessonIds = module.lessons.map((l) => l.id);
          const completedCount = allLessonIds.filter((id) =>
            completedLessonIds.includes(id)
          ).length;
          const isModuleComplete = completedCount === module.lessons.length && module.lessons.length > 0;
          const totalXpInModule = module.lessons.reduce((acc, l) => acc + (l.xpReward || 50), 0);

          const filteredLessons = module.lessons.filter((lesson) => {
            if (selectedBloomFilter === "All") return true;
            return (lesson.bloomTaxonomyFocus || "Understanding") === selectedBloomFilter;
          });

          if (filteredLessons.length === 0 && selectedBloomFilter !== "All") {
            return null;
          }

          return (
            <div
              key={module.id}
              className={`rounded-2xl border transition-all ${
                isModuleComplete
                  ? "border-emerald-800/40 bg-slate-900/80"
                  : "border-slate-800 bg-slate-900/60"
              }`}
            >
              {/* Module Header */}
              <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800/60">
                      {module.code || `MODULE 0${modIdx + 1}`}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {module.level || "Core Track"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">{module.title}</h3>
                  <p className="text-xs text-slate-400 max-w-xl leading-relaxed">{module.description}</p>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="space-y-0.5 font-mono text-xs">
                    <div className="text-slate-300 font-bold flex items-center gap-1 justify-end">
                      <Award className="h-3.5 w-3.5 text-amber-400" />
                      <span>{totalXpInModule} XP</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {completedCount}/{module.lessons.length} {t.curriculum.completed}
                    </div>
                  </div>
                  <div className="h-10 w-10 shrink-0 rounded-full border-2 border-slate-700 bg-slate-950 flex items-center justify-center font-mono text-xs font-bold text-blue-400">
                    {Math.round((completedCount / (module.lessons.length || 1)) * 100)}%
                  </div>
                </div>
              </div>

              {/* Lesson Stepper Nodes */}
              <div className="p-3 sm:p-4 space-y-2.5">
                {filteredLessons.map((lesson, lIdx) => {
                  const isCurrent = lesson.id === currentLessonId;
                  const isCompleted = completedLessonIds.includes(lesson.id);
                  
                  const prevLesson = lIdx > 0 ? filteredLessons[lIdx - 1] : null;
                  const isUnlocked = lIdx === 0 || (prevLesson && completedLessonIds.includes(prevLesson.id)) || isCompleted || true;
                  
                  const bloom = lesson.bloomTaxonomyFocus || "Understanding";
                  const bloomStyle = BLOOM_COLORS[bloom] || BLOOM_COLORS.Understanding;

                  return (
                    <div
                      key={lesson.id}
                      id={`pathway-node-${lesson.id}`}
                      onClick={() => onSelectLesson(lesson)}
                      className={`group relative flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 sm:p-4 cursor-pointer transition-all ${
                        isCurrent
                          ? "border-blue-500 bg-gradient-to-r from-blue-950/70 to-slate-900 shadow-lg shadow-blue-950/50 ring-2 ring-blue-500/40 ring-offset-2 ring-offset-slate-950"
                          : isCompleted
                          ? "border-emerald-800/40 bg-slate-950/80 hover:border-emerald-700/60 hover:bg-slate-900/90"
                          : "border-slate-800/90 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/70"
                      }`}
                    >
                      {/* Left: Indicator & Title */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Node status icon */}
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold transition-transform group-hover:scale-105 ${
                            isCurrent
                              ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 animate-pulse"
                              : isCompleted
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-600/50"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <span>{lIdx + 1}</span>
                          )}
                        </div>

                        {/* Text details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-0.5">
                            <span className="font-semibold text-sm text-slate-100 group-hover:text-white truncate">
                              {lesson.title}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-semibold border ${bloomStyle.bg} ${bloomStyle.text} ${bloomStyle.border}`}
                            >
                              {bloom}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {lesson.objective || lesson.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Right: Meta stats & action button */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden sm:flex items-center gap-2.5 text-[11px] font-mono text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-500" />
                            {lesson.estimatedMinutes}{t.curriculum.mins}
                          </span>
                          <span className="flex items-center gap-1 text-amber-400/90 font-semibold">
                            <Sparkles className="h-3 w-3 text-amber-400" />
                            +{lesson.xpReward || 50} XP
                          </span>
                        </div>

                        <div className="flex items-center">
                          {isCurrent ? (
                            <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm flex items-center gap-1">
                              {t.curriculum.current} <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                          ) : isCompleted ? (
                            <span className="rounded-lg bg-emerald-950/80 border border-emerald-700/60 px-2 py-1 text-[11px] font-medium text-emerald-300">
                              {t.curriculum.mastered}
                            </span>
                          ) : (
                            <span className="rounded-lg border border-slate-700 bg-slate-800/80 px-2 py-1 text-[11px] font-medium text-slate-300 group-hover:border-blue-500 group-hover:text-white transition-colors">
                              {t.curriculum.start}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
