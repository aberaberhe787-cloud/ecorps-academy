import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  BookOpen,
  Terminal,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Award,
  Play
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { analyzePrompt } from "../lib/promptAnalyzer";
import { NextStepRecommendationEngine } from "../components/home/NextStepRecommendationEngine";
import { promptPatterns } from "../data/patternsData";

export const HomeView: React.FC = () => {
  const {
    setActiveTab,
    openSandbox,
    loadIntoPlayground,
    currentCurriculum,
    progressModel,
    t,
  } = useApp();

  const [quickPrompt, setQuickPrompt] = useState(
    `Act as a Principal Staff Engineer. Review the following SQL query for indexing bottlenecks: SELECT * FROM orders WHERE customer_id = 42 ORDER BY created_at DESC;`
  );

  const quickAnalysis = analyzePrompt(quickPrompt);

  const handleRunQuickTry = () => {
    loadIntoPlayground({
      prompt: quickPrompt,
      systemInstruction: "You are a Principal Database Administrator.",
      subTab: "sandbox",
    });
  };

  return (
    <div className="app-view w-full max-w-full space-y-6 sm:space-y-10 lg:space-y-12 py-3 sm:py-6 pb-20 sm:pb-12">
      {/* 1. Continue Learning (Single Center of Gravity) */}
      <NextStepRecommendationEngine />

      {/* 2. Hero Introduction & Primary Action */}
      <section className="relative overflow-hidden w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
            <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span>{t.home.badge}</span>
          </div>

          {/* Main Title */}
          <h1 className="mt-3 sm:mt-4 text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t.home.heroTitlePrefix}{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              {t.home.heroTitleHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-2 sm:mt-3 max-w-2xl text-xs sm:text-base text-slate-300 leading-relaxed">
            {t.home.heroSubtitle}
          </p>

          {/* Canonical Progress Summary */}
          <div className="mt-4 sm:mt-6 inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 sm:px-6 sm:py-3 text-xs">
            <div className="text-center">
              <span className="text-slate-400 block text-xs">Curriculum Progress</span>
              <span className="font-bold text-white font-mono text-sm sm:text-base">
                {progressModel.completed} / {progressModel.total} Lessons ({progressModel.percentage}%)
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />
            <div className="text-center">
              <span className="text-slate-400 block text-xs">Weekly Active Goal</span>
              <span className="font-bold text-emerald-400 font-mono text-sm sm:text-base">
                {progressModel.weeklyCompleted} / {progressModel.weeklyGoal} Days
              </span>
            </div>
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />
            <div className="text-center">
              <span className="text-slate-400 block text-xs">Core Foundations</span>
              <span className="font-bold text-blue-400 font-mono text-sm sm:text-base">
                {progressModel.foundations.completed} / {progressModel.foundations.total} Done
              </span>
            </div>
          </div>

          {/* Hero CTAs */}
          <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto">
            <button
              id="hero-start-learning-btn"
              onClick={() => setActiveTab("curriculum")}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>{t.home.startLearningTrack}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>

            <button
              id="hero-open-sandbox-btn"
              onClick={() => openSandbox("sandbox")}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 transition-all hover:bg-slate-800 hover:text-white cursor-pointer"
            >
              <Terminal className="h-4 w-4 text-blue-400 shrink-0" />
              <span>{t.home.openInteractiveSandbox}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Interactive Quick Try Prompt Analyzer */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-400 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-white">{t.home.quickTryTitle}</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">{t.home.qualityScore}:</span>
              <span className="rounded bg-blue-900/60 border border-blue-700/60 px-2 py-0.5 font-bold text-blue-300">
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
                  className="rounded bg-slate-800 border border-slate-700 px-2 py-0.5 text-xs text-blue-300 font-medium"
                >
                  ✓ {badge}
                </span>
              ))}
            </div>

            <button
              id="home-test-sandbox-btn"
              onClick={handleRunQuickTry}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-colors shrink-0 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>{t.home.analyzeAndTestBtn}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4. Curriculum Pathways Showcase */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-xs font-semibold text-blue-300 mb-1.5">
              <BookOpen className="h-3.5 w-3.5 text-blue-400" />
              <span>Syllabus</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
              {t.home.tracksTitle}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
              {t.home.tracksSubtitle}
            </p>
          </div>
          <button
            id="home-view-all-tracks-btn"
            onClick={() => setActiveTab("curriculum")}
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors shrink-0 cursor-pointer"
          >
            <span>{t.home.exploreAllTracksBtn}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
          {currentCurriculum.slice(0, 4).map((mod) => {
            const completedInMod = mod.lessons.filter((l) =>
              (useApp().userProgress.completedLessons || []).includes(l.id)
            ).length;
            const isCompleted = completedInMod === mod.lessons.length && mod.lessons.length > 0;
            const progressPct = mod.lessons.length > 0 ? Math.round((completedInMod / mod.lessons.length) * 100) : 0;

            return (
              <div
                key={mod.id}
                onClick={() => setActiveTab("curriculum")}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <span className="rounded-md bg-slate-800/80 px-2 py-0.5 font-mono text-xs font-bold text-blue-400 border border-slate-700/60">
                      {mod.code}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {mod.estimatedTotalHours}h est.
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                    {mod.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
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

      {/* 5. Four Pedagogical Pillars */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">{t.home.keyPillarsTitle}</h2>
          <p className="mt-1 text-xs text-slate-400">
            {t.home.keyPillarsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setActiveTab("curriculum")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-2.5">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.home.pillar1Title}</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">{t.home.pillar1Desc}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setActiveTab("curriculum")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2.5">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.home.pillar2Title}</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">{t.home.pillar2Desc}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setActiveTab("curriculum")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-2.5">
              <Cpu className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.home.pillar3Title}</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">{t.home.pillar3Desc}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 cursor-pointer hover:bg-slate-800 transition-colors" onClick={() => setActiveTab("playground")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 mb-2.5">
              <Terminal className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">{t.home.pillar4Title}</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">{t.home.pillar4Desc}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
