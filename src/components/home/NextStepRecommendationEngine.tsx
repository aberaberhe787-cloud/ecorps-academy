import React, { useMemo } from "react";
import {
  Clock,
  Zap
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { FOUNDATION_LESSONS } from "../../views/PromptEngineeringPath";
import { Lesson } from "../../types";

export const NextStepRecommendationEngine: React.FC = () => {
  const {
    userProgress,
    currentCurriculum,
    setActiveTab,
    setActiveLessonId,
  } = useApp();

  const allCurriculumLessons: Lesson[] = useMemo(
    () => currentCurriculum.flatMap((m) => m.lessons),
    [currentCurriculum]
  );

  const completedLessonIds = userProgress.completedLessons || [];

  const recommendation = useMemo(() => {
    // 1. Next foundation lesson
    const nextFoundation = FOUNDATION_LESSONS.find(
      (l) => !completedLessonIds.includes(l.id)
    );

    if (nextFoundation) {
      return {
        track: "Foundations",
        title: nextFoundation.title,
        subtitle: nextFoundation.summary,
        estimatedTime: "5 min",
        xpReward: 50,
        actionLabel: "Continue →",
        rationale: "Recommended because it's your next incomplete lesson in Foundations.",
        onAction: () => {
          setActiveTab("foundations");
        },
      };
    }

    // 2. Next curriculum lesson
    const nextCurriculumLesson = allCurriculumLessons.find(
      (l) => !completedLessonIds.includes(l.id)
    );

    if (nextCurriculumLesson) {
      const parentModule = currentCurriculum.find((m) =>
        m.lessons.some((l) => l.id === nextCurriculumLesson.id)
      );

      return {
        track: parentModule?.code || "Curriculum",
        title: nextCurriculumLesson.title,
        subtitle: nextCurriculumLesson.subtitle || nextCurriculumLesson.conceptSummary,
        estimatedTime: `${nextCurriculumLesson.estimatedMinutes || 8} min`,
        xpReward: nextCurriculumLesson.xpReward || 50,
        actionLabel: "Continue →",
        rationale: `Recommended because it's your next lesson in ${parentModule?.title || "the Curriculum"}.`,
        onAction: () => {
          setActiveLessonId(nextCurriculumLesson.id);
          setActiveTab("curriculum");
        },
      };
    }

    // 3. Capstone Certification
    return {
      track: "Certification",
      title: "Mastery Capstone Assessment",
      subtitle: "Validate your prompt engineering expertise and earn your verified certificate.",
      estimatedTime: "15 min",
      xpReward: 300,
      actionLabel: "Start Exam →",
      rationale: "All lessons complete! Validate your skills with the Capstone Assessment.",
      onAction: () => {
        setActiveTab("certification");
      },
    };
  }, [
    completedLessonIds,
    allCurriculumLessons,
    currentCurriculum,
    setActiveTab,
    setActiveLessonId,
  ]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="continue-learning-section">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-xl transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                CONTINUE LEARNING
              </span>
              <span className="text-slate-600 dark:text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-medium">
                {recommendation.track}
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {recommendation.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 line-clamp-1">
                {recommendation.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
              <span className="inline-flex items-center gap-1 font-mono">
                <Clock className="h-3.5 w-3.5 text-blue-400" />
                {recommendation.estimatedTime}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 font-mono text-amber-300 font-medium">
                <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                +{recommendation.xpReward} XP
              </span>
              <span>•</span>
              <span className="text-slate-400 italic">
                {recommendation.rationale}
              </span>
            </div>
          </div>

          <div className="shrink-0 pt-2 md:pt-0">
            <button
              id="continue-learning-action-btn"
              onClick={recommendation.onAction}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>{recommendation.actionLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
