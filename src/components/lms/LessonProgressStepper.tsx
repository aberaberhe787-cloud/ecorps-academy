import React from "react";
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Terminal,
  Layers,
  Award,
  ChevronRight,
  Sparkles,
  Zap
} from "lucide-react";
import { useApp } from "../../context/AppContext";

export interface LessonStep {
  id: "concepts" | "quizzes" | "sandbox" | "case-study" | "mastery";
  title: string;
  subtitle: string;
  icon: React.ElementType;
  isCompleted: boolean;
  isActive: boolean;
  countBadge?: string;
}

interface LessonProgressStepperProps {
  currentStepId?: string;
  totalConcepts: number;
  readConceptsCount: number;
  totalQuizzes: number;
  solvedQuizzesCount: number;
  hasSandboxChallenge: boolean;
  isSandboxSolved: boolean;
  isCaseStudyViewed: boolean;
  isLessonMastered: boolean;
  onStepClick?: (stepId: string) => void;
}

export const LessonProgressStepper: React.FC<LessonProgressStepperProps> = ({
  totalConcepts,
  readConceptsCount,
  totalQuizzes,
  solvedQuizzesCount,
  hasSandboxChallenge,
  isSandboxSolved,
  isCaseStudyViewed,
  isLessonMastered,
  onStepClick,
}) => {
  const { t } = useApp();

  const conceptsDone = totalConcepts > 0 ? readConceptsCount >= totalConcepts : true;
  const quizzesDone = totalQuizzes > 0 ? solvedQuizzesCount >= totalQuizzes : true;
  const sandboxDone = hasSandboxChallenge ? isSandboxSolved : true;
  const allPrereqsDone = conceptsDone && quizzesDone && sandboxDone;

  const steps: LessonStep[] = [
    {
      id: "concepts",
      title: t.curriculum.stepperConcepts || "1. Micro-Concepts",
      subtitle: `${readConceptsCount}/${totalConcepts} ${t.curriculum.understood || "units read"}`,
      icon: BookOpen,
      isCompleted: conceptsDone,
      isActive: !conceptsDone,
      countBadge: `${readConceptsCount}/${totalConcepts}`,
    },
    {
      id: "quizzes",
      title: t.curriculum.stepperQuizzes || "2. Recall Quizzes",
      subtitle: `${solvedQuizzesCount}/${totalQuizzes} ${t.curriculum.solved || "checkpoints"}`,
      icon: HelpCircle,
      isCompleted: quizzesDone,
      isActive: conceptsDone && !quizzesDone,
      countBadge: `${solvedQuizzesCount}/${totalQuizzes}`,
    },
    ...(hasSandboxChallenge
      ? [
          {
            id: "sandbox" as const,
            title: t.curriculum.stepperSandbox || "3. Sandbox Challenge",
            subtitle: isSandboxSolved ? (t.curriculum.solved || "Solved ✓") : (t.curriculum.stepperLiveLab || "Live Prompt Lab"),
            icon: Terminal,
            isCompleted: isSandboxSolved,
            isActive: conceptsDone && quizzesDone && !isSandboxSolved,
            countBadge: isSandboxSolved ? "✓" : "Lab",
          },
        ]
      : []),
    {
      id: "case-study",
      title: t.curriculum.stepperCaseStudy || "4. Case Anatomy",
      subtitle: isCaseStudyViewed ? (t.curriculum.understood || "Analyzed ✓") : (t.curriculum.stepperComparative || "Naive vs Refined"),
      icon: Layers,
      isCompleted: isCaseStudyViewed,
      isActive: conceptsDone && quizzesDone && sandboxDone && !isCaseStudyViewed,
    },
    {
      id: "mastery",
      title: t.curriculum.stepperMastery || "5. Verify Mastery",
      subtitle: isLessonMastered ? (t.curriculum.mastered || "Mastered ✓") : (allPrereqsDone ? (t.curriculum.stepperReady || "Ready to Claim") : (t.curriculum.stepperPending || "Locked")),
      icon: Award,
      isCompleted: isLessonMastered,
      isActive: allPrereqsDone && !isLessonMastered,
    },
  ];

  // Calculate overall completion percentage
  const completedCount = steps.filter((s) => s.isCompleted).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <div
      id="lesson-progress-stepper-container"
      className="rounded-2xl border border-slate-800/90 bg-slate-900/80 p-4 sm:p-5 shadow-lg backdrop-blur-md space-y-3.5"
    >
      {/* Stepper Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-950 border border-blue-800 text-blue-400 font-bold text-xs">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <span>{t.curriculum.stepperHeader || "Lesson Learning Progression Stepper"}</span>
              <span className="rounded bg-blue-950/80 border border-blue-700/60 px-2 py-0.5 text-[10px] font-mono text-blue-300 font-bold">
                {progressPercent}% {t.curriculum.completed || "Completed"}
              </span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>{completedCount} of {steps.length} Steps Complete</span>
        </div>
      </div>

      {/* Progress Bar Line */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Horizontal Steps Grid / Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          return (
            <button
              key={step.id}
              id={`stepper-step-${step.id}`}
              onClick={() => onStepClick && onStepClick(step.id)}
              className={`group text-left rounded-xl border p-2.5 sm:p-3 transition-all relative overflow-hidden flex flex-col justify-between ${
                step.isCompleted
                  ? "border-emerald-800/40 bg-emerald-950/20 hover:bg-emerald-950/40 opacity-80"
                  : step.isActive
                  ? "border-2 border-blue-500 bg-gradient-to-br from-blue-900/60 to-slate-900 shadow-[0_0_15px_rgba(37,99,235,0.2)] ring-1 ring-blue-500/20 hover:bg-blue-900/40 z-10"
                  : "border-slate-800 bg-slate-950/40 text-slate-500 hover:border-slate-700 hover:text-slate-400 opacity-60"
              }`}
            >
              {/* Step indicator top row */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                    step.isCompleted
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-700/50"
                      : step.isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/50"
                      : "bg-slate-800 text-slate-400 border border-slate-700"
                  }`}
                >
                  {step.isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <StepIcon className="h-3.5 w-3.5" />
                  )}
                </div>

                {step.countBadge && (
                  <span
                    className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                      step.isCompleted
                        ? "bg-emerald-950 border-emerald-800/60 text-emerald-400"
                        : step.isActive
                        ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                        : "bg-slate-900 border-slate-800 text-slate-500"
                    }`}
                  >
                    {step.countBadge}
                  </span>
                )}
              </div>

              {/* Title and Subtitle */}
              <div>
                <div
                  className={`text-xs font-bold leading-snug truncate ${
                    step.isCompleted
                      ? "text-emerald-200"
                      : step.isActive
                      ? "text-white"
                      : "text-slate-400"
                  }`}
                >
                  {step.title}
                </div>
                <div className={`text-[10px] truncate font-mono mt-0.5 ${step.isActive ? "text-blue-200" : "text-slate-500"}`}>
                  {step.subtitle}
                </div>
              </div>

              {/* Active Step Indicator Pill */}
              {step.isActive && (
                <div className="absolute top-0 right-0 h-full w-1 bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
