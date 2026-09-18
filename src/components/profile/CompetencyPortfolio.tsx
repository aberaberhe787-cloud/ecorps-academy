import React, { useState } from "react";
import {
  CompetencyEvidence,
  CompetencyLevel,
  CompetencyState,
  EvidenceWeight,
} from "../../types";
import { useApp } from "../../context/AppContext";
import {
  Shield,
  Award,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Flame,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lock,
  Layers,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

interface CompetencyPortfolioProps {
  competencyStates: CompetencyState[];
}

const LEVEL_COLORS: Record<
  CompetencyLevel,
  { bg: string; border: string; text: string; dot: string }
> = {
  Mastered: {
    bg: "bg-purple-950/40",
    border: "border-purple-600/60",
    text: "text-purple-300",
    dot: "bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]",
  },
  Proficient: {
    bg: "bg-emerald-950/40",
    border: "border-emerald-600/60",
    text: "text-emerald-300",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
  },
  Practicing: {
    bg: "bg-amber-950/40",
    border: "border-amber-600/60",
    text: "text-amber-300",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
  },
  Introduced: {
    bg: "bg-blue-950/40",
    border: "border-blue-600/60",
    text: "text-blue-300",
    dot: "bg-blue-400",
  },
  "Not Started": {
    bg: "bg-slate-900/40",
    border: "border-slate-800",
    text: "text-slate-400",
    dot: "bg-slate-600",
  },
};

const WEIGHT_BADGES: Record<EvidenceWeight, { label: string; bg: string; text: string }> = {
  assessment: {
    label: "Assessment",
    bg: "bg-purple-900/60 border border-purple-750",
    text: "text-purple-300",
  },
  demonstration: {
    label: "Demonstration",
    bg: "bg-emerald-900/60 border border-emerald-750",
    text: "text-emerald-300",
  },
  practice: {
    label: "Practice",
    bg: "bg-amber-900/60 border border-amber-750",
    text: "text-amber-300",
  },
  exposure: {
    label: "Exposure",
    bg: "bg-blue-900/60 border border-blue-750",
    text: "text-blue-300",
  },
};

export const CompetencyPortfolio: React.FC<CompetencyPortfolioProps> = ({
  competencyStates,
}) => {
  const { setActiveTab, setActiveLessonId, openSandbox } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string>("all");

  const totalMastered = competencyStates.filter((s) => s.level === "Mastered").length;
  const totalProficient = competencyStates.filter((s) => s.level === "Proficient").length;
  const totalPracticing = competencyStates.filter((s) => s.level === "Practicing").length;
  const totalIntroduced = competencyStates.filter((s) => s.level === "Introduced").length;
  const totalEvidence = competencyStates.reduce((acc, s) => acc + s.evidence.length, 0);

  const filteredStates = competencyStates.filter((s) => {
    if (filterLevel === "all") return true;
    return s.level === filterLevel;
  });

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleNavigateToSource = (evidence: CompetencyEvidence) => {
    if (evidence.sourceId.startsWith("m") && evidence.sourceId.includes("-l")) {
      setActiveLessonId(evidence.sourceId);
      setActiveTab("curriculum");
    } else if (evidence.sourceId.startsWith("foundation-")) {
      setActiveLessonId(evidence.sourceId);
      setActiveTab("foundations");
    } else if (evidence.sourceId.startsWith("mission-")) {
      openSandbox("missions");
    } else if (evidence.sourceId.startsWith("ctf-")) {
      openSandbox("ctf");
    } else if (evidence.sourceId.includes("assessment")) {
      setActiveTab("certification");
    }
  };

  return (
    <section className="space-y-4">
      {/* Header and Summary Cards */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            Unified Competency Portfolio
          </h2>
          <p className="text-xs text-slate-400">
            Authoritative mastery tracking connecting curriculum exposure, lab practice, adversarial challenges, and capstone assessments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg">
            {totalEvidence} Verified Evidence Units
          </span>
        </div>
      </div>

      {/* Progress Metric Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-purple-800/40 bg-purple-950/20 p-3 flex flex-col">
          <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
            Mastered
          </span>
          <span className="text-2xl font-black text-purple-200 mt-1">{totalMastered}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Authoritative proof</span>
        </div>

        <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-3 flex flex-col">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            Proficient
          </span>
          <span className="text-2xl font-black text-emerald-200 mt-1">{totalProficient}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Hands-on demonstrated</span>
        </div>

        <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-3 flex flex-col">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
            Practicing
          </span>
          <span className="text-2xl font-black text-amber-200 mt-1">{totalPracticing}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Active exercises</span>
        </div>

        <div className="rounded-xl border border-blue-800/40 bg-blue-950/20 p-3 flex flex-col">
          <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
            Introduced
          </span>
          <span className="text-2xl font-black text-blue-200 mt-1">{totalIntroduced}</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Conceptual foundation</span>
        </div>
      </div>

      {/* Level Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-500 font-mono text-[11px] mr-1">Filter:</span>
        {[
          { id: "all", label: `All (${competencyStates.length})` },
          { id: "Mastered", label: `Mastered (${totalMastered})` },
          { id: "Proficient", label: `Proficient (${totalProficient})` },
          { id: "Practicing", label: `Practicing (${totalPracticing})` },
          { id: "Introduced", label: `Introduced (${totalIntroduced})` },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterLevel(f.id)}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
              filterLevel === f.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Competencies List */}
      <div className="space-y-3">
        {filteredStates.map((state) => {
          const isExpanded = expandedId === state.competency.id;
          const style = LEVEL_COLORS[state.level];
          const hasEvidence = state.evidence.length > 0;

          const exposureCount = state.evidence.filter((e) => e.weight === "exposure").length;
          const practiceCount = state.evidence.filter((e) => e.weight === "practice").length;
          const demonstrationCount = state.evidence.filter(
            (e) => e.weight === "demonstration"
          ).length;
          const assessmentCount = state.evidence.filter(
            (e) => e.weight === "assessment"
          ).length;

          return (
            <div
              key={state.competency.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? `${style.border} ${style.bg}`
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              {/* Card Header Row */}
              <div
                onClick={() => toggleExpand(state.competency.id)}
                className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-blue-400 bg-blue-950/60 border border-blue-900/70 px-2 py-0.5 rounded">
                      {state.competency.domain}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                      {state.competency.level}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {state.competency.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {state.competency.description}
                  </p>
                </div>

                {/* Status & Evidence Indicators */}
                <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                      <span className={`text-xs font-bold ${style.text}`}>
                        {state.level}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {state.evidence.length} evidence point{state.evidence.length !== 1 ? "s" : ""}
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label="Toggle competency evidence trail"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 border border-slate-700/60"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Evidence Bar Summary */}
              <div className="px-4 pb-3 flex flex-wrap items-center gap-2 border-t border-slate-800/40 pt-2 text-[11px]">
                <span className="text-slate-500 font-mono text-[10px]">Evidence Mix:</span>
                {assessmentCount > 0 && (
                  <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/80 text-purple-300 font-medium">
                    {assessmentCount} Assessment
                  </span>
                )}
                {demonstrationCount > 0 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-medium">
                    {demonstrationCount} Demonstration
                  </span>
                )}
                {practiceCount > 0 && (
                  <span className="px-2 py-0.5 rounded bg-amber-950/80 border border-amber-800/80 text-amber-300 font-medium">
                    {practiceCount} Practice
                  </span>
                )}
                {exposureCount > 0 && (
                  <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/80 text-blue-300 font-medium">
                    {exposureCount} Exposure
                  </span>
                )}
                {state.evidence.length === 0 && (
                  <span className="text-slate-500 italic">No evidence recorded yet</span>
                )}
              </div>

              {/* Expanded Details Drawer */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-3 border-t border-slate-800 bg-slate-950/70 space-y-4">
                  {/* Explanation & Milestone Guidance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                        <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
                        Mastery State Explanation
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {state.explanation}
                      </p>
                    </div>

                    <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                        Next Milestone Directive
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {state.nextMilestone}
                      </p>
                    </div>
                  </div>

                  {/* Related Prompt Engineering Techniques */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Domain Techniques
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {state.competency.relatedTechniques.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 rounded-md text-[11px] font-mono bg-slate-900 border border-slate-700/80 text-slate-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Verified Evidence Trail */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-amber-400" />
                        Verified Evidence Trail ({state.evidence.length})
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Authoritative Proof
                      </span>
                    </div>

                    {hasEvidence ? (
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {state.evidence.map((ev) => {
                          const badge = WEIGHT_BADGES[ev.weight];
                          return (
                            <div
                              key={ev.id}
                              className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-800/90 bg-slate-900/70 hover:border-slate-700 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-slate-200 truncate">
                                    {ev.title}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {ev.summary}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${badge.bg} ${badge.text}`}
                                >
                                  {badge.label}
                                </span>
                                <button
                                  onClick={() => handleNavigateToSource(ev)}
                                  title="Review source activity"
                                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 text-center rounded-lg border border-dashed border-slate-800 text-slate-500 text-xs">
                        No learning activities completed yet for this competency domain.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
