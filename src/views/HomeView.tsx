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
    <div className="app-view space-y-10 sm:space-y-14 lg:space-y-16 py-6 sm:py-8">
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

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 sm:gap-4">
            <button type="button" onClick={() => nextFoundation ? setActiveTab("foundations") : setActiveTab("curriculum")} className="rounded-xl border border-blue-800/70 bg-blue-950/40 p-4 text-left hover:border-blue-500">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">Continue learning</p>
              <h3 className="mt-2 text-base sm:text-lg font-bold text-white">{nextFoundation?.title || nextLesson?.title || "All lessons complete"}</h3>
              <p className="mt-1 text-xs text-slate-400">{nextFoundation ? "Prompt Engineering Foundations" : nextLesson?.moduleTitle || "Curriculum"}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-300">Open next lesson <ArrowRight className="h-3 w-3" /></span>
            </button>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><p className="text-xs text-slate-400">Overall progress</p><p className="mt-2 text-xl sm:text-2xl font-bold text-white">{totalCompletedLessons}/{totalTrackedLessons}</p><div className="mt-3 h-2 rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${totalTrackedLessons ? (totalCompletedLessons / totalTrackedLessons) * 100 : 0}%` }} /></div></div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><p className="text-xs text-slate-400">Weekly goal</p><p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-400">{weeklyGoal}/5</p><p className="mt-2 text-xs text-slate-500">Lessons completed</p></div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><p className="text-xs text-slate-400">Streak and XP</p><p className="mt-2 text-base sm:text-lg font-bold text-amber-300">{userProgress.streakDays} days</p><p className="text-xs text-slate-500">{userProgress.xp} XP earned</p></div>
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
