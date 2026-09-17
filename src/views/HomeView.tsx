import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  BookOpen,
  Terminal,
  ArrowRight,
  Play,
  Flame,
  Award,
  Clock,
  Target,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { analyzePrompt } from "../lib/promptAnalyzer";
import { NextStepRecommendationEngine } from "../components/home/NextStepRecommendationEngine";

export const HomeView: React.FC = () => {
  const {
    setActiveTab,
    openSandbox,
    loadIntoPlayground,
    currentCurriculum,
    progressModel,
    userProgress,
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

  const isNewLearner = (userProgress.completedLessons || []).length === 0;

  return (
    <div className="app-view w-full max-w-full space-y-8 sm:space-y-12 py-4 sm:py-8 pb-20 sm:pb-16" id="home-view-container">
      {/* 1. Hero Introduction & Primary Action */}
      <section className="relative overflow-hidden w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="home-hero-section">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span>{t.home.badge}</span>
          </div>

          {/* Main Title */}
          <h1 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
            {t.home.heroTitlePrefix}{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              {t.home.heroTitleHighlight}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
            {t.home.heroSubtitle}
          </p>

          {/* Key Academy Metrics Bar */}
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md px-5 py-3 text-xs shadow-lg">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-400 shrink-0" />
              <div className="text-left">
                <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Curriculum</span>
                <span className="font-bold text-white font-mono text-xs sm:text-sm">
                  {progressModel.completed} / {progressModel.total} Lessons ({progressModel.percentage}%)
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400 shrink-0" />
              <div className="text-left">
                <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Experience</span>
                <span className="font-bold text-amber-300 font-mono text-xs sm:text-sm">
                  {userProgress.xp || 0} XP (Lvl {Math.floor((userProgress.xp || 0) / 250) + 1})
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-400 shrink-0" />
              <div className="text-left">
                <span className="text-slate-400 block text-[10px] uppercase font-mono tracking-wider">Active Streak</span>
                <span className="font-bold text-orange-400 font-mono text-xs sm:text-sm">
                  {userProgress.streakDays || 1} Days
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 max-w-md mx-auto">
            <button
              id="hero-start-learning-btn"
              onClick={() => setActiveTab(isNewLearner ? "foundations" : "curriculum")}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <BookOpen className="h-4 w-4 shrink-0" />
              <span>{isNewLearner ? t.home.startLearningTrack : "Go to Curriculum"}</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>

            <button
              id="hero-open-sandbox-btn"
              onClick={() => openSandbox("sandbox")}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-6 py-3 text-xs sm:text-sm font-semibold text-slate-200 transition-all hover:bg-slate-800 hover:text-white cursor-pointer"
            >
              <Terminal className="h-4 w-4 text-blue-400 shrink-0" />
              <span>{t.home.openInteractiveSandbox}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Primary Center of Gravity: Next Step Learning Engine */}
      <section className="w-full" id="home-next-step-container">
        <NextStepRecommendationEngine />
      </section>

      {/* 3. Curriculum Pathways Showcase */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="home-curriculum-pathways">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-xs font-semibold text-blue-300 mb-1.5">
              <BookOpen className="h-3.5 w-3.5 text-blue-400" />
              <span>Academic Curriculum</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {currentCurriculum.slice(0, 4).map((mod) => {
            const completedInMod = mod.lessons.filter((l) =>
              (userProgress.completedLessons || []).includes(l.id)
            ).length;
            const isCompleted = completedInMod === mod.lessons.length && mod.lessons.length > 0;
            const progressPct = mod.lessons.length > 0 ? Math.round((completedInMod / mod.lessons.length) * 100) : 0;

            return (
              <div
                key={mod.id}
                id={`curriculum-track-${mod.id}`}
                onClick={() => setActiveTab("curriculum")}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-blue-500/40 hover:bg-slate-900 transition-all cursor-pointer shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-md bg-blue-950/80 px-2 py-0.5 font-mono text-xs font-bold text-blue-400 border border-blue-800/60">
                      {mod.code}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
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

                <div className="mt-4 pt-3.5 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                    <span className="font-mono">{mod.lessons.length} Lessons</span>
                    <span className={isCompleted ? "text-emerald-400 font-bold font-mono" : "text-slate-400 font-mono"}>
                      {isCompleted ? "Mastered ✓" : `${progressPct}%`}
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

      {/* 4. Interactive Quick Try Prompt Analyzer Workbench */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="home-quick-try-section">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">{t.home.quickTryTitle}</h2>
                <p className="text-xs text-slate-400">{t.home.quickTrySubtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono shrink-0">
              <span className="text-slate-400">{t.home.qualityScore}:</span>
              <span className="rounded-lg bg-blue-950 border border-blue-800/80 px-2.5 py-1 font-bold text-blue-300">
                Grade {quickAnalysis.grade} ({quickAnalysis.score}/100)
              </span>
            </div>
          </div>

          <div className="mt-4">
            <textarea
              id="home-quick-prompt-input"
              rows={3}
              value={quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder={t.home.quickTryPlaceholder}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs text-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-mono text-slate-400 mr-1 flex items-center gap-1">
                <Target className="h-3 w-3 text-blue-400" /> Techniques:
              </span>
              {quickAnalysis.techniqueBadges.map((badge, i) => (
                <span
                  key={i}
                  className="rounded-md bg-slate-800/80 border border-slate-700/80 px-2 py-0.5 text-xs text-blue-300 font-medium font-mono"
                >
                  ✓ {badge}
                </span>
              ))}
            </div>

            <button
              id="home-test-sandbox-btn"
              onClick={handleRunQuickTry}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-colors shrink-0 cursor-pointer"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>{t.home.analyzeAndTestBtn}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
