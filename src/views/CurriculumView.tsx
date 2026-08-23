import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Play,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Flame,
  Award,
  Layers,
  Clock,
  ShieldCheck,
  HelpCircle,
  Lightbulb,
  Maximize2,
  Minimize2,
  ChevronRight,
  Code2,
  FileCheck2,
  Check
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { curriculumModules } from "../data/lessonsData";
import { Lesson, CurriculumModule, BloomsTaxonomyLevel } from "../types";
import { LearningPathway } from "../components/lms/LearningPathway";
import { ConceptCard } from "../components/lms/ConceptCard";
import { ActiveRecallQuiz } from "../components/lms/ActiveRecallQuiz";
import { SandboxChallenge } from "../components/lms/SandboxChallenge";
import { LMSFocusHeader } from "../components/lms/LMSFocusHeader";
import { LessonProgressStepper } from "../components/lms/LessonProgressStepper";
import { EcorpLogo } from "../components/EcorpLogo";
import { CertificateGenerator } from "../components/CertificateGenerator";

const BLOOM_COLORS: Record<BloomsTaxonomyLevel, { bg: string; text: string; border: string }> = {
  Remembering: { bg: "bg-slate-800", text: "text-slate-300", border: "border-slate-700" },
  Understanding: { bg: "bg-blue-950/80", text: "text-blue-300", border: "border-blue-700/50" },
  Applying: { bg: "bg-emerald-950/80", text: "text-emerald-300", border: "border-emerald-700/50" },
  Analyzing: { bg: "bg-amber-950/80", text: "text-amber-300", border: "border-amber-700/50" },
  Evaluating: { bg: "bg-purple-950/80", text: "text-purple-300", border: "border-purple-700/50" },
  Creating: { bg: "bg-rose-950/80", text: "text-rose-300", border: "border-rose-700/50" },
};

export const CurriculumView: React.FC = () => {
  const {
    activeLessonId,
    setActiveLessonId,
    userProgress,
    markLessonComplete,
    addXp,
    loadIntoPlayground,
    isDistractionFreeMode,
    setIsDistractionFreeMode,
    currentCurriculum,
    t,
  } = useApp();

  const allLessons: Lesson[] = currentCurriculum.flatMap((m) => m.lessons);
  const currentLesson: Lesson =
    allLessons.find((l) => l.id === activeLessonId) || allLessons[0];

  const currentModule: CurriculumModule | undefined = currentCurriculum.find((m) =>
    m.lessons.some((l) => l.id === currentLesson.id)
  );

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const isCompleted = userProgress.completedLessons.includes(currentLesson.id);

  // Track concept read states & passed checkpoint IDs for active lesson
  const [readConceptIds, setReadConceptIds] = useState<string[]>([]);
  const [passedCheckpointIds, setPassedCheckpointIds] = useState<string[]>([]);
  const [selectedBloomFilter, setSelectedBloomFilter] = useState<BloomsTaxonomyLevel | "All">("All");
  const [viewMode, setViewMode] = useState<"syllabus" | "lesson">(
    activeLessonId ? "lesson" : "syllabus"
  );
  const [showCaseStudy, setShowCaseStudy] = useState<boolean>(true);

  // Sync viewMode if activeLessonId changes
  useEffect(() => {
    if (activeLessonId) {
      setViewMode("lesson");
    }
  }, [activeLessonId]);

  // When switching lessons, reset micro-state (or mark all completed if lesson was already finished)
  useEffect(() => {
    if (isCompleted) {
      const allCIds = (currentLesson.concepts || []).map((c) => c.id);
      const allQIds = (currentLesson.checkpoints || []).map((q) => q.id);
      setReadConceptIds(allCIds);
      setPassedCheckpointIds(allQIds);
    } else {
      setReadConceptIds([]);
      setPassedCheckpointIds([]);
    }
  }, [currentLesson.id, isCompleted]);

  // Calculate lesson progress percentage
  const totalConcepts = currentLesson.concepts?.length || 0;
  const totalCheckpoints = currentLesson.checkpoints?.length || 0;
  const totalMilestones = totalConcepts + totalCheckpoints;

  const currentMilestonesCompleted =
    readConceptIds.length + passedCheckpointIds.length;
  const lessonProgressPercent =
    totalMilestones > 0
      ? Math.min(100, Math.round((currentMilestonesCompleted / totalMilestones) * 100))
      : isCompleted
      ? 100
      : 0;

  const allMilestonesReached =
    totalMilestones === 0 ||
    (readConceptIds.length >= totalConcepts &&
      passedCheckpointIds.length >= totalCheckpoints);

  const handleMarkConceptRead = (conceptId: string) => {
    if (!readConceptIds.includes(conceptId)) {
      setReadConceptIds((prev) => [...prev, conceptId]);
      addXp(15);
    }
  };

  const handleCheckpointPassed = (checkpointId: string, xpReward: number) => {
    if (!passedCheckpointIds.includes(checkpointId)) {
      setPassedCheckpointIds((prev) => [...prev, checkpointId]);
      addXp(xpReward);
    }
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLessonId(lesson.id);
    setViewMode("lesson");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCompleteFullLesson = () => {
    markLessonComplete(currentLesson.id);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleExitLesson = () => {
    setViewMode("syllabus");
    setIsDistractionFreeMode(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePillarClick = (sectionId: string) => {
    setActiveLessonId(currentLesson.id);
    setViewMode("lesson");
    window.setTimeout(() => {
      const section = document.getElementById(sectionId) || document.getElementById("lesson-concepts-section");
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const handleTryInPlayground = () => {
    loadIntoPlayground({
      prompt: currentLesson.goodPrompt.prompt,
      systemInstruction:
        currentLesson.playgroundPreset?.systemInstruction ||
        "You are an expert AI mentor specializing in high-precision prompt engineering."
    });
  };

  const handleStepperClick = (stepId: string) => {
    const elMap: Record<string, string> = {
      concepts: "lesson-concepts-section",
      quizzes: "lesson-quizzes-section",
      sandbox: "lesson-sandbox-section",
      "case-study": "lesson-case-study-section",
      mastery: "lesson-mastery-section",
    };
    const el = document.getElementById(elMap[stepId]);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const sandboxCheckpoints = (currentLesson.checkpoints || []).filter((c) => c.type === "sandbox-fix");
  const quizCheckpoints = (currentLesson.checkpoints || []).filter((c) => c.type !== "sandbox-fix");
  const hasSandbox = sandboxCheckpoints.length > 0;
  const isSandboxPassed = hasSandbox
    ? sandboxCheckpoints.every((c) => passedCheckpointIds.includes(c.id) || isCompleted)
    : true;
  const solvedQuizzesCount = quizCheckpoints.filter((c) => passedCheckpointIds.includes(c.id) || isCompleted).length;

  const bloomFocus = currentLesson.bloomTaxonomyFocus || "Understanding";
  const bloomStyle = BLOOM_COLORS[bloomFocus] || BLOOM_COLORS.Understanding;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* If in active lesson mode, show LMS Focus Header */}
      {viewMode === "lesson" && (
        <LMSFocusHeader
          currentLesson={currentLesson}
          currentModule={currentModule}
          progressPercent={lessonProgressPercent}
          isCompleted={isCompleted}
          streakDays={userProgress.streakDays}
          totalXp={userProgress.xp}
          isDistractionFree={isDistractionFreeMode}
          onToggleDistractionFree={() => setIsDistractionFreeMode(!isDistractionFreeMode)}
          onExitLesson={handleExitLesson}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* ========================================================================= */}
        {/* VIEW MODE 1: SYLLABUS & LEARNING PATHWAY OVERVIEW                         */}
        {/* ========================================================================= */}
        {viewMode === "syllabus" && (
          <div className="space-y-8 animate-in fade-in duration-300" id="lms-syllabus-view">
            {/* Academic LMS Hero Section */}
            <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 -mb-16 h-48 w-48 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <EcorpLogo size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold uppercase tracking-widest text-blue-400">
                          {t.nav.brandName} Acadamy
                        </span>
                        <span className="rounded bg-blue-950 px-2 py-0.5 text-[10px] font-mono font-semibold text-blue-300 border border-blue-800">
                          {t.curriculum.lmsVersion}
                        </span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
                        {t.curriculum.trackTitle}
                      </h1>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2">
                      <Flame className="h-4 w-4 text-orange-400 fill-orange-400/30" />
                      <div className="text-left">
                        <div className="text-[10px] text-slate-400 font-mono">{t.curriculum.currentStreak}</div>
                        <div className="text-xs font-bold text-white">{userProgress.streakDays} {t.curriculum.daysActive}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <div className="text-left">
                        <div className="text-[10px] text-slate-400 font-mono">{t.curriculum.academicXp}</div>
                        <div className="text-xs font-bold text-amber-300 font-mono">{userProgress.xp} XP</div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                  {t.curriculum.trackDescription}
                </p>

                {/* 4 Pedagogical Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
                  <button type="button" onClick={() => handlePillarClick("lesson-concepts-section")} className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-1 text-left transition hover:border-blue-500/60 hover:bg-blue-950/30">
                    <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-950 text-[11px] font-mono text-blue-400 font-bold">1</span>
                      {t.curriculum.pillarMicroTitle}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {t.curriculum.pillarMicroDesc}
                    </p>
                  </button>

                  <button type="button" onClick={() => handlePillarClick("lesson-quizzes-section")} className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-1 text-left transition hover:border-emerald-500/60 hover:bg-emerald-950/30">
                    <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-950 text-[11px] font-mono text-emerald-400 font-bold">2</span>
                      {t.curriculum.pillarRecallTitle}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {t.curriculum.pillarRecallDesc}
                    </p>
                  </button>

                  <button type="button" onClick={() => handlePillarClick("lesson-case-study-section")} className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-1 text-left transition hover:border-amber-500/60 hover:bg-amber-950/30">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-950 text-[11px] font-mono text-amber-400 font-bold">3</span>
                      {t.curriculum.pillarBloomTitle}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {t.curriculum.pillarBloomDesc}
                    </p>
                  </button>

                  <button type="button" onClick={() => handlePillarClick("lesson-sandbox-section")} className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-1 text-left transition hover:border-purple-500/60 hover:bg-purple-950/30">
                    <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-950 text-[11px] font-mono text-purple-400 font-bold">4</span>
                      {t.curriculum.pillarSandboxTitle}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {t.curriculum.pillarSandboxDesc}
                    </p>
                  </button>
                </div>

                {/* Overall Curriculum Progress Bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-slate-400 font-mono mb-1.5">
                    <span className="font-semibold text-slate-300">{t.curriculum.theoryMastery}</span>
                    <span className="text-blue-400 font-bold">
                      {userProgress.completedLessons.length} / {allLessons.length} {t.curriculum.modulesMastered} (
                      {Math.round((userProgress.completedLessons.length / allLessons.length) * 100)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-500"
                      style={{
                        width: `${(userProgress.completedLessons.length / allLessons.length) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Main Learning Pathway Component */}
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    {t.curriculum.syllabusTitle}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {t.curriculum.syllabusSubtitle}
                  </p>
                </div>

                <button
                  id="resume-current-lesson-btn"
                  onClick={() => handleSelectLesson(currentLesson)}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-900/30 transition-all"
                >
                  <span>{t.curriculum.resumeBtn} {currentLesson.title}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <LearningPathway
                modules={currentCurriculum}
                currentLessonId={currentLesson.id}
                completedLessonIds={userProgress.completedLessons}
                onSelectLesson={handleSelectLesson}
                selectedBloomFilter={selectedBloomFilter}
                onSelectBloomFilter={setSelectedBloomFilter}
              />
            </div>

            {/* Certificate Section - Sample always visible, real unlocked on completion */}
            <div className="pt-8">
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 2: ACTIVE LESSON INSTRUCTIONAL STUDY                            */}
        {/* ========================================================================= */}
        {viewMode === "lesson" && (
          <div className="space-y-8 animate-in fade-in duration-300" id="lms-active-lesson-view">
            {/* Lesson Banner & Objective */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-blue-950 border border-blue-800 px-2 py-0.5 font-mono text-xs font-semibold text-blue-300">
                      {currentModule?.code || "MODULE"} • {currentModule?.title}
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${bloomStyle.bg} ${bloomStyle.text} ${bloomStyle.border}`}
                    >
                      {t.curriculum.bloomLevel}: {bloomFocus}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                      <Clock className="h-3.5 w-3.5 text-slate-500" /> {currentLesson.estimatedMinutes} {t.curriculum.mins}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                    {currentLesson.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-400/90 font-medium">
                    {currentLesson.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    id="lesson-try-sandbox-top-btn"
                    onClick={handleTryInPlayground}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-600 transition-all"
                  >
                    <Play className="h-3.5 w-3.5 text-blue-400 fill-blue-400/20" />
                    <span>{t.curriculum.openInSandbox}</span>
                  </button>

                  {isCompleted ? (
                    <span className="flex items-center gap-1.5 rounded-lg bg-emerald-950/90 border border-emerald-700 px-3.5 py-2 text-xs font-bold text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {t.curriculum.mastered} (+{currentLesson.xpReward || 50} XP)
                    </span>
                  ) : (
                    <button
                      id="lesson-mark-mastered-btn"
                      onClick={handleCompleteFullLesson}
                      disabled={!allMilestonesReached}
                      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                        allMilestonesReached
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/60 hover:brightness-110 active:scale-95"
                          : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {allMilestonesReached
                          ? `${t.curriculum.verifyMastery} (+${currentLesson.xpReward || 50} XP)`
                          : t.curriculum.completeCheckpointsFirst}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Single Core Objective Callout */}
              <div className="rounded-2xl border border-blue-900/40 bg-gradient-to-r from-blue-950/30 to-slate-950 p-4 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300 font-mono">
                  <GraduationCap className="h-4 w-4 text-blue-400" /> {t.curriculum.primaryObjective}:
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  {currentLesson.objective || currentLesson.conceptSummary}
                </p>
              </div>
            </div>

            {/* =================================================================== */}
            {/* LESSON PROGRESS STEPPER                                             */}
            {/* =================================================================== */}
            <LessonProgressStepper
              totalConcepts={currentLesson.concepts?.length || 1}
              readConceptsCount={readConceptIds.length}
              totalQuizzes={quizCheckpoints.length}
              solvedQuizzesCount={solvedQuizzesCount}
              hasSandboxChallenge={hasSandbox}
              isSandboxSolved={isSandboxPassed}
              isCaseStudyViewed={showCaseStudy}
              isLessonMastered={isCompleted}
              onStepClick={handleStepperClick}
            />

            {/* =================================================================== */}
            {/* MICROLEARNING CONCEPT BLOCKS                                        */}
            {/* =================================================================== */}
            <div id="lesson-concepts-section" className="space-y-6 scroll-mt-24">
              <div className="flex items-center justify-between gap-2 px-1">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  {t.curriculum.microConceptFoundations} ({currentLesson.concepts?.length || 0} {t.curriculum.units})
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  {readConceptIds.length}/{currentLesson.concepts?.length || 0} {t.curriculum.understood}
                </span>
              </div>

              {currentLesson.concepts && currentLesson.concepts.length > 0 ? (
                <div className="space-y-6">
                  {currentLesson.concepts.map((concept, idx) => (
                    <ConceptCard
                      key={concept.id}
                      concept={concept}
                      index={idx}
                      totalConcepts={currentLesson.concepts!.length}
                      isRead={readConceptIds.includes(concept.id) || isCompleted}
                      onMarkRead={() => handleMarkConceptRead(concept.id)}
                    />
                  ))}
                </div>
              ) : (
                /* Fallback if concepts not explicitly split */
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
                  <h3 className="text-sm font-bold text-white">{t.curriculum.theoreticalSummary}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{currentLesson.conceptSummary}</p>
                </div>
              )}
            </div>

            {/* =================================================================== */}
            {/* ACTIVE RECALL QUIZZES                                               */}
            {/* =================================================================== */}
            {quizCheckpoints.length > 0 && (
              <div id="lesson-quizzes-section" className="space-y-6 scroll-mt-24">
                <div className="flex items-center justify-between gap-2 px-1">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                    Active Recall Verification ({quizCheckpoints.length} {t.curriculum.checkpoints})
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">
                    {solvedQuizzesCount}/{quizCheckpoints.length} {t.curriculum.solved}
                  </span>
                </div>

                <div className="space-y-6">
                  {quizCheckpoints.map((checkpoint) => {
                    const isPassed =
                      passedCheckpointIds.includes(checkpoint.id) || isCompleted;

                    return (
                      <ActiveRecallQuiz
                        key={checkpoint.id}
                        challenge={checkpoint}
                        isCompleted={isPassed}
                        onPassed={(xp) => handleCheckpointPassed(checkpoint.id, xp)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* EMBEDDED SANDBOX CHALLENGES                                         */}
            {/* =================================================================== */}
            {sandboxCheckpoints.length > 0 && (
              <div id="lesson-sandbox-section" className="space-y-6 scroll-mt-24">
                <div className="flex items-center justify-between gap-2 px-1">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-emerald-400" />
                    Embedded Sandbox Challenge ({sandboxCheckpoints.length} Lab)
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">
                    {isSandboxPassed ? "Passed ✓" : "Pending Action"}
                  </span>
                </div>

                <div className="space-y-6">
                  {sandboxCheckpoints.map((checkpoint) => {
                    const isPassed =
                      passedCheckpointIds.includes(checkpoint.id) || isCompleted;

                    return (
                      <SandboxChallenge
                        key={checkpoint.id}
                        challenge={checkpoint}
                        isCompleted={isPassed}
                        onPassed={(xp) => handleCheckpointPassed(checkpoint.id, xp)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* CASE STUDY: NAIVE VS ENGINEERED PROMPT ANATOMY                      */}
            {/* =================================================================== */}
            <div id="lesson-case-study-section" className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4 scroll-mt-24">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  {t.curriculum.comparativeCaseStudy}
                </h3>
                <button
                  onClick={() => setShowCaseStudy(!showCaseStudy)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {showCaseStudy ? t.curriculum.collapse : t.curriculum.expandBreakdown}
                </button>
              </div>

              {showCaseStudy && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Bad Naive Prompt */}
                  <div className="rounded-xl border border-rose-900/60 bg-rose-950/10 p-4 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      ❌ {t.curriculum.naiveInput}
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1 font-mono">{t.curriculum.promptLabel}:</span>
                      <pre className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-rose-200/90 whitespace-pre-wrap border border-rose-950 max-h-40 overflow-y-auto">
                        {currentLesson.badPrompt.prompt}
                      </pre>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1 font-mono">{t.curriculum.modelOutputLabel}:</span>
                      <div className="rounded-lg bg-slate-950 p-3 text-xs text-slate-300 border border-slate-800 leading-relaxed max-h-40 overflow-y-auto">
                        {currentLesson.badPrompt.sampleOutput}
                      </div>
                    </div>
                    <div className="rounded-lg bg-rose-950/40 p-2.5 text-xs text-rose-200 border border-rose-900/40">
                      <span className="font-bold">{t.curriculum.defects}:</span> {currentLesson.badPrompt.explanation}
                    </div>
                  </div>

                  {/* Masterfully Engineered Prompt */}
                  <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/10 p-4 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      ✅ {t.curriculum.engineeredPrompt}
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1 font-mono">{t.curriculum.promptLabel}:</span>
                      <pre className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-200/90 whitespace-pre-wrap border border-emerald-950 max-h-40 overflow-y-auto">
                        {currentLesson.goodPrompt.prompt}
                      </pre>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1 font-mono">{t.curriculum.modelOutputLabel}:</span>
                      <div className="rounded-lg bg-slate-950 p-3 text-xs text-slate-200 border border-slate-800 leading-relaxed max-h-40 overflow-y-auto">
                        {currentLesson.goodPrompt.sampleOutput}
                      </div>
                    </div>
                    <div className="rounded-lg bg-emerald-950/40 p-2.5 text-xs text-emerald-200 border border-emerald-900/40">
                      <span className="font-bold">{t.curriculum.theoreticalRationale}:</span> {currentLesson.goodPrompt.explanation}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* =================================================================== */}
            {/* LESSON COMPLETION / FOOTER NAVIGATION                               */}
            {/* =================================================================== */}
            <div id="lesson-mastery-section" className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl flex flex-wrap items-center justify-between gap-4 scroll-mt-24">
              <div>
                {prevLesson ? (
                  <button
                    id="prev-lesson-nav-btn"
                    onClick={() => handleSelectLesson(prevLesson)}
                    className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>{t.curriculum.previous}: {prevLesson.title}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleExitLesson}
                    className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>{t.curriculum.backToSyllabus}</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!isCompleted && (
                  <button
                    id="bottom-complete-lesson-btn"
                    onClick={handleCompleteFullLesson}
                    disabled={!allMilestonesReached}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                      allMilestonesReached
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                        : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{t.curriculum.masterLesson} (+{currentLesson.xpReward || 50} XP)</span>
                  </button>
                )}

                {nextLesson ? (
                  <button
                    id="next-lesson-nav-btn"
                    onClick={() => handleSelectLesson(nextLesson)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-colors"
                  >
                    <span>{t.curriculum.nextLesson}: {nextLesson.title}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleExitLesson}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-colors"
                  >
                    <Award className="h-4 w-4" />
                    <span>{t.curriculum.completeAcademicCurriculum}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
