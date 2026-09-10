import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  BookOpen,
  Terminal,
  Grid3X3,
  Trophy,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Award,
  Play,
  RotateCcw
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { analyzePrompt } from "../lib/promptAnalyzer";
import { FOUNDATION_LESSONS } from "./PromptEngineeringPath";
import { promptPatterns } from "../data/patternsData";

export const HomeView: React.FC = () => {
  const { setActiveTab, openSandbox, loadIntoPlayground, userProgress, currentCurriculum, t } = useApp();

  const allLessons = currentCurriculum.flatMap((module) => module.lessons);
  const completedLessons = allLessons.filter((lesson) => userProgress.completedLessons.includes(lesson.id)).length;
  const nextLesson = allLessons.find((lesson) => !userProgress.completedLessons.includes(lesson.id));
  const nextFoundation = FOUNDATION_LESSONS.find((lesson) => !userProgress.completedLessons.includes(lesson.id));
  const totalTrackedLessons = allLessons.length + FOUNDATION_LESSONS.length;
  const totalCompletedLessons = completedLessons + FOUNDATION_LESSONS.filter((lesson) => userProgress.completedLessons.includes(lesson.id)).length;
  const weeklyGoal = Math.min(5, totalCompletedLessons);

  const [quickPrompt, setQuickPrompt] = useState(
    `Act as a Principal Staff Engineer. Review the following SQL query for indexing bottlenecks: SELECT * FROM orders WHERE customer_id = 42 ORDER BY created_at DESC;`
  );

  const quickAnalysis = analyzePrompt(quickPrompt);

  const handleRunQuickTry = () => {
    loadIntoPlayground({
      prompt: quickPrompt,
      systemInstruction: "You are a Principal Database Administrator.",
      subTab: "sandbox"
    });
  };

  return (
    <div className="app-view space-y-6 sm:space-y-10 lg:space-y-14 py-4 sm:py-8 pb-24 sm:pb-12">
      {/* Learner control center */}
      <section className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-blue-900/60 bg-slate-900/90 p-4 sm:p-5 lg:p-6 shadow-xl text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Your Learning Command Center</h2>
          <button type="button" onClick={() => setActiveTab("foundations")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-500">
            <Play className="h-4 w-4" /> PRACTICE TODAY
          </button>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {/* Column 1 (Active Module) */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs text-slate-400">Active Module</p>
              <h3 className="mt-2 text-sm font-bold text-white">{nextFoundation?.title || nextLesson?.title || "All lessons complete"}</h3>
              <div className="mt-3 h-2 rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${totalTrackedLessons ? (totalCompletedLessons / totalTrackedLessons) * 100 : 0}%` }} /></div>
              <p className="mt-1 text-xs text-slate-400">Step {totalCompletedLessons + 1} of {totalTrackedLessons}</p>
              <button onClick={() => nextFoundation ? setActiveTab("foundations") : setActiveTab("curriculum")} className="mt-3 w-full rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700">Resume Lesson</button>
            </div>

            {/* Column 2 (Metrics & Goals) */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs text-slate-400">Metrics & Goals</p>
              <div className="mt-2 flex gap-4">
                <div><p className="text-[10px] text-slate-400">Overall Progress</p><p className="text-lg font-bold text-white">{totalCompletedLessons}/12</p></div>
                <div><p className="text-[10px] text-slate-400">Weekly Goal</p><p className="text-lg font-bold text-emerald-400">{weeklyGoal}/5</p></div>
                <div><p className="text-[10px] text-slate-400">Streak/XP</p><p className="text-lg font-bold text-amber-300">{userProgress.streakDays} days</p></div>
              </div>
              <button onClick={() => setActiveTab("curriculum")} className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500">Continue</button>
            </div>

            {/* Column 3 (Saved & Library) */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-xs text-slate-400">Saved & Library</p>
              <p className="mt-2 text-sm font-bold text-white">{userProgress.savedCustomPrompts.length} saved prompts</p>
              <p className="text-sm font-bold text-white">{userProgress.bookmarkedPatterns.length} bookmarked patterns</p>
              <button onClick={() => openSandbox("saved")} className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500">Continue</button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span>{t.home.badge}</span>
          </div>

          {/* Main Title */}
          <h1 className="mt-4 sm:mt-5 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {t.home.heroTitlePrefix} <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              {t.home.heroTitleHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed">
            {t.home.heroSubtitle}
          </p>

          {/* Hero CTAs */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <button
              id="hero-start-learning-btn"
              onClick={() => setActiveTab("curriculum")}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:brightness-110 active:scale-95"
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>{t.home.startLearningTrack}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>

            <button
              id="hero-open-sandbox-btn"
              onClick={() => openSandbox("sandbox")}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-6 py-3 text-sm font-semibold text-slate-200 transition-all hover:bg-slate-800 hover:text-white"
            >
              <Terminal className="h-4 w-4 text-blue-400 shrink-0" />
              <span>{t.home.openInteractiveSandbox}</span>
            </button>
          </div>

          {/* Quick Stats Bar */}
          <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
              <span className="text-xl sm:text-2xl font-extrabold text-blue-400 font-mono">10</span>
              <p className="text-xs text-slate-400 mt-0.5">{t.home.statsLessons}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
              <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">5</span>
              <p className="text-xs text-slate-400 mt-0.5">{t.home.statsMissions}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
              <span className="text-xl sm:text-2xl font-extrabold text-purple-400 font-mono">6+</span>
              <p className="text-xs text-slate-400 mt-0.5">{t.home.statsPatterns}</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4">
              <span className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono">100%</span>
              <p className="text-xs text-slate-400 mt-0.5">{t.home.statsHandsOn}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Quick Try Widget */}
      <section className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-400 shrink-0" />
              <h2 className="text-sm font-bold text-white">{t.home.quickTryTitle}</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">{t.home.qualityScore}:</span>
              <span className="rounded bg-blue-900/60 border border-blue-700/60 px-2 py-0.5 font-bold text-blue-300 whitespace-nowrap">
                Grade {quickAnalysis.grade} ({quickAnalysis.score}/100)
              </span>
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-400">{t.home.quickTrySubtitle}</p>

          <div className="mt-3">
            <textarea
              id="home-quick-prompt-input"
              rows={3}
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder={t.home.quickTryPlaceholder}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus:border-blue-500 focus:outline-none touch-pan-y overscroll-contain focus:touch-auto"
            />
          </div>

          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {quickAnalysis.techniqueBadges.map((badge, i) => (
                <span
                  key={i}
                  className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] text-blue-300 font-medium"
                >
                  ✓ {badge}
                </span>
              ))}
            </div>

            <button
              id="home-test-sandbox-btn"
              onClick={handleRunQuickTry}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-colors shrink-0"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>{t.home.analyzeAndTestBtn}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Pedagogical Pillars Section */}
      <section className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{t.home.keyPillarsTitle}</h2>
          <p className="mt-1 text-xs text-slate-400">
            {t.home.keyPillarsSubtitle}
          </p>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory flex-nowrap gap-3 pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 no-scrollbar touch-pan-x">
          <div className="min-w-[260px] max-w-[280px] sm:min-w-0 sm:max-w-none snap-start shrink-0 sm:shrink rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setActiveTab("curriculum")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-3">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.home.pillar1Title}</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{t.home.pillar1Desc}</p>
          </div>

          <div className="min-w-[260px] max-w-[280px] sm:min-w-0 sm:max-w-none snap-start shrink-0 sm:shrink rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setActiveTab("curriculum")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.home.pillar2Title}</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{t.home.pillar2Desc}</p>
          </div>

          <div className="min-w-[260px] max-w-[280px] sm:min-w-0 sm:max-w-none snap-start shrink-0 sm:shrink rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setActiveTab("curriculum")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-3">
              <Cpu className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.home.pillar3Title}</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{t.home.pillar3Desc}</p>
          </div>

          <div className="min-w-[260px] max-w-[280px] sm:min-w-0 sm:max-w-none snap-start shrink-0 sm:shrink rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setActiveTab("playground")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 mb-3">
              <Terminal className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.home.pillar4Title}</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{t.home.pillar4Desc}</p>
          </div>
        </div>
      </section>

      {/* Curriculum Tracks Pathways Showcase */}
      <section className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-300 mb-2">
              <BookOpen className="h-3.5 w-3.5 text-blue-400" />
              <span>Syllabus</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
              {t.home.tracksTitle}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
              {t.home.tracksSubtitle}
            </p>
          </div>
          <button
            id="home-view-all-tracks-btn"
            onClick={() => setActiveTab("curriculum")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors shrink-0 self-start sm:self-auto"
          >
            <span>{t.home.exploreAllTracksBtn}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory flex-nowrap gap-3 pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 sm:gap-4 no-scrollbar touch-pan-x">
          {currentCurriculum.slice(0, 4).map((mod) => {
            const completedInMod = mod.lessons.filter((l) =>
              userProgress.completedLessons.includes(l.id)
            ).length;
            const isCompleted = completedInMod === mod.lessons.length && mod.lessons.length > 0;
            const progressPct = mod.lessons.length > 0 ? Math.round((completedInMod / mod.lessons.length) * 100) : 0;

            return (
              <div
                key={mod.id}
                onClick={() => setActiveTab("curriculum")}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer min-w-[260px] max-w-[280px] md:min-w-0 md:max-w-none snap-start shrink-0 md:shrink"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-md bg-slate-800/80 px-2 py-0.5 font-mono text-[11px] font-bold text-blue-400 border border-slate-700/60">
                      {mod.code}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {mod.estimatedTotalHours}h est.
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                    {mod.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <span>{mod.lessons.length} Lessons</span>
                    <span className={isCompleted ? "text-emerald-400 font-bold" : "text-slate-400"}>
                      {isCompleted ? "Mastered" : `${progressPct}%`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCompleted ? "bg-emerald-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Production Patterns */}
      <section className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-300 mb-2">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span>Blueprints</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
              {t.home.patternsTitle}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
              {t.home.patternsSubtitle}
            </p>
          </div>
          <button
            id="home-view-all-patterns-btn"
            onClick={() => setActiveTab("patterns")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors shrink-0 self-start sm:self-auto"
          >
            <span>{t.home.exploreAllPatternsBtn}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory flex-nowrap gap-3 pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 sm:gap-4 no-scrollbar touch-pan-x">
          {promptPatterns.slice(0, 3).map((pat) => (
            <div
              key={pat.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 hover:border-slate-700 hover:bg-slate-900 transition-all min-w-[260px] max-w-[280px] md:min-w-0 md:max-w-none snap-start shrink-0 md:shrink"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                    {pat.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {pat.difficulty}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {pat.title}
                </h3>
                <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {pat.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => {
                    loadIntoPlayground({
                      prompt: pat.template,
                      systemInstruction: "You are an expert AI prompt engineer assistant.",
                      subTab: "sandbox"
                    });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  <Play className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Try in Sandbox</span>
                </button>
                <button
                  onClick={() => setActiveTab("patterns")}
                  className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span>Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lab Specifications & Architecture */}
      <section className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-lg bg-purple-500/10 border border-purple-500/30 px-3 py-1 text-xs font-semibold text-purple-300">
                <Cpu className="h-3.5 w-3.5 text-purple-400" />
                <span>Architecture</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {t.home.labTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                {t.home.labSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="home-open-sandbox-btn"
                onClick={() => openSandbox("sandbox")}
                className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
              >
                <Terminal className="h-4 w-4 text-blue-400" />
                <span>Launch Laboratory Sandbox</span>
              </button>
              <button
                id="home-open-assessment-btn"
                onClick={() => setActiveTab("certification")}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-500 transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Certification Exam</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-5 sm:p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-semibold text-blue-300">
                <Trophy className="h-3.5 w-3.5 text-blue-400" /> {t.home.statsMissions}
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white">
                {t.home.ctaBannerTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t.home.ctaBannerSubtitle}
              </p>
              <div className="pt-1 sm:pt-2">
                <button
                  id="home-explore-missions-btn"
                  onClick={() => {
                    setActiveTab("curriculum");
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-all"
                >
                  <Award className="h-4 w-4" />
                  <span>{t.home.ctaBannerBtn}</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5 font-mono text-xs text-slate-300 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
                <span>Evaluator Feedback Engine</span>
                <span className="text-emerald-400 font-bold">Grade S (96/100)</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> <span>Persona & Domain Expertise calibrated</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> <span>XML Delimiters protect input integrity</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> <span>Strict raw JSON schema enforced</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> <span>Negative constraints prevent preamble</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Bottom Action Bar for Mobile (< 768px) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md px-4 py-3 md:hidden flex items-center justify-between gap-3 shadow-2xl">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold">Prompt Mastery</p>
          <p className="text-xs text-slate-300 font-semibold truncate">Continue your learning path</p>
        </div>
        <button
          id="mobile-sticky-practice-today-btn"
          type="button"
          onClick={() => setActiveTab("foundations")}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 active:scale-95 shrink-0 min-h-[44px]"
        >
          <Play className="h-3.5 w-3.5 fill-white shrink-0" />
          <span>PRACTICE TODAY</span>
        </button>
      </div>
    </div>
  );
};
