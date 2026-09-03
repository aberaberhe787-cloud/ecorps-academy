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
    <div className="app-view space-y-8 sm:space-y-12 lg:space-y-14 py-6 sm:py-8 pb-12">
      {/* Learner control center */}
      <section className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-blue-900/60 bg-slate-900/90 p-4 sm:p-5 lg:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Learning Hub</p>
              <h2 className="mt-1 text-xl sm:text-2xl font-bold text-white">Your learning command center</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">Resume a lesson, practice a skill, or review your progress.</p>
            </div>
            <button type="button" onClick={() => setActiveTab("foundations")} className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 shrink-0">
              <Play className="h-4 w-4" /> Practice today
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => nextFoundation ? setActiveTab("foundations") : setActiveTab("curriculum")}
              className="group relative rounded-xl border-2 border-blue-500/80 bg-gradient-to-br from-blue-950/80 via-slate-900 to-indigo-950/50 p-4 text-left shadow-[0_0_25px_rgba(59,130,246,0.2)] hover:border-blue-400 hover:shadow-[0_0_30px_rgba(59,130,246,0.35)] transition-all duration-200"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" /> Next Action
                </span>
                <span className="text-[11px] font-mono text-slate-400">Step {totalCompletedLessons + 1} of {totalTrackedLessons}</span>
              </div>
              <h3 className="mt-2 text-base sm:text-lg font-extrabold text-white group-hover:text-blue-200 transition-colors">
                {nextFoundation?.title || nextLesson?.title || "All lessons complete"}
              </h3>
              <p className="mt-1 text-xs text-slate-300">
                {nextFoundation ? "Prompt Engineering Foundations" : nextLesson?.moduleTitle || "Curriculum Track"}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 group-hover:translate-x-1 transition-transform">
                  <span>Resume Current Topic</span>
                  <ArrowRight className="h-3.5 w-3.5 text-blue-400" />
                </span>
                <span className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-md group-hover:bg-blue-500 transition-colors">
                  Continue &rarr;
                </span>
              </div>
            </button>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><p className="text-xs text-slate-400">Overall progress</p><p className="mt-2 text-xl sm:text-2xl font-bold text-white">{totalCompletedLessons}/{totalTrackedLessons}</p><div className="mt-3 h-2 rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${totalTrackedLessons ? (totalCompletedLessons / totalTrackedLessons) * 100 : 0}%` }} /></div></div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><p className="text-xs text-slate-400">Weekly goal</p><p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-400">{weeklyGoal}/5</p><p className="mt-2 text-xs text-slate-400">Lessons completed</p></div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><p className="text-xs text-slate-400">Streak and XP</p><p className="mt-2 text-base sm:text-lg font-bold text-amber-300">{userProgress.streakDays} days</p><p className="text-xs text-slate-400">{userProgress.xp} XP earned</p></div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <button type="button" onClick={() => setActiveTab("foundations")} className="rounded-xl border border-slate-800 p-4 text-left hover:border-amber-500/60"><p className="text-xs font-semibold text-amber-300">Recommended next</p><p className="mt-1 text-sm font-bold text-white">{nextFoundation?.title || "Review Foundations"}</p><p className="mt-1 text-xs text-slate-400">Build the next prompt skill.</p></button>
            <button type="button" onClick={() => openSandbox("saved")} className="rounded-xl border border-slate-800 p-4 text-left hover:border-blue-500/60"><p className="text-xs font-semibold text-blue-300">Your library</p><p className="mt-1 text-sm font-bold text-white">{userProgress.savedCustomPrompts.length} saved prompts</p><p className="mt-1 text-xs text-slate-400">{userProgress.bookmarkedPatterns.length} bookmarked patterns</p></button>
            <button type="button" onClick={() => setActiveTab("profile")} className="rounded-xl border border-slate-800 p-4 text-left hover:border-emerald-500/60"><p className="text-xs font-semibold text-emerald-300">Achievements</p><p className="mt-1 text-sm font-bold text-white">{userProgress.achievements.length} badges earned</p><p className="mt-1 text-xs text-slate-400">View certificates and milestones.</p></button>
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
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setActiveTab("curriculum")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-3">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.home.pillar1Title}</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{t.home.pillar1Desc}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setActiveTab("curriculum")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.home.pillar2Title}</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{t.home.pillar2Desc}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setActiveTab("curriculum")}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-3">
              <Cpu className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.home.pillar3Title}</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">{t.home.pillar3Desc}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setActiveTab("playground")}>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promptPatterns.slice(0, 3).map((pat) => (
            <div
              key={pat.id}
              className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 hover:bg-slate-900 transition-all"
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
    </div>
  );
};
