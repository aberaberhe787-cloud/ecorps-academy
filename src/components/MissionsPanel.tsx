import React, { useState } from "react";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Zap,
  Target,
  Award
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { missions } from "../data/missionsData";
import { Mission } from "../types";

export const MissionsPanel: React.FC = () => {
  const {
    activeMissionId,
    setActiveMissionId,
    prompt,
    setPrompt,
    setSystemInstruction,
    isEvaluatingMission,
    missionResult,
    evaluateMission,
    userProgress
  } = useApp();

  const [revealedHints, setRevealedHints] = useState<{ [missionId: string]: number }>({});
  const [showSolutionModal, setShowSolutionModal] = useState(false);

  const selectedMission: Mission =
    missions.find((m) => m.id === activeMissionId) || missions[0];

  const handleSelectMission = (mission: Mission) => {
    setActiveMissionId(mission.id);
  };

  const handleLoadInitialPrompt = () => {
    setPrompt(selectedMission.initialPrompt);
    if (selectedMission.systemInstruction) {
      setSystemInstruction(selectedMission.systemInstruction);
    }
  };

  const handleRevealNextHint = () => {
    const current = revealedHints[selectedMission.id] || 0;
    if (current < selectedMission.hints.length) {
      setRevealedHints({
        ...revealedHints,
        [selectedMission.id]: current + 1
      });
    }
  };

  const handleRunEvaluation = async () => {
    await evaluateMission(selectedMission.id, prompt);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Beginner":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Intermediate":
        return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "Advanced":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case "Expert":
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const isCompleted = userProgress.completedMissions.includes(selectedMission.id);
  const bestScore = userProgress.missionScores[selectedMission.id] || null;
  const currentHintIndex = revealedHints[selectedMission.id] || 0;

  return (
    <div className="space-y-4">
      {/* Mission Horizontal Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {missions.map((m, idx) => {
          const isDone = userProgress.completedMissions.includes(m.id);
          const isCurrent = m.id === selectedMission.id;
          return (
            <button
              key={m.id}
              id={`mission-tab-${idx + 1}`}
              onClick={() => handleSelectMission(m)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all border ${
                isCurrent
                  ? "bg-blue-600/90 text-white border-blue-500 shadow-md shadow-blue-500/20"
                  : "bg-slate-900/80 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950/60 text-[10px] font-bold">
                {idx + 1}
              </div>
              <span>{m.title.split(":")[1] || m.title}</span>
              {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
            </button>
          );
        })}
      </div>

      {/* Selected Mission Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl backdrop-blur-sm">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold ${getDifficultyColor(selectedMission.difficulty)}`}>
                {selectedMission.difficulty}
              </span>
              <span className="text-xs text-slate-400 font-medium">{selectedMission.category}</span>
              {isCompleted && (
                <span className="flex items-center gap-1 rounded-md bg-emerald-950/70 border border-emerald-700/60 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                  <Trophy className="h-3 w-3 text-emerald-400" /> Completed (Best: {bestScore}%)
                </span>
              )}
            </div>
            <h2 className="mt-2 text-lg font-bold text-white">{selectedMission.title}</h2>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">{selectedMission.description}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              id="load-starter-prompt-btn"
              onClick={handleLoadInitialPrompt}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Load Starter Prompt</span>
            </button>
            <button
              id="view-solution-btn"
              onClick={() => setShowSolutionModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-700/50 bg-indigo-950/40 px-3 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-900/50 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Example Solution</span>
            </button>
          </div>
        </div>

        {/* Target Objectives Checklist */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-blue-400" /> Mission Objectives
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">{selectedMission.objective}</p>

            <div className="mt-3 space-y-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Grading Rubric Criteria:</h4>
              {selectedMission.targetCriteria.map((crit, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[10px] text-blue-400 font-mono">
                    {idx + 1}
                  </div>
                  <span>{crit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progressive Hints & Evaluation Trigger */}
          <div className="flex flex-col justify-between rounded-lg bg-slate-950/60 border border-slate-800/80 p-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5" /> Progressive Hints ({currentHintIndex}/{selectedMission.hints.length})
                </span>
                {currentHintIndex < selectedMission.hints.length && (
                  <button
                    onClick={handleRevealNextHint}
                    className="text-[11px] font-medium text-amber-300 underline hover:text-amber-200"
                  >
                    Reveal Hint +1
                  </button>
                )}
              </div>

              <div className="mt-2.5 space-y-2">
                {currentHintIndex === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    Stuck? Click "Reveal Hint" to get step-by-step guidance without spoiling the solution.
                  </p>
                ) : (
                  selectedMission.hints.slice(0, currentHintIndex).map((hint, i) => (
                    <div key={i} className="rounded bg-amber-950/30 border border-amber-800/40 p-2 text-xs text-amber-200/90 flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-400">H{i + 1}:</span>
                      <span>{hint}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Submit & Grade Button */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                Evaluates prompt against rubric
              </span>
              <button
                id="submit-evaluate-mission-btn"
                onClick={handleRunEvaluation}
                disabled={isEvaluatingMission}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
              >
                <Award className="h-4 w-4" />
                <span>{isEvaluatingMission ? "Grading..." : "Submit for Evaluation (+100 XP)"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Evaluation Results Breakdown Banner */}
        {missionResult && missionResult.missionId === selectedMission.id && (
          <div className="mt-5 rounded-xl border border-blue-900/60 bg-blue-950/30 p-4 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-900/50 pb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl font-mono text-lg font-black border ${
                    missionResult.passed
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  }`}
                >
                  {missionResult.grade}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {missionResult.passed ? "🎉 Mission Passed!" : "⚠️ Needs Improvement"} (Score: {missionResult.score}/100)
                  </h4>
                  <p className="text-xs text-slate-300">{missionResult.generalFeedback}</p>
                </div>
              </div>

              {missionResult.passed && (
                <div className="flex items-center gap-1.5 rounded-lg bg-emerald-950/80 border border-emerald-600/50 px-3 py-1.5 text-xs font-bold text-emerald-300">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span>+{missionResult.xpEarned} XP Earned!</span>
                </div>
              )}
            </div>

            {/* Criteria Breakdown list */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              {missionResult.criteriaChecks.map((check, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 rounded-lg border p-2.5 text-xs ${
                    check.passed
                      ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-200"
                      : "bg-rose-950/20 border-rose-800/40 text-rose-200"
                  }`}
                >
                  {check.passed ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold">{check.criteria}</span>
                    <p className="mt-0.5 text-[11px] text-slate-300">{check.feedback}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Example Solution Modal */}
      {showSolutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Reference Solution: {selectedMission.title}</h3>
              </div>
              <button
                onClick={() => setShowSolutionModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-300 mb-2">
                Study how this solution incorporates personas, structured sections, delimiters, and strict constraints:
              </p>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                {selectedMission.solutionExample}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setPrompt(selectedMission.solutionExample);
                  setShowSolutionModal(false);
                }}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Copy Solution to Editor
              </button>
              <button
                onClick={() => setShowSolutionModal(false)}
                className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
