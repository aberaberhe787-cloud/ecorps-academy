import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  Clock,
  Info,
  Bookmark,
} from "lucide-react";
import { Lesson, CurriculumModule } from "../../types";
import { useApp } from "../../context/AppContext";

interface SkillNode {
  lesson: Lesson;
  moduleId: string;
  moduleCode: string;
  moduleTitle: string;
  tier: number; // 1, 2, 3, 4
  indexInTier: number; // 0, 1, 2, 3
  prerequisites: string[]; // Lesson IDs required
  crossPrereqs?: string[]; // Extra cross-tier requirements
}

interface InteractiveSkillTreeProps {
  modules: CurriculumModule[];
  completedLessonIds: string[];
  activeLessonId: string | null;
  onSelectLesson: (lesson: Lesson) => void;
  searchFilter?: string;
  difficultyFilter?: string;
}

export const InteractiveSkillTree: React.FC<InteractiveSkillTreeProps> = ({
  modules,
  completedLessonIds,
  activeLessonId,
  onSelectLesson,
  searchFilter = "",
  difficultyFilter = "All",
}) => {
  const { userProgress, toggleBookmarkLesson } = useApp();
  const bookmarkedLessons = userProgress.bookmarkedLessons || [];
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Build the ordered skill nodes with explicit unlock dependencies
  const skillNodes: SkillNode[] = useMemo(() => {
    const nodes: SkillNode[] = [];

    // Explicit curriculum graph definitions
    const PREREQUISITE_MAP: Record<string, { prereqs: string[]; crossPrereqs?: string[] }> = {
      // Tier 1: Foundations
      "m1-l1": { prereqs: [] }, // Root: always unlocked
      "m1-l2": { prereqs: ["m1-l1"] },
      "m1-l3": { prereqs: ["m1-l2"] },
      "m1-l4": { prereqs: ["m1-l3"] },

      // Tier 2: Structured Patterns
      "m2-l1": { prereqs: ["m1-l4"] },
      "m2-l2": { prereqs: ["m2-l1"] },
      "m2-l3": { prereqs: ["m2-l2"] },
      "m2-l4": { prereqs: ["m2-l3"] },

      // Tier 3: Reasoning & Orchestration
      "m3-l1": { prereqs: ["m2-l4"] },
      "m3-l2": { prereqs: ["m3-l1"] },
      "m3-l3": { prereqs: ["m3-l2"], crossPrereqs: ["m1-l4"] },
      "m3-l4": { prereqs: ["m3-l3"] },

      // Tier 4: Safety & Robustness
      "m4-l1": { prereqs: ["m3-l4"], crossPrereqs: ["m2-l2"] },
      "m4-l2": { prereqs: ["m4-l1"] },
      "m4-l3": { prereqs: ["m4-l2"] },
      "m4-l4": { prereqs: ["m4-l3"] },
    };

    modules.forEach((mod, modIdx) => {
      mod.lessons.forEach((lesson, lessonIdx) => {
        const dep = PREREQUISITE_MAP[lesson.id] || {
          prereqs: lessonIdx > 0 ? [mod.lessons[lessonIdx - 1].id] : [],
        };

        nodes.push({
          lesson,
          moduleId: mod.id,
          moduleCode: mod.code || `TIER-${modIdx + 1}`,
          moduleTitle: mod.title,
          tier: modIdx + 1,
          indexInTier: lessonIdx,
          prerequisites: dep.prereqs,
          crossPrereqs: dep.crossPrereqs,
        });
      });
    });

    return nodes;
  }, [modules]);

  // Node lookup map
  const nodeMap = useMemo(() => {
    return new Map<string, SkillNode>(skillNodes.map((n) => [n.lesson.id, n]));
  }, [skillNodes]);

  // Determine if a node is unlocked
  const isNodeUnlocked = (node: SkillNode): boolean => {
    if (node.prerequisites.length === 0) return true;
    return node.prerequisites.every((prereqId) =>
      completedLessonIds.includes(prereqId)
    );
  };

  // Selected node object
  const activeDetailNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodeMap.get(selectedNodeId) || null;
  }, [selectedNodeId, nodeMap]);

  // Overall statistics
  const totalSkills = skillNodes.length;
  const completedSkills = skillNodes.filter((n) =>
    completedLessonIds.includes(n.lesson.id)
  ).length;
  const completionPercent = Math.min(
    100,
    Math.round((completedSkills / Math.max(1, totalSkills)) * 100)
  );

  // Filter highlights
  const isHighlighted = (node: SkillNode): boolean => {
    const matchesDifficulty = difficultyFilter === "All" || node.lesson.difficulty === difficultyFilter;
    if (!searchFilter.trim()) {
      return difficultyFilter !== "All" && matchesDifficulty;
    }
    const q = searchFilter.toLowerCase();
    const matchesSearch =
      node.lesson.title.toLowerCase().includes(q) ||
      node.lesson.conceptSummary.toLowerCase().includes(q) ||
      node.lesson.difficulty.toLowerCase().includes(q) ||
      (node.lesson.bloomTaxonomyFocus || "").toLowerCase().includes(q);

    return matchesSearch && matchesDifficulty;
  };

  const tiers = [
    {
      tier: 1,
      name: "Tier 1: Foundations",
      code: "PROMPT-101",
      description: "Latent space steering, deterministic bounding & in-context tokens",
      color: "from-blue-600/20 to-cyan-600/10 border-blue-500/30",
      accent: "text-blue-400",
    },
    {
      tier: 2,
      name: "Tier 2: Cognitive Framing",
      code: "PROMPT-201",
      description: "Few-shot calibration, structured outputs & reasoning chains",
      color: "from-indigo-600/20 to-purple-600/10 border-indigo-500/30",
      accent: "text-indigo-400",
    },
    {
      tier: 3,
      name: "Tier 3: Reasoning & Tools",
      code: "PROMPT-301",
      description: "ReAct patterns, metaprompting & self-consistency ensembles",
      color: "from-emerald-600/20 to-teal-600/10 border-emerald-500/30",
      accent: "text-emerald-400",
    },
    {
      tier: 4,
      name: "Tier 4: Adversarial Safety",
      code: "PROMPT-401",
      description: "Injection defense, constitutional alignment & red-teaming",
      color: "from-rose-600/20 to-amber-600/10 border-rose-500/30",
      accent: "text-rose-400",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Skill Tree Header & Progress Tracker */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-5 shadow-xl backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-base font-bold text-white">
              Curriculum Interactive Skill Tree
            </h2>
            <span className="rounded bg-blue-950 px-2 py-0.5 text-xs sm:text-xs font-mono font-semibold text-blue-300 border border-blue-800/80">
              Prerequisite Graph
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Interactive visual progression map. Master foundational concepts to unlock advanced reasoning and alignment architectures.
          </p>
        </div>

        {/* Tree Mastery Metric */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col text-right">
            <div className="text-xs font-mono text-slate-400">
              Tree Mastery: <span className="font-bold text-white">{completionPercent}%</span>
            </div>
            <div className="text-xs font-semibold text-emerald-400">
              {completedSkills} of {totalSkills} Skills Unlocked
            </div>
          </div>

          <div className="h-10 w-10 relative flex items-center justify-center">
            <svg className="h-10 w-10 -rotate-90 transform" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-blue-500 transition-all duration-700 ease-out"
                strokeDasharray={`${completionPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs sm:text-xs font-bold font-mono text-white">
              {completionPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Tiers Visual Layout */}
      <div className="space-y-6">
        {tiers.map((t) => {
          const tierNodes = skillNodes.filter((n) => n.tier === t.tier);
          const tierCompleted = tierNodes.every((n) =>
            completedLessonIds.includes(n.lesson.id)
          );
          const tierUnlockedCount = tierNodes.filter((n) => isNodeUnlocked(n)).length;

          return (
            <div
              key={t.tier}
              className={`rounded-2xl border bg-gradient-to-r ${t.color} p-3.5 sm:p-5 space-y-4 transition-all`}
            >
              {/* Tier Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`font-mono text-xs font-bold uppercase tracking-wider ${t.accent}`}>
                    {t.code}
                  </span>
                  <span className="text-slate-600">&bull;</span>
                  <h3 className="text-sm font-bold text-white">{t.name}</h3>
                  {tierCompleted && (
                    <span className="flex items-center gap-1 rounded bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-xs sm:text-xs font-bold text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" /> Tier Mastered
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  {tierUnlockedCount}/{tierNodes.length} Unlocked &bull; {t.description}
                </div>
              </div>

              {/* Tier Lesson Progress Bar */}
              {(() => {
                const tierDoneCount = tierNodes.filter((n) => completedLessonIds.includes(n.lesson.id)).length;
                const tierPercent = Math.round((tierDoneCount / (tierNodes.length || 1)) * 100);
                return (
                  <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className={`h-3 w-3 ${tierCompleted ? "text-emerald-400" : "text-blue-400"}`} />
                        Lesson Progress
                      </span>
                      <span className="text-slate-300">
                        <span className={tierCompleted ? "text-emerald-400 font-bold" : "text-blue-400 font-bold"}>
                          {tierPercent}%
                        </span>
                        <span className="text-slate-400 font-normal ml-1">
                          ({tierDoneCount}/{tierNodes.length} completed)
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          tierCompleted ? "bg-emerald-400" : "bg-gradient-to-r from-blue-500 to-cyan-400"
                        }`}
                        style={{ width: `${tierPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Tier Skill Nodes Grid with Connection Connectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative">
                {tierNodes.map((node, nodeIdx) => {
                  const isCompleted = completedLessonIds.includes(node.lesson.id);
                  const isUnlocked = isNodeUnlocked(node);
                  const isCurrentActive = activeLessonId === node.lesson.id;
                  const highlighted = isHighlighted(node);
                  const isBookmarked = bookmarkedLessons.includes(node.lesson.id);

                  // Find prerequisite lesson names for tooltip/lock explanation
                  const prereqNodes = node.prerequisites
                    .map((id) => nodeMap.get(id))
                    .filter(Boolean) as SkillNode[];

                  return (
                    <div key={node.lesson.id} className="relative group flex flex-col">
                      {/* Node Card */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedNodeId(node.lesson.id);
                          if (isUnlocked) {
                            onSelectLesson(node.lesson);
                          }
                        }}
                        className={`w-full text-left rounded-xl p-4 transition-all duration-200 flex flex-col justify-between h-full border ${
                          isCompleted
                            ? "bg-slate-900/90 border-emerald-500/50 shadow-emerald-950/20 shadow-lg hover:border-emerald-400"
                            : isUnlocked
                            ? isCurrentActive
                              ? "bg-blue-950/70 border-blue-400 shadow-blue-900/30 shadow-lg ring-2 ring-blue-500/40"
                              : "bg-slate-900/90 border-blue-500/40 hover:border-blue-400 hover:bg-slate-800/90 shadow-md"
                            : "bg-slate-950/80 border-slate-800 text-slate-500 opacity-70 hover:opacity-90"
                        } ${highlighted ? "ring-2 ring-amber-400 bg-amber-950/20" : ""}`}
                      >
                        <div>
                          {/* Card Top Meta */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs sm:text-xs text-slate-400 font-semibold">
                                STEP {node.tier}.{node.indexInTier + 1}
                              </span>
                              {isBookmarked && (
                                <span className="flex items-center text-amber-400" title="Saved to bookmarks">
                                  <Bookmark className="h-3 w-3 fill-amber-400" />
                                </span>
                              )}
                            </div>

                            {isCompleted ? (
                              <span className="flex items-center gap-1 text-xs sm:text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded">
                                <CheckCircle2 className="h-3 w-3" /> Mastered
                              </span>
                            ) : isUnlocked ? (
                              <span className="flex items-center gap-1 text-xs sm:text-xs font-bold text-blue-400 bg-blue-950/60 border border-blue-800/50 px-1.5 py-0.5 rounded">
                                <Play className="h-2.5 w-2.5 fill-blue-400" /> Available
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-xs sm:text-xs font-semibold text-slate-400 bg-slate-800/70 border border-slate-700/60 px-1.5 py-0.5 rounded">
                                <Lock className="h-2.5 w-2.5" /> Locked
                              </span>
                            )}
                          </div>

                          {/* Lesson Title */}
                          <h4
                            className={`text-xs font-bold line-clamp-2 leading-snug ${
                              isCompleted
                                ? "text-slate-100 group-hover:text-emerald-300"
                                : isUnlocked
                                ? "text-slate-100 group-hover:text-blue-300"
                                : "text-slate-400"
                            }`}
                          >
                            {node.lesson.title}
                          </h4>

                          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {node.lesson.subtitle}
                          </p>
                        </div>

                        {/* Card Bottom Meta */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-xs">
                          <div className="flex items-center gap-2 text-slate-400 font-mono">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>{node.lesson.estimatedMinutes}m</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmarkLesson(node.lesson.id);
                              }}
                              className={`h-5 w-5 rounded flex items-center justify-center transition-all ${
                                isBookmarked
                                  ? "text-amber-400 bg-amber-500/20 hover:bg-amber-500/30"
                                  : "text-slate-500 hover:text-white hover:bg-slate-800"
                              }`}
                              title={isBookmarked ? "Remove bookmark" : "Bookmark this topic"}
                            >
                              <Bookmark className={`h-3 w-3 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                            </button>
                          </div>

                          <span className="font-mono font-bold text-amber-300">
                            +{node.lesson.xpReward || 50} XP
                          </span>
                        </div>

                        {/* If locked, explicit unlock prompt */}
                        {!isUnlocked && prereqNodes.length > 0 && (
                          <div className="mt-2 text-xs sm:text-xs text-amber-400/90 bg-amber-950/30 border border-amber-900/40 p-1.5 rounded flex items-start gap-1">
                            <Info className="h-3 w-3 shrink-0 mt-0.5 text-amber-400" />
                            <span>
                              Requires:{" "}
                              <strong className="text-amber-300">
                                {prereqNodes.map((p) => p.lesson.title).join(", ")}
                              </strong>
                            </span>
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Detail Drawer for Selected Node */}
      {activeDetailNode && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl animate-in fade-in duration-200">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400 uppercase">
                  {activeDetailNode.moduleCode} &bull; Skill Focus
                </span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-xs sm:text-xs font-mono text-slate-300">
                  {activeDetailNode.lesson.difficulty}
                </span>
                {activeDetailNode.lesson.bloomTaxonomyFocus && (
                  <span className="rounded bg-indigo-950 border border-indigo-800/80 px-2 py-0.5 text-xs sm:text-xs font-mono text-indigo-300">
                    Bloom: {activeDetailNode.lesson.bloomTaxonomyFocus}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                {activeDetailNode.lesson.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {activeDetailNode.lesson.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleBookmarkLesson(activeDetailNode.lesson.id)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                  bookmarkedLessons.includes(activeDetailNode.lesson.id)
                    ? "border-amber-500/60 bg-amber-950/70 text-amber-300 hover:bg-amber-900/50"
                    : "border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                }`}
                title={bookmarkedLessons.includes(activeDetailNode.lesson.id) ? "Remove bookmark" : "Bookmark this topic"}
              >
                <Bookmark className={`h-3.5 w-3.5 ${bookmarkedLessons.includes(activeDetailNode.lesson.id) ? "fill-amber-400 text-amber-400" : ""}`} />
                <span>{bookmarkedLessons.includes(activeDetailNode.lesson.id) ? "Saved" : "Save"}</span>
              </button>

              <button
                onClick={() => setSelectedNodeId(null)}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
              >
                Close Preview
              </button>

              {isNodeUnlocked(activeDetailNode) ? (
                <button
                  onClick={() => onSelectLesson(activeDetailNode.lesson)}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-500 shadow-md transition-colors"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>
                    {completedLessonIds.includes(activeDetailNode.lesson.id)
                      ? "Review Skill"
                      : "Start Learning Now"}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-3.5 py-1.5 text-xs text-slate-400 cursor-not-allowed">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Complete Prerequisite to Unlock</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Core Theoretical Principle
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {activeDetailNode.lesson.conceptSummary}
                </p>
              </div>

              {activeDetailNode.lesson.objective && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Learning Objective
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {activeDetailNode.lesson.objective}
                  </p>
                </div>
              )}
            </div>

            <div className="md:col-span-4 rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Unlock Requirements
                </h4>
                {activeDetailNode.prerequisites.length === 0 ? (
                  <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Root Skill (Always Unlocked)
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {activeDetailNode.prerequisites.map((prereqId) => {
                      const pNode = nodeMap.get(prereqId);
                      const isPrereqDone = completedLessonIds.includes(prereqId);
                      return (
                        <div
                          key={prereqId}
                          className={`flex items-center justify-between text-xs p-2 rounded-lg border ${
                            isPrereqDone
                              ? "bg-emerald-950/30 border-emerald-900 text-emerald-300"
                              : "bg-slate-900 border-slate-800 text-slate-400"
                          }`}
                        >
                          <span className="truncate pr-2">
                            {pNode?.lesson.title || prereqId}
                          </span>
                          {isPrereqDone ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                          ) : (
                            <Lock className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>XP Bounty:</span>
                <span className="font-bold text-amber-300">
                  +{activeDetailNode.lesson.xpReward || 50} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
