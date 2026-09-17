import React from "react";
import {
  BookOpen,
  Terminal,
  ArrowRight,
  Flame,
  Award,
  Clock,
  Compass,
  Zap,
  Grid3X3,
  ShieldCheck,
  Target,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { FOUNDATION_LESSONS } from "./PromptEngineeringPath";
import { Lesson, CurriculumModule } from "../types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StatCard } from "../components/ui/StatCard";

export const HomeView: React.FC = () => {
  const {
    setActiveTab,
    setActiveLessonId,
    openSandbox,
    currentCurriculum,
    progressModel,
    userProgress,
  } = useApp();

  const completedLessonIds = userProgress.completedLessons || [];
  const allCurriculumLessons: Lesson[] = currentCurriculum.flatMap((m) => m.lessons);

  // Determine the continuous "Continue" target
  const nextFoundation = FOUNDATION_LESSONS.find(
    (l) => !completedLessonIds.includes(l.id)
  );

  const nextCurriculumLesson = allCurriculumLessons.find(
    (l) => !completedLessonIds.includes(l.id)
  );

  let continueTarget: {
    track: string;
    title: string;
    subtitle: string;
    duration: string;
    xp: number;
    actionLabel: string;
    onAction: () => void;
  };

  if (nextFoundation) {
    continueTarget = {
      track: "Foundations Track",
      title: nextFoundation.title,
      subtitle: nextFoundation.summary,
      duration: "5 min",
      xp: 50,
      actionLabel: "Continue Foundations →",
      onAction: () => setActiveTab("foundations"),
    };
  } else if (nextCurriculumLesson) {
    const parentModule = currentCurriculum.find((m) =>
      m.lessons.some((l) => l.id === nextCurriculumLesson.id)
    );
    continueTarget = {
      track: parentModule?.code ? `${parentModule.code} · ${parentModule.title}` : "Curriculum",
      title: nextCurriculumLesson.title,
      subtitle: nextCurriculumLesson.conceptSummary || nextCurriculumLesson.subtitle || "Master core enterprise prompt mechanics.",
      duration: `${nextCurriculumLesson.estimatedMinutes || 8} min`,
      xp: nextCurriculumLesson.xpReward || 50,
      actionLabel: "Continue Lesson →",
      onAction: () => {
        setActiveLessonId(nextCurriculumLesson.id);
        setActiveTab("curriculum");
      },
    };
  } else {
    continueTarget = {
      track: "Capstone Certification",
      title: "Mastery Capstone Assessment",
      subtitle: "Validate your prompt engineering expertise and claim your verified credentials.",
      duration: "15 min",
      xp: 300,
      actionLabel: "Start Exam →",
      onAction: () => setActiveTab("certification"),
    };
  }

  // Recommended milestones
  const recommendedItems = [
    {
      id: "foundations",
      track: "Core Foundations",
      title: "Prompt Fundamentals & Delimiters",
      desc: "Mathematical token conditioning and XML isolation boundaries.",
      est: "10 min",
      xp: 100,
      action: () => setActiveTab("foundations"),
      isCompleted: FOUNDATION_LESSONS.every((l) => completedLessonIds.includes(l.id)),
    },
    {
      id: "curriculum",
      track: "Enterprise Masterclass",
      title: "Causal Reasoning & Schemas",
      desc: "Multi-step reasoning chains, few-shot balance, and JSON schema outputs.",
      est: "25 min",
      xp: 250,
      action: () => setActiveTab("curriculum"),
      isCompleted: progressModel.percentage >= 100,
    },
    {
      id: "certification",
      track: "Professional Certification",
      title: "Mastery Capstone Exam",
      desc: "Timed forensic prompt evaluation and real-world system debugging.",
      est: "15 min",
      xp: 300,
      action: () => setActiveTab("certification"),
      isCompleted: Boolean(
        userProgress.completedAssessments?.includes("capstone") ||
          userProgress.achievements.some(
            (a) => a.id.includes("capstone") || a.id.includes("cert")
          )
      ),
    },
  ];

  // Explore destinations
  const exploreHubs = [
    {
      id: "sandbox",
      title: "Interactive Sandbox",
      description: "Experiment with tokens, system instructions, and real-time prompt telemetry.",
      icon: Terminal,
      color: "blue" as const,
      onClick: () => openSandbox("sandbox"),
    },
    {
      id: "patterns",
      title: "Pattern Library",
      description: "Explore enterprise prompt design patterns with production-ready templates.",
      icon: Grid3X3,
      color: "emerald" as const,
      onClick: () => setActiveTab("patterns"),
    },
    {
      id: "curriculum-map",
      title: "Curriculum Tracks",
      description: "Navigate all 8 academic modules across foundational and advanced tracks.",
      icon: BookOpen,
      color: "amber" as const,
      onClick: () => setActiveTab("curriculum"),
    },
    {
      id: "resources",
      title: "Reference & Cheatsheets",
      description: "Quick-reference syntax cards, injection catalogs, and prompt cheat sheets.",
      icon: Compass,
      color: "indigo" as const,
      onClick: () => setActiveTab("resources"),
    },
  ];

  return (
    <div
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-16 space-y-8 sm:space-y-10"
      id="home-view-container"
    >
      {/* ========================================================================= */}
      {/* 1. CONTINUE (Dominant Learner Action)                                     */}
      {/* ========================================================================= */}
      <section id="home-continue-section" aria-label="Continue Learning">
        <Card variant="accent" padding="md" className="relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="blue" size="sm">
                  CONTINUE LEARNING
                </Badge>
                <span className="text-slate-600 dark:text-slate-600">•</span>
                <span className="text-xs font-mono text-slate-300">
                  {continueTarget.track}
                </span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  {continueTarget.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2 max-w-3xl leading-relaxed">
                  {continueTarget.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                <span className="inline-flex items-center gap-1 font-mono">
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  {continueTarget.duration}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-mono text-amber-300 font-medium">
                  <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  +{continueTarget.xp} XP
                </span>
              </div>
            </div>

            <div className="shrink-0 pt-2 md:pt-0">
              <Button
                id="continue-learning-main-btn"
                variant="primary"
                size="lg"
                onClick={continueTarget.onAction}
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
              >
                {continueTarget.actionLabel}
              </Button>
            </div>
          </div>
        </Card>
      </section>

      {/* ========================================================================= */}
      {/* 2. PROGRESS (Truthful Canonical Metrics)                                  */}
      {/* ========================================================================= */}
      <section id="home-progress-section" aria-label="Your Progress" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
              Learning Progress
            </h2>
            <p className="text-xs text-slate-400">
              Your canonical curriculum mastery and study streak.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("curriculum")}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold cursor-pointer"
          >
            View Full Syllabus →
          </button>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <StatCard
            label="Curriculum Mastered"
            value={`${progressModel.completed} / ${progressModel.total}`}
            subValue={`(${progressModel.percentage}%)`}
            icon={<BookOpen className="h-5 w-5" />}
            variant="blue"
          />
          <StatCard
            label="Active Streak"
            value={`${userProgress.streakDays || 1} Days`}
            subValue="Daily Study"
            icon={<Flame className="h-5 w-5" />}
            variant="orange"
          />
          <StatCard
            label="Experience Level"
            value={`Lvl ${Math.floor((userProgress.xp || 0) / 250) + 1}`}
            subValue={`${userProgress.xp || 0} XP`}
            icon={<Award className="h-5 w-5" />}
            variant="amber"
          />
        </div>

        {/* Total Progress Bar Card */}
        <Card variant="default" padding="sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-medium">Overall Course Completion</span>
              <span className="text-blue-400 font-bold">{progressModel.percentage}%</span>
            </div>
            <ProgressBar value={progressModel.percentage} variant="gradient" size="md" />
          </div>
        </Card>
      </section>

      {/* ========================================================================= */}
      {/* 3. RECOMMENDED (Structured Next Milestones)                                */}
      {/* ========================================================================= */}
      <section id="home-recommended-section" aria-label="Recommended Tracks" className="space-y-4">
        <div className="space-y-0.5">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
            Recommended Milestones
          </h2>
          <p className="text-xs text-slate-400">
            Suggested pathways tailored to your current progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedItems.map((item) => (
            <div
              key={item.id}
              onClick={item.action}
              className="group rounded-2xl border border-slate-800 bg-slate-900/80 p-5 hover:border-blue-500/40 hover:bg-slate-900 transition-all cursor-pointer shadow-md flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={item.isCompleted ? "emerald" : "blue"} size="sm">
                    {item.track}
                  </Badge>
                  {item.isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-mono font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-mono">
                      {item.est}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-amber-300 font-mono font-medium">+{item.xp} XP</span>
                <span className="text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  {item.isCompleted ? "Review" : "Start"} <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. EXPLORE (Direct Interactive Workbenches)                                */}
      {/* ========================================================================= */}
      <section id="home-explore-section" aria-label="Explore Academy Tools" className="space-y-4">
        <div className="space-y-0.5">
          <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
            Explore Academy
          </h2>
          <p className="text-xs text-slate-400">
            Interactive playgrounds, patterns, and reference architectures.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {exploreHubs.map((hub) => {
            const Icon = hub.icon;
            return (
              <div
                key={hub.id}
                onClick={hub.onClick}
                className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer shadow-md flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-105 transition-transform">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    {hub.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {hub.description}
                  </p>
                </div>

                <div className="pt-3.5 mt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 group-hover:text-slate-200">
                  <span className="font-mono text-[11px]">Launch tool</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform text-blue-400" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
