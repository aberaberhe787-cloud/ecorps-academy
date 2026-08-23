import React from "react";
import { CheckCircle2, AlertCircle, Sparkles, Tag, ShieldCheck, HelpCircle } from "lucide-react";
import { analyzePrompt } from "../lib/promptAnalyzer";

interface PromptQualityMeterProps {
  promptText: string;
  onApplySuggestion?: (suggestedTechnique: string) => void;
}

export const PromptQualityMeter: React.FC<PromptQualityMeterProps> = ({
  promptText,
  onApplySuggestion
}) => {
  const analysis = analyzePrompt(promptText);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (score >= 75) return "text-blue-400 border-blue-500/40 bg-blue-500/10";
    if (score >= 50) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-rose-400 border-rose-500/40 bg-rose-500/10";
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 75) return "bg-blue-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div id="prompt-quality-meter" className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-sm">
      {/* Header with Score and Grade */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-200">Real-Time Prompt Quality Score</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            {analysis.wordCount} words • ~{analysis.tokenEstimate} tokens
          </span>
          <div
            id="prompt-grade-badge"
            className={`flex items-center justify-center rounded-lg border px-2.5 py-0.5 font-mono text-xs font-bold ${getScoreColor(
              analysis.score
            )}`}
          >
            Grade: {analysis.grade} ({analysis.score}/100)
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full transition-all duration-300 ${getProgressBarColor(analysis.score)}`}
          style={{ width: `${Math.max(5, analysis.score)}%` }}
        />
      </div>

      {/* Detected Technique Badges */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
          <Tag className="h-3 w-3" /> Detected:
        </span>
        {analysis.techniqueBadges.length > 0 ? (
          analysis.techniqueBadges.map((badge, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-md bg-blue-950/70 border border-blue-800/60 px-2 py-0.5 text-[11px] font-medium text-blue-300"
            >
              <CheckCircle2 className="h-3 w-3 text-blue-400" />
              {badge}
            </span>
          ))
        ) : (
          <span className="text-[11px] text-slate-500 italic">No advanced prompting techniques detected yet.</span>
        )}
      </div>

      {/* Suggestions or Strengths */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
        {analysis.strengths.length > 0 && (
          <div className="rounded-lg bg-slate-950/50 border border-slate-800/80 p-2.5">
            <span className="font-semibold text-emerald-400 flex items-center gap-1 mb-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Prompt Strengths
            </span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              {analysis.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.suggestions.length > 0 && (
          <div className="rounded-lg bg-slate-950/50 border border-slate-800/80 p-2.5">
            <span className="font-semibold text-amber-400 flex items-center gap-1 mb-1">
              <AlertCircle className="h-3.5 w-3.5" /> Recommended Upgrades
            </span>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              {analysis.suggestions.map((sug, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
