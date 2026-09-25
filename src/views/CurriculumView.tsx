import React, { useState, useEffect, useMemo } from "react";
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
  Check,
  Search,
  GitBranch,
  Cloud,
  Filter,
  RotateCcw,
  Compass,
  Download,
  Route,
  Map,
  BrainCircuit,
  Cpu,
  Target,
  TrendingUp,
  Zap,
  Bookmark,
  X,
  MessageSquare,
  Star,
  Trophy,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { curriculumModules } from "../data/lessonsData";
import { Lesson, CurriculumModule, BloomsTaxonomyLevel } from "../types";
import { exportLessonToPdf } from "../lib/lessonPdfExporter";
import { calculateLessonReadingStats, getDifficultyBadgeConfig } from "../lib/lessonCalculations";
import { LessonAudioPlayer } from "../components/lms/LessonAudioPlayer";
import { LessonScratchpad } from "../components/lms/LessonScratchpad";
import { LearningPathway } from "../components/lms/LearningPathway";
import { LearningMap } from "../components/lms/LearningMap";
import { ConceptCard } from "../components/lms/ConceptCard";
import { ActiveRecallQuiz } from "../components/lms/ActiveRecallQuiz";
import { SandboxChallenge } from "../components/lms/SandboxChallenge";
import { LMSFocusHeader } from "../components/lms/LMSFocusHeader";
import { LessonProgressStepper } from "../components/lms/LessonProgressStepper";
import { EcorpLogo } from "../components/EcorpLogo";
import { CertificateGenerator } from "../components/CertificateGenerator";
import { InteractiveSkillTree } from "../components/lms/InteractiveSkillTree";
import { LessonFeedbackModal } from "../components/lms/LessonFeedbackModal";

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
    curriculumProgressPercent,
    resumeCurriculum,
    persistenceStatus,
    isOnline,
    markLessonComplete,
    addXp,
    loadIntoPlayground,
    isDistractionFreeMode,
    setIsDistractionFreeMode,
    currentCurriculum,
    setActiveTab,
    toggleBookmarkLesson,
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
  const [viewMode, setViewMode] = useState<"syllabus" | "learningmap" | "skilltree" | "lesson">(
    activeLessonId ? "lesson" : "syllabus"
  );
  const [showCaseStudy, setShowCaseStudy] = useState<boolean>(true);

  // Curriculum Search and Filtering states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "completed" | "uncompleted" | "bookmarked">("All");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [completedModuleCelebration, setCompletedModuleCelebration] = useState<CurriculumModule | null>(null);

  const bookmarkedLessons = useMemo(() => userProgress.bookmarkedLessons || [], [userProgress.bookmarkedLessons]);
  const bookmarkedCount = bookmarkedLessons.length;
  const curriculumLessonIds = useMemo(() => new Set(allLessons.map((lesson) => lesson.id)), [allLessons]);
  const completedCount = userProgress.completedLessons.filter((id) => curriculumLessonIds.has(id)).length;
  const inProgressCount = Math.max(0, allLessons.length - completedCount);

  // Pathway Track Profiles & Metadata
  const PATHWAY_TIERS = useMemo(() => [
    {
      key: "All",
      label: "All Modules",
      badge: "Full Academy",
      trackName: "Complete Academy Track",
      tagline: "End-to-End Enterprise Prompt Architecture Masterclass",
      description: "Comprehensive end-to-end curriculum spanning causal token distribution, XML delimiter boundaries, cognitive reasoning chains, and autonomous ReAct agent tool loops.",
      targetAudience: "All software engineers, AI developers, and technical prompt architects",
      estimatedHours: "6.5 hrs",
      competencies: ["Token Entropy", "XML Delimiters", "Few-Shot Calibration", "Chain-of-Thought", "Tree-of-Thoughts", "JSON Schemas", "ReAct Loops"],
      icon: Layers,
      color: {
        activeTab: "bg-blue-600 text-white shadow-lg shadow-blue-900/40 border-blue-400 ring-2 ring-blue-400/30",
        idleTab: "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850",
        badge: "bg-blue-950 text-blue-300 border-blue-800/80",
        cardBorder: "border-blue-500/30",
        cardBg: "from-blue-950/40 via-slate-900/60 to-slate-950",
        accent: "text-blue-400",
        glow: "bg-blue-500/10",
      },
    },
    {
      key: "Beginner",
      label: "Beginner",
      badge: "Foundations Track",
      trackName: "Foundations & In-Context Mechanics",
      tagline: "Causal Token Distribution, Delimiter Isolation & Injection Defense",
      description: "Master foundational prompt conditioning, mathematical token probability mass, XML delimiter isolation, epistemic fallbacks, and balanced few-shot exemplar distributions.",
      targetAudience: "Engineers & creators seeking zero-hallucination, secure prompt architectures",
      estimatedHours: "1.5 hrs",
      competencies: ["Token Probability", "Negative Constraints", "XML Encapsulation", "Prompt Injection Defense", "Few-Shot Balancing"],
      icon: Compass,
      color: {
        activeTab: "bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 border-emerald-400 ring-2 ring-emerald-400/30",
        idleTab: "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850",
        badge: "bg-emerald-950 text-emerald-300 border-emerald-800/80",
        cardBorder: "border-emerald-500/30",
        cardBg: "from-emerald-950/40 via-slate-900/60 to-slate-950",
        accent: "text-emerald-400",
        glow: "bg-emerald-500/10",
      },
    },
    {
      key: "Intermediate",
      label: "Intermediate",
      badge: "Reasoning Track",
      trackName: "Cognitive Reasoning & Decomposition",
      tagline: "Dynamic Reasoning Tokens, Chain-of-Thought & Tree-of-Thoughts Search",
      description: "Unlock multi-hop logical deductions, dynamic reasoning token allocation, scratchpad working memory isolation, self-consistency sampling, and heuristic Tree-of-Thoughts exploration.",
      targetAudience: "Developers building multi-step reasoning, mathematical proofs, and complex logic pipelines",
      estimatedHours: "2.5 hrs",
      competencies: ["Chain-of-Thought (CoT)", "Reasoning Tokens", "Scratchpad Pattern", "Self-Consistency (CoT-SC)", "Tree-of-Thoughts (ToT)"],
      icon: BrainCircuit,
      color: {
        activeTab: "bg-amber-600 text-white shadow-lg shadow-amber-900/40 border-amber-400 ring-2 ring-amber-400/30",
        idleTab: "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850",
        badge: "bg-amber-950 text-amber-300 border-amber-800/80",
        cardBorder: "border-amber-500/30",
        cardBg: "from-amber-950/40 via-slate-900/60 to-slate-950",
        accent: "text-amber-400",
        glow: "bg-amber-500/10",
      },
    },
    {
      key: "Advanced",
      label: "Advanced",
      badge: "Agent Architectures",
      trackName: "Structured Schemas & Autonomous ReAct Agents",
      tagline: "JSON/YAML Schema Contracts, Grammar Masking & Agent Tooling",
      description: "Formulate deterministic TypeScript/JSON Schema output contracts, logit-level context-free grammar masking, and autonomous Thought-Action-Observation tool calling loops.",
      targetAudience: "Senior engineers and architects integrating LLMs into production backends and agent systems",
      estimatedHours: "2.5 hrs",
      competencies: ["TypeScript Schema Contracts", "CFG Grammar Masking", "Zero-Preamble Invariant", "ReAct Loops", "Autonomous Tool Calling"],
      icon: Cpu,
      color: {
        activeTab: "bg-purple-600 text-white shadow-lg shadow-purple-900/40 border-purple-400 ring-2 ring-purple-400/30",
        idleTab: "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-850",
        badge: "bg-purple-950 text-purple-300 border-purple-800/80",
        cardBorder: "border-purple-500/30",
        cardBg: "from-purple-950/40 via-slate-900/60 to-slate-950",
        accent: "text-purple-400",
        glow: "bg-purple-500/10",
      },
    },
  ], []);

  // Helper function to calculate lessons and stats per difficulty tier
  const getTierLessons = (tierKey: string): Lesson[] => {
    if (tierKey === "All") return allLessons;
    if (tierKey === "Beginner") {
      return allLessons.filter((l) => l.difficulty === "Beginner" || l.moduleId === "module-1");
    }
    if (tierKey === "Intermediate") {
      return allLessons.filter((l) => l.difficulty === "Intermediate" || l.moduleId === "module-2");
    }
    if (tierKey === "Advanced") {
      return allLessons.filter((l) => l.difficulty === "Advanced" || l.difficulty === "Expert" || l.moduleId === "module-3");
    }
    return allLessons;
  };

  const getTierStats = (tierKey: string) => {
    const tierLessons = getTierLessons(tierKey);
    const completed = tierLessons.filter((l) => userProgress.completedLessons.includes(l.id)).length;
    const total = tierLessons.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalXp = tierLessons.reduce((acc, l) => acc + (l.xpReward || 50), 0);
    const nextLesson = tierLessons.find((l) => !userProgress.completedLessons.includes(l.id));
    return { tierLessons, completed, total, percent, totalXp, nextLesson };
  };

  const activeTierConfig = PATHWAY_TIERS.find((t) => t.key === difficultyFilter) || PATHWAY_TIERS[0];
  const activeTierStats = getTierStats(difficultyFilter);

  // Determine target lesson to resume (globally or for active tier)
  const targetResumeLesson = React.useMemo(() => {
    if (difficultyFilter !== "All") {
      const tierLessons = getTierLessons(difficultyFilter);
      if (
        userProgress.lastLessonId &&
        !userProgress.completedLessons.includes(userProgress.lastLessonId)
      ) {
        const found = tierLessons.find((l) => l.id === userProgress.lastLessonId);
        if (found) return found;
      }
      return tierLessons.find((l) => !userProgress.completedLessons.includes(l.id));
    }

    if (
      userProgress.lastLessonId &&
      !userProgress.completedLessons.includes(userProgress.lastLessonId)
    ) {
      const found = allLessons.find((l) => l.id === userProgress.lastLessonId);
      if (found) return found;
    }

    return allLessons.find((l) => !userProgress.completedLessons.includes(l.id));
  }, [difficultyFilter, userProgress.lastLessonId, userProgress.completedLessons, allLessons]);

  // Filtered modules for syllabus and visual map views
  const filteredModules = React.useMemo(() => {
    return currentCurriculum
      .map((m) => {
        const isModuleInDifficulty =
          difficultyFilter === "All" ||
          (difficultyFilter === "Beginner" && (m.id === "module-1" || m.level?.toLowerCase().includes("foundation") || m.lessons.some((l) => l.difficulty === "Beginner"))) ||
          (difficultyFilter === "Intermediate" && (m.id === "module-2" || m.level?.toLowerCase().includes("intermediate") || m.lessons.some((l) => l.difficulty === "Intermediate"))) ||
          (difficultyFilter === "Advanced" && (m.id === "module-3" || m.level?.toLowerCase().includes("advanced") || m.lessons.some((l) => l.difficulty === "Advanced" || l.difficulty === "Expert")));

        if (!isModuleInDifficulty) return null;

        const matchingLessons = m.lessons.filter((l) => {
          const q = searchQuery.trim().toLowerCase();
          const matchesSearch =
            !q ||
            l.title.toLowerCase().includes(q) ||
            l.subtitle.toLowerCase().includes(q) ||
            l.conceptSummary.toLowerCase().includes(q) ||
            (l.objective || "").toLowerCase().includes(q) ||
            (l.bloomTaxonomyFocus || "").toLowerCase().includes(q) ||
            (l.difficulty || "").toLowerCase().includes(q) ||
            (l.keyRules || []).some((r) => r.toLowerCase().includes(q)) ||
            (l.deepDive || []).some((d) => d.toLowerCase().includes(q)) ||
            (l.concepts || []).some(
              (c) =>
                c.title.toLowerCase().includes(q) ||
                c.content.toLowerCase().includes(q) ||
                (c.keyTakeaway || "").toLowerCase().includes(q)
            );

          const matchesDifficulty =
            difficultyFilter === "All" ||
            l.difficulty === difficultyFilter ||
            (difficultyFilter === "Beginner" && (l.difficulty === "Beginner" || m.id === "module-1")) ||
            (difficultyFilter === "Intermediate" && (l.difficulty === "Intermediate" || m.id === "module-2")) ||
            (difficultyFilter === "Advanced" && (l.difficulty === "Advanced" || l.difficulty === "Expert" || m.id === "module-3"));

          const isLessonDone = userProgress.completedLessons.includes(l.id);
          const isBookmarked = (userProgress.bookmarkedLessons || []).includes(l.id);
          const matchesStatus =
            statusFilter === "All" ||
            (statusFilter === "completed" && isLessonDone) ||
            (statusFilter === "uncompleted" && !isLessonDone) ||
            (statusFilter === "bookmarked" && isBookmarked);

          return matchesSearch && matchesDifficulty && matchesStatus;
        });

        if (matchingLessons.length === 0) return null;

        return {
          ...m,
          lessons: matchingLessons,
        };
      })
      .filter((m): m is CurriculumModule => m !== null);
  }, [currentCurriculum, searchQuery, difficultyFilter, statusFilter, userProgress.completedLessons, userProgress.bookmarkedLessons]);

  const totalMatchingLessons = filteredModules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );

  const flatMatchingLessons = useMemo(() => {
    return filteredModules.flatMap((m) => m.lessons);
  }, [filteredModules]);

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

  const triggerModuleCelebrationAnimation = (moduleName: string) => {
    // Stage 1: Big Center Cannon Blast
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff']
    });

    // Stage 2: Left Side Cannon
    setTimeout(() => {
      confetti({
        particleCount: 90,
        angle: 60,
        spread: 60,
        origin: { x: 0.05, y: 0.65 },
        colors: ['#3b82f6', '#60a5fa', '#93c5fd', '#38bdf8']
      });
    }, 250);

    // Stage 3: Right Side Cannon
    setTimeout(() => {
      confetti({
        particleCount: 90,
        angle: 120,
        spread: 60,
        origin: { x: 0.95, y: 0.65 },
        colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b']
      });
    }, 500);

    // Stage 4: Starburst Finale
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 120,
        origin: { y: 0.35 },
        shapes: ['star', 'circle'],
        colors: ['#fbbf24', '#f59e0b', '#fde68a', '#ffffff']
      });
    }, 800);
  };

  const handleCompleteFullLesson = () => {
    markLessonComplete(currentLesson.id);

    // Check if completing this lesson completes all lessons in the course module
    const isModuleNowComplete = currentModule && currentModule.lessons.every(
      (l) => l.id === currentLesson.id || userProgress.completedLessons.includes(l.id)
    );

    if (isModuleNowComplete && currentModule) {
      // Trigger full module completion celebration sequence!
      triggerModuleCelebrationAnimation(currentModule.title);
      setCompletedModuleCelebration(currentModule);
    } else {
      // Standard single lesson completion confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      // Trigger Send Feedback modal after celebrating lesson completion
      setTimeout(() => {
        setIsFeedbackModalOpen(true);
      }, 600);
    }
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
    <div className="min-h-dvh bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white w-full max-w-full overflow-x-hidden">
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
          isBookmarked={bookmarkedLessons.includes(currentLesson.id)}
          onToggleBookmark={() => toggleBookmarkLesson(currentLesson.id)}
        />
      )}

      <div className={`page-shell app-view space-y-3 sm:space-y-6 ${viewMode === "lesson" ? "py-3 sm:py-5" : "py-2.5 sm:py-6"}`}>
        {/* ========================================================================= */}
        {/* TOP CURRICULUM SEARCH & FILTER BAR                                        */}
        {/* ========================================================================= */}
        {viewMode !== "lesson" && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 sm:p-5 shadow-xl backdrop-blur-md space-y-3 sm:space-y-3.5" id="curriculum-top-search-panel">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Main Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="curriculum-top-search-input"
                  type="text"
                  placeholder="Search curriculum by title or keyword (e.g. delimiters, few-shot, CoT, schemas, system prompt)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all shadow-inner"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    id="curriculum-top-search-clear"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Clear search query"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <span className="hidden sm:inline-flex items-center absolute right-3.5 top-2.5 text-[11px] font-mono text-slate-400 border border-slate-700/60 rounded px-1.5 py-0.5">
                    Filter
                  </span>
                )}
              </div>

              {/* Status & Bookmark Quick Filters */}
              <div className="flex flex-wrap items-center gap-1.5">
                {/* All Lessons Filter */}
                <button
                  type="button"
                  id="top-filter-status-all"
                  onClick={() => setStatusFilter("All")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition-all ${
                    statusFilter === "All"
                      ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-900/40"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <span>All Lessons</span>
                  <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono">
                    {allLessons.length}
                  </span>
                </button>

                {/* Bookmarked / Saved Topics Filter */}
                <button
                  type="button"
                  id="top-filter-status-bookmarked"
                  onClick={() => setStatusFilter(statusFilter === "bookmarked" ? "All" : "bookmarked")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition-all ${
                    statusFilter === "bookmarked"
                      ? "bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-md shadow-amber-950/40"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/40"
                  }`}
                  title="Filter by your bookmarked topics"
                >
                  <Bookmark className={`h-3.5 w-3.5 ${statusFilter === "bookmarked" || bookmarkedCount > 0 ? "fill-amber-400 text-amber-400" : ""}`} />
                  <span>Saved Topics</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-mono ${
                    statusFilter === "bookmarked" ? "bg-amber-500/30 text-amber-200" : "bg-slate-800/80 text-slate-300"
                  }`}>
                    {bookmarkedCount}
                  </span>
                </button>

                {/* In Progress Filter */}
                <button
                  type="button"
                  id="top-filter-status-uncompleted"
                  onClick={() => setStatusFilter(statusFilter === "uncompleted" ? "All" : "uncompleted")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition-all ${
                    statusFilter === "uncompleted"
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/40"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <span>In Progress</span>
                  <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono">
                    {inProgressCount}
                  </span>
                </button>

                {/* Mastered Filter */}
                <button
                  type="button"
                  id="top-filter-status-completed"
                  onClick={() => setStatusFilter(statusFilter === "completed" ? "All" : "completed")}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition-all ${
                    statusFilter === "completed"
                      ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-950/40"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Mastered</span>
                  <span className="rounded-full bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono">
                    {completedCount}
                  </span>
                </button>

                {/* Track Selector Dropdown */}
                <select
                  id="top-filter-difficulty-select"
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-950 px-2.5 py-2 text-xs font-semibold text-slate-300 focus:border-blue-500 focus:outline-none transition-colors"
                >
                  <option value="All">All Tracks</option>
                  <option value="Beginner">Beginner Track</option>
                  <option value="Intermediate">Intermediate Track</option>
                  <option value="Advanced">Advanced Track</option>
                </select>
              </div>
            </div>

            {/* Live Search & Filter Feedback Strip */}
            {(searchQuery || statusFilter !== "All" || difficultyFilter !== "All") && (
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400">
                    Showing <strong className="text-white font-mono">{totalMatchingLessons}</strong> of {allLessons.length} lessons
                  </span>
                  {searchQuery && (
                    <span className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-blue-300">
                      Keyword: "{searchQuery}"
                    </span>
                  )}
                  {statusFilter === "bookmarked" && (
                    <span className="rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-amber-300 flex items-center gap-1 font-semibold">
                      <Bookmark className="h-3 w-3 fill-amber-400 text-amber-400" />
                      Bookmarked Topics
                    </span>
                  )}
                  {difficultyFilter !== "All" && (
                    <span className="rounded-md bg-slate-800 px-2 py-0.5 text-slate-300">
                      Track: {difficultyFilter}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  id="curriculum-reset-all-filters-btn"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("All");
                    setDifficultyFilter("All");
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset all filters
                </button>
              </div>
            )}

            {/* Quick Result Jump Chips (when searching or bookmarked) */}
            {(searchQuery.trim() || statusFilter === "bookmarked") && flatMatchingLessons.length > 0 && (
              <div className="pt-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
                <span className="text-[11px] font-mono text-slate-400 shrink-0">Quick jump:</span>
                <div className="flex items-center gap-1.5 flex-nowrap">
                  {flatMatchingLessons.slice(0, 6).map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => handleSelectLesson(l)}
                      className="rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 px-2.5 py-1 text-xs text-slate-300 hover:text-white whitespace-nowrap transition-all flex items-center gap-1.5"
                    >
                      <span className="truncate max-w-[150px]">{l.title}</span>
                      <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
                    </button>
                  ))}
                  {flatMatchingLessons.length > 6 && (
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      +{flatMatchingLessons.length - 6} more below
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Empty State for Bookmarked Filter */}
            {statusFilter === "bookmarked" && bookmarkedCount === 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2.5">
                <Bookmark className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <strong className="text-amber-200">No saved topics yet.</strong> Click the bookmark icon on any lesson card in the syllabus or during study to save favorite or unfinished topics here for quick access.
                </div>
              </div>
            )}

            {/* Empty State for Search */}
            {totalMatchingLessons === 0 && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2">
                <p className="text-xs text-slate-400">
                  No lessons found matching <strong className="text-slate-200">"{searchQuery}"</strong> with selected filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("All");
                    setDifficultyFilter("All");
                  }}
                  className="rounded-lg bg-blue-600 hover:bg-blue-500 px-3 py-1 text-xs font-semibold text-white transition-colors"
                >
                  Clear search and show all lessons
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* GLOBAL CURRICULUM CONTROLS: PROGRESS TRACKER, SYNC STATUS & VIEW SELECTOR  */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          {/* Firestore Progress Tracking & Quick Resume Card */}
          <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 p-3.5 sm:p-5 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs font-bold text-blue-300">
                  <GraduationCap className="h-4 w-4 text-blue-400" />
                  Curriculum Progress
                </span>

                {/* Real-time Firestore Sync Badge */}
                <div className="flex items-center gap-1.5 rounded-md bg-slate-950/80 border border-slate-800 px-2.5 py-1 text-xs font-mono">
                  {persistenceStatus === "saving" ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                      <span className="text-amber-300">Saving to Firestore...</span>
                    </>
                  ) : persistenceStatus === "synced" ? (
                    <>
                      <Cloud className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Firestore Synced ✓</span>
                    </>
                  ) : !isOnline || persistenceStatus === "offline" ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      <span className="text-slate-400">Offline Cached</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-rose-400" />
                      <span className="text-rose-400">Sync Retrying</span>
                    </>
                  )}
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {completedCount} / {allLessons.length} Lessons Mastered ({curriculumProgressPercent}%)
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="h-2 w-full max-w-xl overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${curriculumProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Resume Action Button */}
            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                id="curriculum-resume-hero-btn"
                onClick={() => {
                  if (targetResumeLesson) {
                    handleSelectLesson(targetResumeLesson);
                  } else {
                    setActiveTab("certification");
                  }
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/30 transition-all w-full sm:w-auto cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-white shrink-0" />
                <span className="truncate">
                  {targetResumeLesson ? `Resume Lesson: ${targetResumeLesson.title}` : "Claim Certification →"}
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PERSONALIZED PATHWAY FILTER SYSTEM (Beginner / Intermediate / Advanced)     */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 shadow-xl space-y-4" id="personalized-pathway-filter-panel">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-indigo-300">
                    <Filter className="h-3.5 w-3.5 text-indigo-400" />
                    Learning Path Filter
                  </span>
                  {difficultyFilter !== "All" && (
                    <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${activeTierConfig.color.badge}`}>
                      {activeTierConfig.trackName}
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Personalize Your Learning Journey
                </h3>
              </div>

              {/* Reset to All Modules Action */}
              {difficultyFilter !== "All" && (
                <button
                  id="reset-tier-filter-btn"
                  onClick={() => setDifficultyFilter("All")}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-all self-start sm:self-center"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                  <span>View All Modules</span>
                </button>
              )}
            </div>

            {/* Level Toggle Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PATHWAY_TIERS.map((tier) => {
                const isSelected = difficultyFilter === tier.key;
                const stats = getTierStats(tier.key);
                const TierIcon = tier.icon;

                return (
                  <button
                    key={tier.key}
                    id={`pathway-tier-toggle-${tier.key.toLowerCase()}`}
                    onClick={() => setDifficultyFilter(tier.key)}
                    className={`group relative rounded-xl border p-3 text-left transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                      isSelected
                        ? tier.color.activeTab
                        : `${tier.color.idleTab}`
                    }`}
                  >
                    {/* Top Row: Icon, Label & Status Badge */}
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`rounded-lg p-1.5 shrink-0 ${isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400 group-hover:text-white"}`}>
                          <TierIcon className="h-4 w-4" />
                        </div>
                        <span className={`text-xs sm:text-sm font-bold truncate ${isSelected ? "text-white" : "text-slate-200"}`}>
                          {tier.label}
                        </span>
                      </div>

                      {stats.percent === 100 ? (
                        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs font-mono font-bold flex items-center gap-0.5 ${
                          isSelected ? "bg-emerald-950/80 text-emerald-200 border border-emerald-400/40" : "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                        }`}>
                          <Check className="h-3 w-3" />
                          <span>100%</span>
                        </span>
                      ) : (
                        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-xs font-mono font-semibold ${
                          isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                        }`}>
                          {stats.completed}/{stats.total}
                        </span>
                      )}
                    </div>

                    {/* Bottom Progress Bar & Time */}
                    <div className="space-y-1 w-full">
                      <div className="flex items-center justify-between text-xs font-mono opacity-80">
                        <span>{tier.estimatedHours}</span>
                        <span>{stats.totalXp} XP</span>
                      </div>
                      <div className={`h-1.5 w-full rounded-full overflow-hidden ${isSelected ? "bg-black/30" : "bg-slate-800"}`}>
                        <div
                          className={`h-full transition-all duration-500 ${
                            isSelected ? "bg-white" : "bg-blue-500"
                          }`}
                          style={{ width: `${stats.percent}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Personalized Learning Path Recommendation Box */}
            <div className={`rounded-xl border bg-gradient-to-br ${activeTierConfig.color.cardBg} ${activeTierConfig.color.cardBorder} p-4 sm:p-5 relative overflow-hidden transition-all shadow-inner`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-mono font-bold uppercase tracking-wider border ${activeTierConfig.color.badge}`}>
                      {activeTierConfig.badge || activeTierConfig.trackName}
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {activeTierConfig.estimatedHours}
                    </span>
                    <span className="text-xs text-amber-400 font-mono font-semibold flex items-center gap-1">
                      <Award className="h-3 w-3" /> +{activeTierStats.totalXp} XP Available
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>{activeTierConfig.tagline}</span>
                  </h4>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    {activeTierConfig.description}
                  </p>

                  {/* Competency Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
                      Key Competencies:
                    </span>
                    {activeTierConfig.competencies.map((comp) => (
                      <span
                        key={comp}
                        className="rounded-md bg-slate-950/70 border border-slate-800/80 px-2 py-0.5 text-xs text-slate-300 font-mono"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: Path Status & Immediate Jump Button */}
                <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/80">
                  <div className="text-left md:text-right font-mono text-xs text-slate-300 space-y-0.5">
                    <div className="font-bold flex items-center md:justify-end gap-1.5 text-white">
                      <Target className="h-3.5 w-3.5 text-blue-400" />
                      <span>{activeTierStats.completed} of {activeTierStats.total} Lessons Mastered</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {activeTierStats.percent === 100 ? "Track Mastered 🎓" : `${100 - activeTierStats.percent}% Remaining to Complete`}
                    </div>
                  </div>

                  <button
                    id="personalized-track-resume-btn"
                    onClick={() => {
                      if (activeTierStats.nextLesson) {
                        handleSelectLesson(activeTierStats.nextLesson);
                      }
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-lg transition-all ${
                      difficultyFilter === "Beginner"
                        ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40"
                        : difficultyFilter === "Intermediate"
                        ? "bg-amber-600 hover:bg-amber-500 shadow-amber-950/40"
                        : difficultyFilter === "Advanced"
                        ? "bg-purple-600 hover:bg-purple-500 shadow-purple-950/40"
                        : "bg-blue-600 hover:bg-blue-500 shadow-blue-950/40"
                    }`}
                  >
                    <Play className="h-3.5 w-3.5 fill-white shrink-0" />
                    <span className="truncate">
                      {activeTierStats.percent === 100
                        ? `Review ${activeTierConfig.label} Track`
                        : `Start ${activeTierConfig.label} Path: ${activeTierStats.nextLesson?.title || "Next Lesson"}`}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Mode Switcher */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 sm:p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1">
              <button
                id="view-syllabus-tab"
                onClick={() => setViewMode("syllabus")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "syllabus"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Curriculum Modules</span>
              </button>

              <button
                id="view-learningmap-tab"
                onClick={() => setViewMode("learningmap")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "learningmap"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Route className="h-3.5 w-3.5" />
                <span>Visual Learning Map</span>
              </button>

              <button
                id="view-skilltree-tab"
                onClick={() => setViewMode("skilltree")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "skilltree"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <GitBranch className="h-3.5 w-3.5" />
                <span>Skill Tree</span>
              </button>

              {activeLessonId && (
                <button
                  id="view-active-lesson-tab"
                  onClick={() => setViewMode("lesson")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === "lesson"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>Active Lesson</span>
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 font-mono hidden sm:block">
              {allLessons.length} Total Lessons · 8 Core Modules
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW MODE 1: VISUAL SVG LEARNING MAP                                      */}
        {/* ========================================================================= */}
        {viewMode === "learningmap" && (
          <div className="animate-in fade-in duration-300" id="lms-learning-map-view">
            <LearningMap
              modules={filteredModules}
              completedLessonIds={userProgress.completedLessons}
              activeLessonId={activeLessonId}
              onSelectLesson={handleSelectLesson}
              searchFilter={searchQuery}
              difficultyFilter={difficultyFilter}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 2: VISUAL INTERACTIVE SKILL TREE                                */}
        {/* ========================================================================= */}
        {viewMode === "skilltree" && (
          <div className="animate-in fade-in duration-300" id="lms-skill-tree-view">
            <InteractiveSkillTree
              modules={currentCurriculum}
              completedLessonIds={userProgress.completedLessons}
              activeLessonId={activeLessonId}
              onSelectLesson={handleSelectLesson}
              searchFilter={searchQuery}
              difficultyFilter={difficultyFilter}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW MODE 2: SYLLABUS & LEARNING PATHWAY OVERVIEW                         */}
        {/* ========================================================================= */}
        {viewMode === "syllabus" && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300" id="lms-syllabus-view">
            {/* Academic LMS Hero Section */}
            <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 p-4 sm:p-8 shadow-2xl relative overflow-hidden">
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
                        <span className="rounded bg-blue-950 px-2 py-0.5 text-xs sm:text-xs font-mono font-semibold text-blue-300 border border-blue-800">
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
                        <div className="text-xs sm:text-xs text-slate-400 font-mono">{t.curriculum.currentStreak}</div>
                        <div className="text-xs font-bold text-white">{userProgress.streakDays} {t.curriculum.daysActive}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <div className="text-left">
                        <div className="text-xs sm:text-xs text-slate-400 font-mono">{t.curriculum.academicXp}</div>
                        <div className="text-xs font-bold text-amber-300 font-mono">{userProgress.xp} XP</div>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                  {t.curriculum.trackDescription}
                </p>

                {/* 4 Pedagogical Pillars - Swipeable carousel on mobile */}
                <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
                  <button type="button" onClick={() => handlePillarClick("lesson-concepts-section")} className="shrink-0 w-[min(82vw,280px)] max-w-[280px] snap-center sm:w-auto rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-1 text-left transition hover:border-blue-500/60 hover:bg-blue-950/30">
                    <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-950 text-xs font-mono text-blue-400 font-bold">1</span>
                      {t.curriculum.pillarMicroTitle}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t.curriculum.pillarMicroDesc}
                    </p>
                  </button>

                  <button type="button" onClick={() => handlePillarClick("lesson-quizzes-section")} className="shrink-0 w-[min(82vw,280px)] max-w-[280px] snap-center sm:w-auto rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-1 text-left transition hover:border-emerald-500/60 hover:bg-emerald-950/30">
                    <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-950 text-xs font-mono text-emerald-400 font-bold">2</span>
                      {t.curriculum.pillarRecallTitle}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t.curriculum.pillarRecallDesc}
                    </p>
                  </button>

                  <button type="button" onClick={() => handlePillarClick("lesson-case-study-section")} className="shrink-0 w-[min(82vw,280px)] max-w-[280px] snap-center sm:w-auto rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-1 text-left transition hover:border-amber-500/60 hover:bg-amber-950/30">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-950 text-xs font-mono text-amber-400 font-bold">3</span>
                      {t.curriculum.pillarBloomTitle}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t.curriculum.pillarBloomDesc}
                    </p>
                  </button>

                  <button type="button" onClick={() => handlePillarClick("lesson-sandbox-section")} className="shrink-0 w-[min(82vw,280px)] max-w-[280px] snap-center sm:w-auto rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-1 text-left transition hover:border-purple-500/60 hover:bg-purple-950/30">
                    <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-purple-950 text-xs font-mono text-purple-400 font-bold">4</span>
                      {t.curriculum.pillarSandboxTitle}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {t.curriculum.pillarSandboxDesc}
                    </p>
                  </button>
                </div>

                {/* Overall Curriculum Progress Bar */}
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-slate-400 font-mono mb-1.5">
                    <span className="font-semibold text-slate-300">{t.curriculum.theoryMastery}</span>
                    <span className="text-blue-400 font-bold">
                      {completedCount} / {allLessons.length} {t.curriculum.modulesMastered} (
                      {Math.round((completedCount / allLessons.length) * 100)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-500"
                      style={{
                        width: `${(completedCount / allLessons.length) * 100}%`
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
                modules={filteredModules}
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
            <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 sm:p-8 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-blue-950 border border-blue-800 px-2 py-0.5 font-mono text-xs font-semibold text-blue-300">
                      {currentModule?.code || "MODULE"} • {currentModule?.title}
                    </span>
                    {(() => {
                      const diffConfig = getDifficultyBadgeConfig(currentLesson.difficulty);
                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-mono font-bold border ${diffConfig.bg} ${diffConfig.text} ${diffConfig.border}`}
                          title={`Difficulty Level: ${diffConfig.label}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${diffConfig.dotBg}`} />
                          <span>{diffConfig.label}</span>
                        </span>
                      );
                    })()}
                    <span
                      className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${bloomStyle.bg} ${bloomStyle.text} ${bloomStyle.border}`}
                    >
                      {t.curriculum.bloomLevel}: {bloomFocus}
                    </span>
                    {(() => {
                      const readingStats = calculateLessonReadingStats(currentLesson);
                      return (
                        <span
                          className="flex items-center gap-1 text-xs text-slate-300 font-mono"
                          title={`Estimated read time based on ~${readingStats.wordCount} words`}
                        >
                          <Clock className="h-3.5 w-3.5 text-blue-400" />
                          <span className="font-semibold">{readingStats.display}</span>
                        </span>
                      );
                    })()}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                    {currentLesson.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-blue-400/90 font-medium">
                    {currentLesson.subtitle}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                  <button
                    id="lesson-bookmark-top-btn"
                    onClick={() => toggleBookmarkLesson(currentLesson.id)}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold min-h-[40px] transition-all ${
                      bookmarkedLessons.includes(currentLesson.id)
                        ? "border-amber-500/60 bg-amber-950/80 text-amber-300 shadow-sm shadow-amber-950/40"
                        : "border-slate-700 bg-slate-800/90 text-slate-200 hover:text-white hover:border-slate-600"
                    }`}
                    title={bookmarkedLessons.includes(currentLesson.id) ? "Remove from bookmarked topics" : "Bookmark this topic for later review"}
                  >
                    <Bookmark className={`h-3.5 w-3.5 ${bookmarkedLessons.includes(currentLesson.id) ? "fill-amber-400 text-amber-400" : ""}`} />
                    <span>{bookmarkedLessons.includes(currentLesson.id) ? "Saved" : "Save"}</span>
                  </button>

                  <button
                    id="lesson-export-pdf-top-btn"
                    onClick={() => exportLessonToPdf(currentLesson)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-600 min-h-[40px] transition-all"
                    title="Export clean, print-friendly study guide PDF"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-400" />
                    <span>PDF</span>
                  </button>

                  <button
                    id="lesson-try-sandbox-top-btn"
                    onClick={handleTryInPlayground}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-600 min-h-[40px] transition-all"
                  >
                    <Play className="h-3.5 w-3.5 text-blue-400 fill-blue-400/20" />
                    <span>Sandbox</span>
                  </button>

                  {isCompleted ? (
                    <span className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-lg bg-emerald-950/90 border border-emerald-700 px-3.5 py-2 text-xs font-bold text-emerald-300 min-h-[40px]">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {t.curriculum.mastered} (+{currentLesson.xpReward || 50} XP)
                    </span>
                  ) : (
                    <div className="w-full sm:w-auto flex flex-col items-stretch sm:items-end gap-1">
                      <button
                        id="lesson-mark-mastered-btn"
                        onClick={handleCompleteFullLesson}
                        disabled={!allMilestonesReached}
                        className={`flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold min-h-[40px] transition-all ${
                          allMilestonesReached
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/60 hover:brightness-110 active:scale-95 cursor-pointer"
                            : "bg-slate-900 text-slate-400 border border-slate-800 cursor-not-allowed"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>
                          {allMilestonesReached
                            ? `${t.curriculum.verifyMastery} (+${currentLesson.xpReward || 50} XP)`
                            : `Unlock Mastery (+${currentLesson.xpReward || 50} XP)`}
                        </span>
                      </button>
                      {!allMilestonesReached && (
                        <span className="text-[11px] sm:text-xs font-mono text-amber-300/90 bg-amber-950/40 border border-amber-900/50 px-2 py-0.5 rounded text-center sm:text-right">
                          Pending: {[
                            (totalConcepts - readConceptIds.length) > 0 ? `${totalConcepts - readConceptIds.length} Concept${(totalConcepts - readConceptIds.length) > 1 ? 's' : ''}` : '',
                            (totalCheckpoints - passedCheckpointIds.length) > 0 ? `${totalCheckpoints - passedCheckpointIds.length} Quiz${(totalCheckpoints - passedCheckpointIds.length) > 1 ? 'zes' : ''}` : ''
                          ].filter(Boolean).join(' & ')}
                        </span>
                      )}
                    </div>
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

              {/* Web Speech API Lesson Audio Player */}
              <LessonAudioPlayer lesson={currentLesson} />

              {/* Offline IndexedDB Lesson Notes Scratchpad */}
              <LessonScratchpad
                lessonId={currentLesson.id}
                lessonTitle={currentLesson.title}
              />
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
            {/* 1. CONCEPT: MICROLEARNING CONCEPT BLOCKS                            */}
            {/* =================================================================== */}
            <div id="lesson-concepts-section" className="space-y-6 scroll-mt-28 sm:scroll-mt-32">
              <div className="flex items-center justify-between gap-2 px-1">
                <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <span>1. CONCEPT · {t.curriculum.microConceptFoundations || "Core Mechanics"}</span>
                  <span className="text-xs text-slate-400 font-normal">({currentLesson.concepts?.length || 0} {t.curriculum.units || "units"})</span>
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
            {/* 2. PRACTICE: EMBEDDED SANDBOX CHALLENGES                            */}
            {/* =================================================================== */}
            {sandboxCheckpoints.length > 0 && (
              <div id="lesson-sandbox-section" className="space-y-6 scroll-mt-28 sm:scroll-mt-32">
                <div className="flex items-center justify-between gap-2 px-1">
                  <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                    <Code2 className="h-4 w-4 text-emerald-400" />
                    <span>2. PRACTICE · Interactive Sandbox</span>
                    <span className="text-xs text-slate-400 font-normal">({sandboxCheckpoints.length} Lab)</span>
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
            {/* 3. RECALL: ACTIVE RECALL QUIZZES                                    */}
            {/* =================================================================== */}
            {quizCheckpoints.length > 0 && (
              <div id="lesson-quizzes-section" className="space-y-6 scroll-mt-28 sm:scroll-mt-32">
                <div className="flex items-center justify-between gap-2 px-1">
                  <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                    <span>3. RECALL · Active Verification</span>
                    <span className="text-xs text-slate-400 font-normal">({quizCheckpoints.length} {t.curriculum.checkpoints || "checkpoints"})</span>
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
            {/* 4. ASSESSMENT: COMPARATIVE CASE STUDY ANATOMY                       */}
            {/* =================================================================== */}
            <div id="lesson-case-study-section" className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3.5 sm:p-6 shadow-xl space-y-4 scroll-mt-28 sm:scroll-mt-32">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  <span>4. ASSESSMENT · {t.curriculum.comparativeCaseStudy || "Comparative Anatomy"}</span>
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
                      <span className="text-xs font-semibold text-slate-400 block mb-1 font-mono">{t.curriculum.promptLabel}:</span>
                      <pre className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-rose-200/90 whitespace-pre-wrap border border-rose-950 max-h-40 overflow-y-auto">
                        {currentLesson.badPrompt.prompt}
                      </pre>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400 block mb-1 font-mono">{t.curriculum.modelOutputLabel}:</span>
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
                      <span className="text-xs font-semibold text-slate-400 block mb-1 font-mono">{t.curriculum.promptLabel}:</span>
                      <pre className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-200/90 whitespace-pre-wrap border border-emerald-950 max-h-40 overflow-y-auto">
                        {currentLesson.goodPrompt.prompt}
                      </pre>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-400 block mb-1 font-mono">{t.curriculum.modelOutputLabel}:</span>
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
            {/* 5. COMPLETION & NEXT LESSON                                         */}
            {/* =================================================================== */}
            <div id="lesson-mastery-section" className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 scroll-mt-28 sm:scroll-mt-32">
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
                {isCompleted && (
                  <button
                    id="lesson-feedback-trigger-btn"
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-slate-700 px-3.5 py-2 text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors shadow-sm"
                    title="Rate this lesson and send qualitative feedback"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
                    <span>{userProgress.lessonFeedbacks?.[currentLesson.id] ? "Update Feedback" : "Send Feedback"}</span>
                  </button>
                )}

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
                    onClick={() => {
                      handleExitLesson();
                      setActiveTab("certification");
                    }}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 transition-all"
                  >
                    <Award className="h-4 w-4" />
                    <span>Advance to Capstone Assessment &rarr;</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lesson Feedback & Rating Modal */}
      <LessonFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        lesson={currentLesson}
      />

      {/* Course Module Mastered Celebratory Modal */}
      {completedModuleCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg rounded-3xl border-2 border-emerald-500/60 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl text-center space-y-6">
            <button
              onClick={() => {
                setCompletedModuleCelebration(null);
                setTimeout(() => setIsFeedbackModalOpen(true), 300);
              }}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-xl shadow-emerald-950/60 ring-4 ring-emerald-500/20 animate-bounce">
              <Trophy className="h-10 w-10 text-slate-950" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-3 py-1 text-xs font-mono font-bold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>MODULE MILESTONE ACHIEVED</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Module Completed!
              </h2>
              <p className="text-sm font-semibold text-emerald-400">
                {completedModuleCelebration.code} • {completedModuleCelebration.title}
              </p>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed pt-1">
                Outstanding progress! You have mastered all {completedModuleCelebration.lessons.length} curriculum lessons in this module. Your knowledge structure and mastery metrics have been updated.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setCompletedModuleCelebration(null);
                  setTimeout(() => setIsFeedbackModalOpen(true), 300);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all"
              >
                Send Lesson Feedback
              </button>

              {nextLesson ? (
                <button
                  onClick={() => {
                    setCompletedModuleCelebration(null);
                    handleSelectLesson(nextLesson);
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-950/50 transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue to Next Module</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setCompletedModuleCelebration(null);
                    setActiveTab("certification");
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2"
                >
                  <Award className="h-4 w-4" />
                  <span>Take Capstone Exam</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
