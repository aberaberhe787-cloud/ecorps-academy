import React, { useState } from "react";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Code2
} from "lucide-react";
import { InteractiveChallenge } from "../../types";

interface ActiveRecallQuizProps {
  challenge: InteractiveChallenge;
  isCompleted: boolean;
  onPassed: (xpReward: number) => void;
}

export const ActiveRecallQuiz: React.FC<ActiveRecallQuizProps> = ({
  challenge,
  isCompleted,
  onPassed,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(isCompleted);
  const [isCorrect, setIsCorrect] = useState<boolean>(isCompleted);
  const [showHint, setShowHint] = useState<boolean>(false);

  const handleSelectOption = (optId: string) => {
    if (isCompleted && hasSubmitted && isCorrect) return;
    setSelectedOption(optId);
    setHasSubmitted(false);
  };

  const handleEvaluate = () => {
    if (!selectedOption) return;
    
    let correct = false;
    if (Array.isArray(challenge.correctAnswer)) {
      correct = challenge.correctAnswer.includes(selectedOption);
    } else {
      correct = selectedOption === challenge.correctAnswer;
    }

    setIsCorrect(correct);
    setHasSubmitted(true);

    if (correct && !isCompleted) {
      onPassed(challenge.xpReward || 25);
    }
  };

  const handleRetry = () => {
    setHasSubmitted(false);
    setSelectedOption(null);
    setShowHint(true);
  };

  return (
    <div
      id={`quiz-checkpoint-${challenge.id}`}
      className={`rounded-2xl border transition-all ${
        isCompleted || (hasSubmitted && isCorrect)
          ? "border-emerald-800/50 bg-emerald-950/10 shadow-lg"
          : "border-blue-800/40 bg-slate-900/90 shadow-xl ring-1 ring-blue-500/20"
      }`}
    >
      {/* Top Banner */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold ${
              isCompleted || (hasSubmitted && isCorrect)
                ? "bg-emerald-900/80 text-emerald-300"
                : "bg-blue-950 text-blue-300 border border-blue-800/60"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
                Active Recall Checkpoint
              </span>
              <span className="rounded bg-slate-800 px-1.5 py-0.2 text-[9px] font-mono text-slate-300">
                Gatekeeper
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">{challenge.title}</h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2.5 py-1 rounded-lg">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            +{challenge.xpReward || 25} XP
          </span>
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-700/50 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5" /> Passed
            </span>
          )}
        </div>
      </div>

      {/* Question & Instructions */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="text-xs text-slate-400 font-medium leading-relaxed">
          {challenge.instructions}
        </div>

        <div className="text-sm font-semibold text-slate-100 leading-snug">
          {challenge.question}
        </div>

        {/* Broken Prompt Display if Spot the Error type */}
        {challenge.brokenPrompt && (
          <div className="rounded-xl border border-rose-900/50 bg-slate-950 p-4 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-rose-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-rose-400" /> Inspect This Defective Prompt:
              </span>
            </div>
            <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {challenge.brokenPrompt}
            </pre>
          </div>
        )}

        {/* Options List */}
        {challenge.options && (
          <div className="space-y-2.5 pt-1">
            {challenge.options.map((option) => {
              const isSelected = selectedOption === option.id;
              const isOptionCorrect = Array.isArray(challenge.correctAnswer)
                ? challenge.correctAnswer.includes(option.id)
                : option.id === challenge.correctAnswer;

              let optionStyle =
                "border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900";

              if (hasSubmitted) {
                if (isOptionCorrect) {
                  optionStyle = "border-emerald-500 bg-emerald-950/50 text-emerald-200 ring-1 ring-emerald-500/50";
                } else if (isSelected && !isOptionCorrect) {
                  optionStyle = "border-rose-500 bg-rose-950/50 text-rose-200 ring-1 ring-rose-500/50";
                }
              } else if (isSelected) {
                optionStyle = "border-blue-500 bg-blue-950/60 text-white ring-1 ring-blue-500/50";
              }

              return (
                <button
                  key={option.id}
                  id={`quiz-option-${challenge.id}-${option.id}`}
                  onClick={() => handleSelectOption(option.id)}
                  disabled={hasSubmitted && isCorrect}
                  className={`w-full text-left rounded-xl border p-3.5 transition-all text-xs flex items-start justify-between gap-3 ${optionStyle}`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="font-medium text-slate-200 leading-relaxed">{option.text}</div>
                    {option.code && (
                      <pre className="mt-1 rounded-lg bg-slate-900/90 p-2 font-mono text-[11px] text-blue-200 overflow-x-auto whitespace-pre-wrap">
                        {option.code}
                      </pre>
                    )}
                  </div>

                  <div className="shrink-0 mt-0.5">
                    {hasSubmitted && isOptionCorrect && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    )}
                    {hasSubmitted && isSelected && !isOptionCorrect && (
                      <XCircle className="h-4 w-4 text-rose-400" />
                    )}
                    {!hasSubmitted && (
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          isSelected ? "border-blue-400 bg-blue-500" : "border-slate-600"
                        }`}
                      >
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Action Button */}
        {!hasSubmitted ? (
          <div className="pt-2 flex justify-end">
            <button
              id={`submit-quiz-${challenge.id}`}
              onClick={handleEvaluate}
              disabled={!selectedOption}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span>Validate Understanding</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {/* Feedback Callout */}
            <div
              className={`rounded-xl border p-4 space-y-2 ${
                isCorrect
                  ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-200"
                  : "border-rose-500/40 bg-rose-950/20 text-rose-200"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Validated! {challenge.feedback.success}</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    <span>Incorrect Choice</span>
                  </>
                )}
              </div>

              {!isCorrect && (
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-rose-300">Target Hint: </span>
                  {challenge.feedback.failure}
                </div>
              )}

              <div className="text-xs text-slate-300 border-t border-slate-800/80 pt-2 leading-relaxed">
                <span className="font-semibold text-blue-300 font-mono">Pedagogical Rationale: </span>
                {challenge.feedback.theoreticalRationale}
              </div>
            </div>

            {/* Retry Button if Incorrect */}
            {!isCorrect && (
              <div className="flex justify-end">
                <button
                  id={`retry-quiz-${challenge.id}`}
                  onClick={handleRetry}
                  className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
