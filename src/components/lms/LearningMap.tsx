import React, { useState, useMemo, useRef } from "react";
import {
  Compass,
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  Award,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Shield,
  Layers,
  Zap,
  Info,
  ExternalLink,
  Target,
  Clock,
  Flame,
  Check,
  RotateCcw,
  Milestone,
  Route,
  GraduationCap,
  Bookmark
} from "lucide-react";
import { CurriculumModule, Lesson, BloomsTaxonomyLevel } from "../../types";
import { useApp } from "../../context/AppContext";

interface LearningMapProps {
  modules: CurriculumModule[];
  completedLessonIds: string[];
  activeLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  searchFilter?: string;
  difficultyFilter?: string;
}

interface MapModuleNode {
  module: CurriculumModule;
  index: number;
  x: number;
  y: number;
  status: "completed" | "in-progress" | "unlocked" | "locked";
  completedLessonsCount: number;
  totalLessonsCount: number;
  completionPercent: number;
  totalXp: number;
  prerequisiteModuleCodes: string[];
  lessons: {
    lesson: Lesson;
    x: number;
    y: number;
    status: "completed" | "in-progress" | "unlocked" | "locked";
    index: number;
  }[];
}

export const LearningMap: React.FC<LearningMapProps> = ({
  modules,
  completedLessonIds,
  activeLessonId,
  onSelectLesson,
  searchFilter = "",
  difficultyFilter = "All",
}) => {
  const { t, userProgress, toggleBookmarkLesson } = useApp();
  const bookmarkedLessons = userProgress.bookmarkedLessons || [];
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    "module-1": true,
    "module-2": true,
  });
  const [viewDetailTab, setViewDetailTab] = useState<"overview" | "lessons" | "prereqs">("overview");

  // Toggle module expansion for branch nodes
  const toggleModuleExpand = (modId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  // Build the hierarchical layout with precise geometric coordinates
  const { moduleNodes, connections, overallStats } = useMemo(() => {
    const nodes: MapModuleNode[] = [];
    const conns: {
      from: { x: number; y: number };
      to: { x: number; y: number };
      fromId: string;
      toId: string;
      status: "completed" | "in-progress" | "unlocked" | "locked";
      type: "spine" | "branch";
    }[] = [];

    // Filter modules if needed
    const activeModules = modules.map((m) => {
      if (difficultyFilter === "All") return m;
      return {
        ...m,
        lessons: m.lessons.filter((l) => l.difficulty === difficultyFilter),
      };
    });

    let prevModuleCompleted = true; // Module 1 is always unlocked

    activeModules.forEach((module, idx) => {
      const lessonIds = module.lessons.map((l) => l.id);
      const completedCount = lessonIds.filter((id) => completedLessonIds.includes(id)).length;
      const totalCount = Math.max(1, module.lessons.length);
      const percent = Math.round((completedCount / totalCount) * 100);
      const isComplete = completedCount === module.lessons.length && module.lessons.length > 0;
      const isUnlocked = idx === 0 || prevModuleCompleted;
      const isCurrent = isUnlocked && !isComplete;

      let modStatus: "completed" | "in-progress" | "unlocked" | "locked" = "locked";
      if (isComplete) modStatus = "completed";
      else if (isCurrent) modStatus = "in-progress";
      else if (isUnlocked) modStatus = "unlocked";

      // S-curve serpentine layout for hierarchical journey visualization
      // Alternates left-to-right and right-to-left for engaging flow
      const row = idx;
      const isEvenRow = row % 2 === 0;
      const spineX = isEvenRow ? 240 : 660;
      const spineY = 140 + row * 220;

      const totalXp = module.lessons.reduce((acc, l) => acc + (l.xpReward || 50), 0);
      const prereqs = idx > 0 ? [activeModules[idx - 1].code || `MODULE 0${idx}`] : [];

      // Calculate sub-nodes for lessons
      const lessonNodes = module.lessons.map((lesson, lIdx) => {
        const isLessonDone = completedLessonIds.includes(lesson.id);
        const prevLessonDone = lIdx === 0 ? isUnlocked : completedLessonIds.includes(module.lessons[lIdx - 1].id);
        const isLessonCurrent = activeLessonId === lesson.id || (prevLessonDone && !isLessonDone);

        let lStatus: "completed" | "in-progress" | "unlocked" | "locked" = "locked";
        if (isLessonDone) lStatus = "completed";
        else if (isLessonCurrent) lStatus = "in-progress";
        else if (prevLessonDone) lStatus = "unlocked";

        // Branch lesson nodes out horizontally from the spine
        const offsetX = isEvenRow ? 180 + lIdx * 110 : -180 - lIdx * 110;
        const offsetY = (lIdx % 2 === 0 ? -35 : 35) + (lIdx - 1.5) * 15;

        return {
          lesson,
          x: spineX + offsetX,
          y: spineY + offsetY,
          status: lStatus,
          index: lIdx,
        };
      });

      nodes.push({
        module,
        index: idx,
        x: spineX,
        y: spineY,
        status: modStatus,
        completedLessonsCount: completedCount,
        totalLessonsCount: module.lessons.length,
        completionPercent: percent,
        totalXp,
        prerequisiteModuleCodes: prereqs,
        lessons: lessonNodes,
      });

      // Spine connectors between modules
      if (idx > 0) {
        const prevNode = nodes[idx - 1];
        let connStatus: "completed" | "in-progress" | "unlocked" | "locked" = "locked";
        if (prevNode.status === "completed" && modStatus === "completed") {
          connStatus = "completed";
        } else if (prevNode.status === "completed" || modStatus === "in-progress") {
          connStatus = "in-progress";
        }

        conns.push({
          from: { x: prevNode.x, y: prevNode.y },
          to: { x: spineX, y: spineY },
          fromId: prevNode.module.id,
          toId: module.id,
          status: connStatus,
          type: "spine",
        });
      }

      // Branch connectors from module center to lesson nodes
      lessonNodes.forEach((lNode) => {
        let branchStatus: "completed" | "in-progress" | "unlocked" | "locked" = lNode.status;
        conns.push({
          from: { x: spineX, y: spineY },
          to: { x: lNode.x, y: lNode.y },
          fromId: module.id,
          toId: lNode.lesson.id,
          status: branchStatus,
          type: "branch",
        });
      });

      prevModuleCompleted = isComplete;
    });

    // Overall stats
    const allLessonsCount = modules.flatMap((m) => m.lessons).length;
    const completedCount = completedLessonIds.length;
    const journeyPercent = Math.min(100, Math.round((completedCount / Math.max(1, allLessonsCount)) * 100));

    return {
      moduleNodes: nodes,
      connections: conns,
      overallStats: {
        totalModules: modules.length,
        completedModules: nodes.filter((n) => n.status === "completed").length,
        totalLessons: allLessonsCount,
        completedLessons: completedCount,
        journeyPercent,
        currentStation: nodes.find((n) => n.status === "in-progress") || nodes[0],
      },
    };
  }, [modules, completedLessonIds, activeLessonId, difficultyFilter]);

  // Active modal / drawer target
  const activeModuleNode = useMemo(() => {
    if (!selectedModuleId) return null;
    return moduleNodes.find((m) => m.module.id === selectedModuleId) || null;
  }, [selectedModuleId, moduleNodes]);

  const activeLessonNode = useMemo(() => {
    if (!selectedLessonId) return null;
    for (const m of moduleNodes) {
      const l = m.lessons.find((ln) => ln.lesson.id === selectedLessonId);
      if (l) return { lessonNode: l, moduleNode: m };
    }
    return null;
  }, [selectedLessonId, moduleNodes]);

  return (
    <div className="space-y-6" id="curriculum-learning-map-root">
      {/* 1. Student Journey Progression Hero Tracker */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-1/4 -mt-12 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 -mb-10 -mr-10 h-48 w-48 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Route className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Curriculum Journey & Dependency Map
              </h2>
              <span className="rounded-full bg-blue-950 border border-blue-800 px-2.5 py-0.5 text-xs font-mono font-semibold text-blue-300">
                SVG Roadmap
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Visualizes the hierarchical dependency tree and learning milestones of prompt engineering. Follow the luminous path from foundation concepts to enterprise-grade AI safety architectures.
            </p>

            {/* Current Journey Station Badge */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Current Milestone:</span>
              <span className="bg-blue-950/80 border border-blue-700/60 text-blue-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-blue-400 animate-spin" style={{ animationDuration: "10s" }} />
                {overallStats.currentStation?.module.code || "MOD-01"}: {overallStats.currentStation?.module.title}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-semibold">
                {overallStats.completedModules}/{overallStats.totalModules} Modules Mastered
              </span>
            </div>
          </div>

          {/* Progress Circular & Journey Metrics */}
          <div className="flex items-center gap-5 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 shrink-0 shadow-inner">
            <div className="relative flex items-center justify-center h-16 w-16">
              <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="text-slate-800"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  className="text-blue-500 transition-all duration-1000 ease-out"
                  strokeWidth="4"
                  strokeDasharray={`${overallStats.journeyPercent * 1.256}, 125.6`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-sm font-extrabold text-white">
                  {overallStats.journeyPercent}%
                </span>
              </div>
            </div>

            <div className="space-y-1 text-left font-mono">
              <div className="text-xs text-slate-400">Student Progression</div>
              <div className="text-sm font-bold text-slate-100">
                {overallStats.completedLessons} / {overallStats.totalLessons} Lessons
              </div>
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <Sparkles className="h-3 w-3" />
                <span>{userProgress.xp} Total XP Earned</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive SVG Map Legend & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs">
        <div className="flex flex-wrap items-center gap-4 text-slate-400 font-medium">
          <span className="font-mono uppercase text-slate-500 tracking-wider">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span className="text-slate-200">Completed & Mastered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50 animate-pulse" />
            <span className="text-slate-200">Active / In-Progress</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-slate-700" />
            <span className="text-slate-400">Locked Prerequisite</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const allExpanded = Object.keys(expandedModules).length === modules.length;
              if (allExpanded) {
                setExpandedModules({});
              } else {
                const full: Record<string, boolean> = {};
                modules.forEach((m) => (full[m.id] = true));
                setExpandedModules(full);
              }
            }}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition"
          >
            {Object.keys(expandedModules).length === modules.length ? "Collapse Lesson Branches" : "Expand All Lesson Branches"}
          </button>
        </div>
      </div>

      {/* 3. Main SVG Visual Learning Map Canvas */}
      <div className="relative rounded-3xl border border-slate-800/90 bg-slate-950/90 shadow-2xl overflow-x-auto overflow-y-hidden p-4 sm:p-8 backdrop-blur-xl">
        {/* Subtle grid backdrop */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#3b82f6 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="min-w-[900px] h-[980px] relative">
          {/* SVG Connector Layer */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 900 980"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Gradients for connections */}
              <linearGradient id="spine-completed-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>

              <linearGradient id="spine-active-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#818cf8" />
              </linearGradient>

              <linearGradient id="branch-completed-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
              </linearGradient>

              <linearGradient id="branch-active-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.5" />
              </linearGradient>

              {/* Glowing filters */}
              <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Render Connectors */}
            {connections.map((conn, cIdx) => {
              const { from, to, status, type, fromId, toId } = conn;
              const isModuleExpanded = expandedModules[fromId];

              // If it's a branch connector but module is collapsed, hide it
              if (type === "branch" && !isModuleExpanded) {
                return null;
              }

              // Calculate smooth cubic bezier curve
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              let pathD = "";

              if (type === "spine") {
                // S-curve connector for main spine
                const cx1 = from.x;
                const cy1 = from.y + dy * 0.5;
                const cx2 = to.x;
                const cy2 = from.y + dy * 0.5;
                pathD = `M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`;
              } else {
                // Branch connector from spine to lesson node
                const midX = from.x + dx * 0.5;
                pathD = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
              }

              // Visual styling based on completion state
              let strokeColor = "#334155";
              let strokeWidth = type === "spine" ? 4 : 2;
              let strokeDasharray = "";
              let filter = "";

              if (status === "completed") {
                strokeColor = type === "spine" ? "url(#spine-completed-grad)" : "url(#branch-completed-grad)";
                strokeWidth = type === "spine" ? 4 : 2.5;
                filter = "url(#glow-emerald)";
              } else if (status === "in-progress" || status === "unlocked") {
                strokeColor = type === "spine" ? "url(#spine-active-grad)" : "url(#branch-active-grad)";
                strokeWidth = type === "spine" ? 4 : 2.5;
                filter = "url(#glow-blue)";
                strokeDasharray = type === "spine" ? "8,4" : "";
              } else {
                strokeColor = "#1e293b";
                strokeDasharray = "4,4";
              }

              return (
                <g key={`conn-${cIdx}`}>
                  {/* Background shadow stroke for contrast */}
                  <path
                    d={pathD}
                    stroke="#020617"
                    strokeWidth={strokeWidth + 4}
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Main SVG path */}
                  <path
                    d={pathD}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    filter={filter}
                    fill="none"
                    strokeLinecap="round"
                    className={status === "in-progress" ? "transition-all duration-300" : ""}
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive HTML Nodes overlay placed at SVG coordinates */}
          {moduleNodes.map((modNode) => {
            const isSelected = selectedModuleId === modNode.module.id;
            const isExpanded = expandedModules[modNode.module.id];

            return (
              <div key={modNode.module.id}>
                {/* 1. Primary Module Node Card */}
                <div
                  style={{
                    position: "absolute",
                    left: `${modNode.x}px`,
                    top: `${modNode.y}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className="z-20"
                >
                  <div
                    onClick={() => {
                      setSelectedModuleId(modNode.module.id);
                      setSelectedLessonId(null);
                    }}
                    onMouseEnter={() => setHoveredNodeId(modNode.module.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 w-72 border backdrop-blur-md shadow-2xl ${
                      modNode.status === "completed"
                        ? "bg-slate-900/95 border-emerald-500/60 shadow-emerald-950/40 hover:border-emerald-400 hover:scale-[1.02]"
                        : modNode.status === "in-progress"
                        ? "bg-slate-900/95 border-blue-500 shadow-blue-900/40 ring-2 ring-blue-500/40 hover:scale-[1.02]"
                        : modNode.status === "unlocked"
                        ? "bg-slate-900/90 border-slate-700 hover:border-slate-500 hover:scale-[1.01]"
                        : "bg-slate-950/90 border-slate-800 text-slate-500 opacity-60 hover:opacity-80"
                    } ${isSelected ? "ring-2 ring-amber-400" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800/60">
                          {modNode.module.code || `MOD 0${modNode.index + 1}`}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          Tier {modNode.index + 1}
                        </span>
                      </div>

                      {/* Status badge */}
                      {modNode.status === "completed" ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-700/60 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Mastered
                        </span>
                      ) : modNode.status === "in-progress" ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-blue-300 bg-blue-950/80 border border-blue-700/80 px-2 py-0.5 rounded-full animate-pulse">
                          <Play className="h-2.5 w-2.5 fill-blue-400" /> Active
                        </span>
                      ) : modNode.status === "unlocked" ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-300 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded-full">
                          Available
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-800/70 border border-slate-700/60 px-2 py-0.5 rounded-full">
                          <Lock className="h-2.5 w-2.5" /> Locked
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                      {modNode.module.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {modNode.module.description}
                    </p>

                    {/* Progress & Lesson Count */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-xs text-slate-400 font-medium">Lesson Progress</span>
                        <span className="font-mono text-xs font-bold text-slate-200">
                          {modNode.completionPercent}% ({modNode.completedLessonsCount}/{modNode.totalLessonsCount})
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            modNode.status === "completed"
                              ? "bg-emerald-400"
                              : "bg-gradient-to-r from-blue-500 to-indigo-400"
                          }`}
                          style={{ width: `${modNode.completionPercent}%` }}
                        />
                      </div>
                      <div className="pt-1 flex items-center justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleModuleExpand(modNode.module.id);
                          }}
                          className="flex items-center gap-1 font-mono text-xs text-blue-400 hover:text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-900/60"
                        >
                          <span>{isExpanded ? "Hide Lessons" : "View Lessons"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Branch Lesson Sub-Nodes */}
                {isExpanded &&
                  modNode.lessons.map((lNode) => {
                    const isLessonSelected = selectedLessonId === lNode.lesson.id;

                    return (
                      <div
                        key={lNode.lesson.id}
                        style={{
                          position: "absolute",
                          left: `${lNode.x}px`,
                          top: `${lNode.y}px`,
                          transform: "translate(-50%, -50%)",
                        }}
                        className="z-30"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLessonId(lNode.lesson.id);
                            setSelectedModuleId(modNode.module.id);
                            if (lNode.status !== "locked") {
                              onSelectLesson(lNode.lesson);
                            }
                          }}
                          onMouseEnter={() => setHoveredNodeId(lNode.lesson.id)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                          className={`group cursor-pointer rounded-xl p-2.5 transition-all duration-200 w-52 text-left border backdrop-blur-md shadow-lg ${
                            lNode.status === "completed"
                              ? "bg-slate-900/90 border-emerald-500/50 hover:border-emerald-400 hover:scale-105"
                              : lNode.status === "in-progress"
                              ? "bg-blue-950/90 border-blue-400 ring-2 ring-blue-500/30 hover:scale-105"
                              : lNode.status === "unlocked"
                              ? "bg-slate-900/90 border-slate-700 hover:border-blue-400 hover:scale-105"
                              : "bg-slate-950/90 border-slate-800 opacity-50 cursor-not-allowed"
                          } ${isLessonSelected ? "ring-2 ring-amber-400" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono text-xs text-slate-400">
                              L{lNode.index + 1} • {lNode.lesson.difficulty}
                            </span>
                            {lNode.status === "completed" ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : lNode.status === "in-progress" ? (
                              <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
                            ) : lNode.status === "locked" ? (
                              <Lock className="h-2.5 w-2.5 text-slate-400" />
                            ) : null}
                          </div>

                          <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
                            {lNode.lesson.title}
                          </h4>

                          <div className="mt-1 flex items-center justify-between text-xs text-slate-400 font-mono">
                            <span>{lNode.lesson.estimatedMinutes}m</span>
                            <span className="text-amber-400">+{lNode.lesson.xpReward || 50} XP</span>
                          </div>
                        </button>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Interactive Node Detail Drawer when a Module or Lesson is clicked */}
      {activeModuleNode && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5 sm:p-7 shadow-2xl backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                  {activeModuleNode.module.code || "MODULE"}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activeModuleNode.module.level || "Track Core"}
                </span>
                {activeModuleNode.status === "completed" && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                    <CheckCircle2 className="h-3 w-3" /> Mastered
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mt-1.5">
                {activeModuleNode.module.title}
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                {activeModuleNode.module.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {activeModuleNode.status !== "locked" && (
                <button
                  onClick={() => {
                    const target = activeModuleNode.module.lessons[0];
                    if (target) onSelectLesson(target);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-900/30 transition"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Start Module Lessons</span>
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedModuleId(null);
                  setSelectedLessonId(null);
                }}
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>

          {/* Module Lesson Progress Bar */}
          <div className="py-3 px-4 rounded-xl bg-slate-950/70 border border-slate-800/80 my-3">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className={`h-3.5 w-3.5 ${activeModuleNode.status === "completed" ? "text-emerald-400" : "text-blue-400"}`} />
                Lesson Progress
              </span>
              <span className="font-bold text-slate-200">
                <span className={activeModuleNode.status === "completed" ? "text-emerald-400 font-bold" : "text-blue-400 font-bold"}>
                  {activeModuleNode.completionPercent}%
                </span>
                <span className="text-slate-400 ml-1.5 font-normal">
                  ({activeModuleNode.completedLessonsCount} of {activeModuleNode.totalLessonsCount} completed)
                </span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activeModuleNode.status === "completed"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : "bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400"
                }`}
                style={{ width: `${activeModuleNode.completionPercent}%` }}
              />
            </div>
          </div>

          {/* Module Lessons Grid within Detail */}
          <div className="pt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Module Lesson Hierarchy & Progression ({activeModuleNode.completedLessonsCount}/{activeModuleNode.totalLessonsCount} Done)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {activeModuleNode.module.lessons.map((lesson, idx) => {
                const isDone = completedLessonIds.includes(lesson.id);
                const isCurrent = activeLessonId === lesson.id;
                const isBookmarked = bookmarkedLessons.includes(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson)}
                    className={`rounded-xl p-3 text-left border transition cursor-pointer group ${
                      isDone
                        ? "bg-slate-950/80 border-emerald-600/50 hover:border-emerald-400"
                        : isCurrent
                        ? "bg-blue-950/70 border-blue-500"
                        : "bg-slate-950/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span>Step {idx + 1}</span>
                        {isBookmarked && (
                          <span className="text-amber-400 text-xs flex items-center gap-0.5" title="Saved to bookmarks">
                            <Bookmark className="h-3 w-3 fill-amber-400" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmarkLesson(lesson.id);
                          }}
                          className={`h-6 w-6 rounded flex items-center justify-center transition-all ${
                            isBookmarked
                              ? "text-amber-400 bg-amber-500/20 hover:bg-amber-500/30"
                              : "text-slate-500 hover:text-white hover:bg-slate-800"
                          }`}
                          title={isBookmarked ? "Remove bookmark" : "Bookmark lesson"}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                        </button>
                        {isDone ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <span>+{lesson.xpReward || 50} XP</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-white line-clamp-1">{lesson.title}</div>
                    <div className="text-xs text-slate-400 mt-1 line-clamp-2">{lesson.subtitle}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
