import React, { useMemo } from "react";
import {
  Compass,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  Layers,
  GraduationCap,
  ChevronRight,
  Code2,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Flame,
  Star,
  Terminal
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { FOUNDATION_LESSONS } from "../../views/PromptEngineeringPath";
import { Lesson, CurriculumModule } from "../../types";
import { promptPatterns } from "../../data/patternsData";

export const NextStepRecommendationEngine: React.FC = () => {
  const {
    userProgress,
    currentCurriculum,
    setActiveTab,
    setActiveLessonId,
    loadIntoPlayground,
    setPlaygroundSubTab,
  } = useApp();

  // Compute completed lessons data
  const allCurriculumLessons: Lesson[] = useMemo(
    () => currentCurriculum.flatMap((m) => m.lessons),
    [currentCurriculum]
  );

  const completedLessonIds = userProgress.completedLessons || [];

  // Completed counts
  const foundationsTotal = FOUNDATION_LESSONS.length;
  const foundationsCompleted = FOUNDATION_LESSONS.filter((l) =>
    completedLessonIds.includes(l.id)
  ).length;
  const foundationsPercent = Math.round((foundationsCompleted / foundationsTotal) * 100);

  const curriculumTotal = allCurriculumLessons.length;
  const curriculumCompleted = allCurriculumLessons.filter((l) =>
    completedLessonIds.includes(l.id)
  ).length;
  const curriculumPercent =
    curriculumTotal > 0 ? Math.round((curriculumCompleted / curriculumTotal) * 100) : 0;

  // Compute recommendation
  const recommendation = useMemo(() => {
    // 1. If foundations not complete, recommend next foundation
    const nextFoundation = FOUNDATION_LESSONS.find(
      (l) => !completedLessonIds.includes(l.id)
    );

    if (nextFoundation) {
      const idx = FOUNDATION_LESSONS.findIndex((l) => l.id === nextFoundation.id);
      return {
        type: "foundation" as const,
        priority: "HIGH PRIORITY • FOUNDATIONS",
        title: nextFoundation.title,
        subtitle: `Module ${idx + 1} of ${foundationsTotal} in Prompt Engineering Foundations`,
        summary: nextFoundation.summary,
        example: nextFoundation.refined,
        estimatedTime: "5-8 min",
        xpReward: 50,
        badge: "Core Architecture",
        badgeColor: "bg-blue-950/80 border-blue-800 text-blue-300",
        actionLabel: "Start Foundation Lesson",
        rationale:
          foundationsCompleted === 0
            ? "Start your foundational journey with core clarity & specificity principles."
            : `Building on your ${foundationsCompleted}/${foundationsTotal} foundation milestones to calibrate precision prompt structure.`,
        onAction: () => {
          setActiveTab("foundations");
        },
      };
    }

    // 2. If foundations complete, find next curriculum lesson
    const nextCurriculumLesson = allCurriculumLessons.find(
      (l) => !completedLessonIds.includes(l.id)
    );

    if (nextCurriculumLesson) {
      const parentModule = currentCurriculum.find((m) =>
        m.lessons.some((l) => l.id === nextCurriculumLesson.id)
      );

      return {
        type: "curriculum" as const,
        priority: "RECOMMENDED NEXT • CURRICULUM",
        title: nextCurriculumLesson.title,
        subtitle: `${parentModule?.code || "MODULE"} • ${parentModule?.title || "Advanced Prompt Engineering"}`,
        summary: nextCurriculumLesson.conceptSummary || nextCurriculumLesson.subtitle,
        example: nextCurriculumLesson.goodPrompt?.prompt || "",
        estimatedTime: "8-12 min",
        xpReward: nextCurriculumLesson.xpReward || 50,
        badge: nextCurriculumLesson.difficulty || "Intermediate",
        badgeColor: "bg-emerald-950/80 border-emerald-800 text-emerald-300",
        actionLabel: "Launch Curriculum Lesson",
        rationale: `You have mastered ${curriculumCompleted} lessons. Complete ${nextCurriculumLesson.title} to advance your mastery in ${parentModule?.title || "the academy"}.`,
        onAction: () => {
          setActiveLessonId(nextCurriculumLesson.id);
          setActiveTab("curriculum");
        },
      };
    }

    // 3. If all lessons complete, recommend Capstone Certification or Sandbox Security Audit
    return {
      type: "capstone" as const,
      priority: "MILESTONE ACHIEVED • CAPSTONE READY",
      title: "Mastery Capstone & Certification Assessment",
      subtitle: "Official Enterprise Prompt Architect Credential Exam",
      summary:
        "You have completed all curriculum and foundational modules. Validate your prompt engineering expertise and earn your verified certificate.",
      example: "",
      estimatedTime: "15 min",
      xpReward: 300,
      badge: "Mastery Tier",
      badgeColor: "bg-amber-950/80 border-amber-800 text-amber-300",
      actionLabel: "Take Capstone Assessment",
      rationale: "100% of curriculum mastered! Take the formal exam to generate your official PDF certificate and credential portfolio.",
      onAction: () => {
        setActiveTab("certification");
      },
    };
  }, [
    completedLessonIds,
    foundationsTotal,
    foundationsCompleted,
    allCurriculumLessons,
    curriculumCompleted,
    currentCurriculum,
    setActiveTab,
    setActiveLessonId,
  ]);

  // Secondary adaptive recommendations
  const secondarySuggestions = useMemo(() => {
    const suggestions = [];

    // Suggestion A: Sandbox Practice
    suggestions.push({
      id: "sandbox-practice",
      title: "Interactive Sandbox Experiment",
      category: "Hands-on Lab",
      description: "Test prompt token entropy, temperature steering, and live Gemini inference.",
      icon: Terminal,
      action: () => {
        setActiveTab("playground");
        setPlaygroundSubTab("sandbox");
      },
      tag: "Live Execution",
    });

    // Suggestion B: Explore Prompt Pattern
    const randomPattern = promptPatterns[foundationsCompleted % promptPatterns.length] || promptPatterns[0];
    suggestions.push({
      id: "pattern-library",
      title: `Pattern: ${randomPattern.title}`,
      category: "Architecture Pattern",
      description: randomPattern.description,
      icon: Layers,
      action: () => {
        setActiveTab("patterns");
      },
      tag: randomPattern.category,
    });

    // Suggestion C: CTF Simulator
    suggestions.push({
      id: "ctf-security",
      title: "CTF Jailbreak Defense Arena",
      category: "Adversarial Security",
      description: "Test your delimiter and system instruction defenses against prompt injection attacks.",
      icon: ShieldCheck,
      action: () => {
        setActiveTab("playground");
        setPlaygroundSubTab("ctf");
      },
      tag: "Security Audit",
    });

    return suggestions;
  }, [foundationsCompleted, setActiveTab, setPlaygroundSubTab]);

  return (
    <section className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8" id="personalized-next-step-engine">
      <div className="rounded-3xl border border-blue-900/60 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-4 sm:p-7 shadow-2xl space-y-6">
        {/* Header Title */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Personalized Next Step Engine
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-950 border border-blue-800 text-[10px] font-mono font-bold text-blue-300">
                  <Sparkles className="h-3 w-3" /> AI Tailored
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dynamically calculated based on your completed lessons, mastery gaps, and curriculum milestones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-slate-400 font-mono block">Overall Progress</span>
              <span className="text-xs font-bold text-white font-mono">
                {foundationsCompleted + curriculumCompleted} / {foundationsTotal + curriculumTotal} Lessons ({Math.round(((foundationsCompleted + curriculumCompleted) / (foundationsTotal + curriculumTotal || 1)) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Primary Recommendation Showcase Card */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-blue-500/50 bg-gradient-to-r from-blue-950/40 via-slate-900/90 to-indigo-950/40 p-4 sm:p-6 shadow-xl transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-600/30 border border-blue-500/50 text-[11px] font-mono font-bold text-blue-200">
                  {recommendation.priority}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold border ${recommendation.badgeColor}`}>
                  {recommendation.badge}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  {recommendation.estimatedTime}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 font-bold">
                  <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  +{recommendation.xpReward} XP
                </span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {recommendation.title}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-blue-300 mt-0.5">
                  {recommendation.subtitle}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                {recommendation.summary}
              </p>

              {/* Rationale Callout */}
              <div className="flex items-start gap-2 rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-xs text-slate-300">
                <Target className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-400">Why this next: </span>
                  <span>{recommendation.rationale}</span>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="shrink-0 flex flex-col items-stretch sm:items-end justify-center gap-2 pt-2 lg:pt-0">
              <button
                id="next-step-engine-primary-btn"
                onClick={recommendation.onAction}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-950/60 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <span>{recommendation.actionLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <span className="text-[10px] text-slate-400 text-center sm:text-right font-mono">
                Preserves all progress state
              </span>
            </div>
          </div>
        </div>

        {/* Milestone Tracks Breakdown Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Track 1: Foundations */}
          <div
            onClick={() => setActiveTab("foundations")}
            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                  Foundations Pathway
                </span>
              </div>
              <span className="text-xs font-mono text-blue-300 font-bold">
                {foundationsCompleted}/{foundationsTotal} ({foundationsPercent}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${foundationsPercent}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>{foundationsCompleted === foundationsTotal ? "✅ Certified Complete" : "5 Core Principles"}</span>
              <span className="flex items-center gap-0.5 text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                View Track <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </div>

          {/* Track 2: Comprehensive Curriculum */}
          <div
            onClick={() => setActiveTab("curriculum")}
            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 hover:border-slate-700 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Advanced Curriculum Pathway
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-300 font-bold">
                {curriculumCompleted}/{curriculumTotal} ({curriculumPercent}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${curriculumPercent}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>{curriculumCompleted === curriculumTotal ? "✅ All 10 Modules Mastered" : "10 Enterprise Modules"}</span>
              <span className="flex items-center gap-0.5 text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                Open Syllabus <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Alternate Adaptive Recommendations */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Recommended Practice & Extension Labs</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {secondarySuggestions.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 hover:border-slate-700 hover:bg-slate-900/60 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-blue-400 group-hover:text-blue-300 transition-colors">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {item.tag}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-850 flex items-center justify-between text-[11px] text-blue-400 font-semibold">
                    <span>Launch</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
