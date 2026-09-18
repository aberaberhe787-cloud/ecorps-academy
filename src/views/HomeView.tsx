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
  Layers,
  ChevronRight,
  Cpu,
  BrainCircuit,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { FOUNDATION_LESSONS } from "./PromptEngineeringPath";
import { Lesson, CurriculumModule } from "../types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { StatCard } from "../components/ui/StatCard";
import { EcorpLogo } from "../components/EcorpLogo";

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

  // Determine current active or next target lesson
  const nextFoundation = FOUNDATION_LESSONS.find(
    (l) => !completedLessonIds.includes(l.id)
  );

  const nextCurriculumLesson = allCurriculumLessons.find(
    (l) => !completedLessonIds.includes(l.id)
  ) || allCurriculumLessons[0];

  // Dynamic continue lesson calculation
  const lessonNumberDisplay = (() => {
    if (userProgress.lastLessonId) {
      const idx = allCurriculumLessons.findIndex((l) => l.id === userProgress.lastLessonId);
      if (idx !== -1) return `Lesson ${String(idx + 1).padStart(2, "0")}`;
    }
    const idx = allCurriculumLessons.findIndex((l) => l.id === nextCurriculumLesson?.id);
    return idx !== -1 ? `Lesson ${String(idx + 1).padStart(2, "0")}` : "Lesson 01";
  })();

  // Calculate percentage complete truthfully from actual learner state
  const continuePercentage = progressModel.percentage;

  let continueTarget: {
    track: string;
    lessonTag: string;
    title: string;
    subtitle: string;
    duration: string;
    xp: number;
    completionPercent: number;
    actionLabel: string;
    onAction: () => void;
  };

  if (nextFoundation && completedLessonIds.length < 2) {
    const fIdx = FOUNDATION_LESSONS.findIndex((l) => l.id === nextFoundation.id);
    const fTag = fIdx !== -1 ? `Lesson ${String(fIdx + 1).padStart(2, "0")}` : "Lesson 01";
    continueTarget = {
      track: "Foundations Track",
      lessonTag: fTag,
      title: nextFoundation.title,
      subtitle: nextFoundation.summary,
      duration: "5 min",
      xp: 50,
      completionPercent: continuePercentage,
      actionLabel: completedLessonIds.length === 0 ? "Start Learning →" : "Continue →",
      onAction: () => setActiveTab("foundations"),
    };
  } else if (nextCurriculumLesson) {
    const parentModule = currentCurriculum.find((m) =>
      m.lessons.some((l) => l.id === nextCurriculumLesson.id)
    );
    continueTarget = {
      track: parentModule?.code ? `${parentModule.code} · ${parentModule.title}` : "Curriculum Track",
      lessonTag: lessonNumberDisplay,
      title: nextCurriculumLesson.title,
      subtitle: nextCurriculumLesson.conceptSummary || nextCurriculumLesson.subtitle || "Master core prompt conditioning, causal reasoning, and structured outputs.",
      duration: `${nextCurriculumLesson.estimatedMinutes || 8} min`,
      xp: nextCurriculumLesson.xpReward || 50,
      completionPercent: continuePercentage,
      actionLabel: "Continue →",
      onAction: () => {
        setActiveLessonId(nextCurriculumLesson.id);
        setActiveTab("curriculum");
      },
    };
  } else {
    continueTarget = {
      track: "Capstone Certification",
      lessonTag: "Capstone",
      title: "Mastery Capstone Assessment",
      subtitle: "Validate your prompt engineering expertise and claim your verified credentials.",
      duration: "15 min",
      xp: 300,
      completionPercent: 100,
      actionLabel: "Start Exam →",
      onAction: () => setActiveTab("certification"),
    };
  }

  // Recommended milestones
  const recommendedItems = [
    {
      id: "foundations",
      track: "Track 01 · Foundations",
      title: "Prompt Fundamentals & Delimiters",
      desc: "Mathematical token conditioning, XML isolation boundaries, and injection defense.",
      est: "10 min",
      xp: 100,
      action: () => setActiveTab("foundations"),
      isCompleted: FOUNDATION_LESSONS.every((l) => completedLessonIds.includes(l.id)),
    },
    {
      id: "curriculum",
      track: "Track 02 · Reasoning & Schemas",
      title: "Causal Reasoning & Schemas",
      desc: "Multi-step reasoning chains, few-shot balance, and deterministic JSON schemas.",
      est: "25 min",
      xp: 250,
      action: () => setActiveTab("curriculum"),
      isCompleted: progressModel.percentage >= 100,
    },
    {
      id: "certification",
      track: "Track 03 · Autonomous Agents",
      title: "ReAct Agent Loops & Capstone",
      desc: "Autonomous tool calling, grammar masking, and verified certification exam.",
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
      {/* ECORP ACADEMY BRAND HEADER                                                */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <EcorpLogo size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-blue-400 tracking-wider uppercase">
                ECORP ACADEMY
              </span>
              <span className="rounded bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-300">
                PROMPT ENGINEERING & AI SYSTEMS
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white mt-0.5">
              Instructional Learning Framework
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2">
            <Flame className="h-4 w-4 text-orange-400 fill-orange-400/20" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-mono">STUDY STREAK</div>
              <div className="text-xs font-bold text-white font-mono">{userProgress.streakDays || 1} Days Active</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-3.5 py-2">
            <Award className="h-4 w-4 text-amber-400" />
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-mono">EXPERIENCE</div>
              <div className="text-xs font-bold text-amber-300 font-mono">{userProgress.xp || 0} XP</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CONTINUE LEARNING (Dominant Architecture Hero Card)                     */}
      {/* ========================================================================= */}
      <section id="home-continue-section" aria-label="Continue Learning">
        <div className="rounded-3xl border-2 border-blue-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 -mb-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            {/* Top Tag & Track */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1.5 rounded-lg bg-blue-500/20 border border-blue-400/40 px-3 py-1 text-xs font-mono font-bold text-blue-300 shadow-sm">
                  <BookOpen className="h-3.5 w-3.5 text-blue-400" />
                  CONTINUE LEARNING
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs font-mono font-semibold text-slate-300">
                  {continueTarget.track}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  {continueTarget.duration}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-amber-300 font-semibold">
                  <Zap className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  +{continueTarget.xp} XP
                </span>
              </div>
            </div>

            {/* Lesson Title & Concept Summary */}
            <div className="space-y-1.5 max-w-3xl">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                {continueTarget.lessonTag}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {continueTarget.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-1">
                {continueTarget.subtitle}
              </p>
            </div>

            {/* Progress Metric & Primary Action */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800/80">
              <div className="space-y-1.5 flex-1 max-w-md">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold">{continueTarget.lessonTag} Completion</span>
                  <span className="text-blue-400 font-bold">{continueTarget.completionPercent}% complete</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                    style={{ width: `${continueTarget.completionPercent}%` }}
                  />
                </div>
              </div>

              <button
                id="continue-learning-main-btn"
                onClick={continueTarget.onAction}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/40 transition-all cursor-pointer w-full sm:w-auto shrink-0"
              >
                <span>Continue →</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. INSTRUCTIONAL LEARNING FLOWCHART                                       */}
      {/* ========================================================================= */}
      <section id="home-architecture-flowchart" aria-label="Learning Architecture" className="space-y-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
              ECORP ACADEMY PIPELINE
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Curriculum Progression Lifecycle
          </h2>
          <p className="text-xs text-slate-400">
            From enrollment to continuous mastery, follow our standard cognitive progression model.
          </p>
        </div>

        {/* Visual Stage Roadmap */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-6 shadow-xl backdrop-blur-md">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Step 1: Track & Module */}
            <div 
              onClick={() => setActiveTab("curriculum")}
              className="group rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 hover:border-blue-500/50 hover:bg-blue-950/20 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-950 border border-blue-800 text-[10px] font-mono font-bold text-blue-400">
                    1
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">CURRICULUM</span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-blue-300 transition-colors">
                  TRACK & MODULE
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Select Foundations, Reasoning, or Agent Architectures.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono text-blue-400 flex items-center gap-1">
                <span>View Modules</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Step 2: Concept */}
            <div 
              onClick={() => {
                setActiveLessonId(nextCurriculumLesson.id);
                setActiveTab("curriculum");
              }}
              className="group rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 hover:border-blue-500/50 hover:bg-blue-950/20 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-950 border border-blue-800 text-[10px] font-mono font-bold text-blue-400">
                    2
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">STAGE 1</span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-blue-300 transition-colors">
                  CONCEPT
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Microlearning concept units, key rules, and audio narration.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono text-blue-400 flex items-center gap-1">
                <span>Study Units</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Step 3: Practice */}
            <div 
              onClick={() => openSandbox("sandbox")}
              className="group rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-950 border border-emerald-800 text-[10px] font-mono font-bold text-emerald-400">
                    3
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">STAGE 2</span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                  PRACTICE
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Interactive sandbox lab with real-time prompt telemetry.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span>Launch Lab</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Step 4: Recall */}
            <div 
              onClick={() => {
                setActiveLessonId(nextCurriculumLesson.id);
                setActiveTab("curriculum");
              }}
              className="group rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 hover:border-amber-500/50 hover:bg-amber-950/20 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-950 border border-amber-800 text-[10px] font-mono font-bold text-amber-400">
                    4
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">STAGE 3</span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                  RECALL
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Active recall quizzes and checkpoint verification.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono text-amber-400 flex items-center gap-1">
                <span>Quiz Checks</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Step 5: Assessment */}
            <div 
              onClick={() => {
                setActiveLessonId(nextCurriculumLesson.id);
                setActiveTab("curriculum");
              }}
              className="group rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 hover:border-purple-500/50 hover:bg-purple-950/20 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-950 border border-purple-800 text-[10px] font-mono font-bold text-purple-400">
                    5
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">EVALUATION</span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-purple-300 transition-colors">
                  ASSESSMENT
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Comparative naive vs engineered prompt anatomy.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono text-purple-400 flex items-center gap-1">
                <span>Case Study</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            </div>

            {/* Step 6: Completion & Next */}
            <div 
              onClick={() => setActiveTab("curriculum")}
              className="group rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 hover:border-teal-500/50 hover:bg-teal-950/20 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-teal-950 border border-teal-800 text-[10px] font-mono font-bold text-teal-400">
                    6
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">MASTERY</span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-teal-300 transition-colors">
                  NEXT LESSON
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Claim mastery XP, unlock badges, and advance.
                </p>
              </div>
              <div className="pt-2 text-[10px] font-mono text-teal-400 flex items-center gap-1">
                <span>Advance &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PROGRESS (Truthful Canonical Metrics)                                  */}
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
      {/* 4. RECOMMENDED (Structured Next Milestones)                                */}
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
      {/* 5. EXPLORE (Direct Interactive Workbenches)                                */}
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

