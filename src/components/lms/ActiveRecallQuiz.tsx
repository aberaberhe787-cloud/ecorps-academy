import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Code2
} from "lucide-react";
import { InteractiveChallenge, QuizInteractionState } from "../../types";

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
  const [interactionState, setInteractionState] = useState<QuizInteractionState>(
    isCompleted ? "submitted" : "idle"
  );
  const [isCorrect, setIsCorrect] = useState<boolean>(isCompleted);

  const handleSelectOption = (optId: string) => {
    if (isCompleted && isCorrect) return;
    setSelectedOption(optId);
    setInteractionState("selected");
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;

    let correct = false;
    if (Array.isArray(challenge.correctAnswer)) {
      correct = challenge.correctAnswer.includes(selectedOption);
    } else {
      correct = selectedOption === challenge.correctAnswer;
    }

    setIsCorrect(correct);
    setInteractionState("submitted");

    if (correct && !isCompleted) {
      onPassed(challenge.xpReward || 25);
    }
  };

  const handleRetry = () => {
    setInteractionState("retrying");
    setSelectedOption(null);
    setIsCorrect(false);
  };

  const hasSubmitted = interactionState === "submitted";

  return (
    <section
      id={`quiz-checkpoint-${challenge.id}`}
      className="my-6 rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-4"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-blue-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400">
            CHECK YOUR UNDERSTANDING
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-amber-300">
            +{challenge.xpReward || 25} XP
          </span>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
              <CheckCircle2 className="h-3.5 w-3.5" /> Passed
            </span>
          )}
        </div>
      </div>

      {/* Question */}
      <div className="space-y-2">
        <p className="text-xs text-slate-400">{challenge.instructions}</p>
        <p className="text-sm font-semibold text-white">{challenge.question}</p>
      </div>

      {/* Defective Prompt Display if Present */}
      {challenge.brokenPrompt && (
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Code2 className="h-3.5 w-3.5 text-amber-400" />
            <span>Target prompt to evaluate:</span>
          </div>
          <pre className="font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
            {challenge.brokenPrompt}
          </pre>
        </div>
      )}

      {/* Options */}
      {challenge.options && (
        <div className="space-y-2 pt-1">
          {challenge.options.map((option) => {
            const isSelected = selectedOption === option.id;
            const isOptionCorrect = Array.isArray(challenge.correctAnswer)
              ? challenge.correctAnswer.includes(option.id)
              : option.id === challenge.correctAnswer;

            let optionClass = "border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700";

            if (hasSubmitted) {
              if (isOptionCorrect) {
                optionClass = "border-emerald-500/80 bg-emerald-950/40 text-emerald-200 font-medium";
              } else if (isSelected && !isOptionCorrect) {
                optionClass = "border-rose-500/80 bg-rose-950/40 text-rose-200";
              }
            } else if (isSelected) {
              optionClass = "border-blue-500 bg-blue-950/60 text-white";
            }

            return (
              <button
                key={option.id}
                id={`quiz-option-${challenge.id}-${option.id}`}
                onClick={() => handleSelectOption(option.id)}
                disabled={hasSubmitted && isCorrect}
                className={`w-full text-left rounded-xl border p-3.5 transition-all text-xs flex items-start justify-between gap-3 cursor-pointer ${optionClass}`}
              >
                <div className="space-y-1 flex-1">
                  <span className="text-slate-200 leading-relaxed block">{option.text}</span>
                  {option.code && (
                    <pre className="mt-1 rounded bg-slate-900 p-2 font-mono text-xs text-blue-200 overflow-x-auto whitespace-pre-wrap">
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

      {/* Action / Feedback */}
      {!hasSubmitted ? (
        <div className="pt-2 flex justify-end">
          <button
            id={`submit-quiz-${challenge.id}`}
            onClick={handleCheckAnswer}
            disabled={!selectedOption}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <span>Check answer</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3 pt-2">
          <div
            className={`rounded-xl border p-3.5 space-y-1.5 text-xs ${
              isCorrect
                ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-200"
                : "border-rose-500/40 bg-rose-950/20 text-rose-200"
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Correct! {challenge.feedback.success}</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <span>{challenge.feedback.failure}</span>
                </>
              )}
            </div>
            {challenge.feedback.theoreticalRationale && (
              <p className="text-slate-300 pt-1 border-t border-slate-800">
                <span className="font-semibold text-blue-300">Rationale: </span>
                {challenge.feedback.theoreticalRationale}
              </p>
            )}
          </div>

          {!isCorrect && (
            <div className="flex justify-end">
              <button
                id={`retry-quiz-${challenge.id}`}
                onClick={handleRetry}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
