import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Terminal,
  Play,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Code2,
  Layers,
  HelpCircle,
  Zap,
  ArrowRight,
  Check,
  X,
  Eye,
  Sliders,
  FileCode,
  ShieldAlert,
  Cpu
} from "lucide-react";
import { InteractiveChallenge } from "../../types";
import { useApp } from "../../context/AppContext";
import { analyzePrompt } from "../../lib/promptAnalyzer";

interface SandboxChallengeProps {
  challenge: InteractiveChallenge;
  isCompleted: boolean;
  onPassed: (xpReward: number) => void;
}

export const SandboxChallenge: React.FC<SandboxChallengeProps> = ({
  challenge,
  isCompleted,
  onPassed,
}) => {
  const { executeCurrentPrompt, aiMode, t } = useApp();
  const [userPrompt, setUserPrompt] = useState<string>(
    challenge.initialPrompt || challenge.brokenPrompt || ""
  );
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasPassedState, setHasPassedState] = useState<boolean>(isCompleted);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showDiff, setShowDiff] = useState<boolean>(false);

  // Active sandbox stepper sub-step
  const [activeStep, setActiveStep] = useState<number>(hasPassedState ? 4 : 2);

  const analysis = analyzePrompt(userPrompt);
  const rules = challenge.validationRule;

  // Real-time criteria checker
  const criteriaStatus = {
    keywords: rules?.requiredKeywords?.length
      ? rules.requiredKeywords.every((kw) =>
          userPrompt.toLowerCase().includes(kw.toLowerCase())
        )
      : true,
    delimiters: rules?.requiresDelimiters
      ? analysis.detectedFeatures.hasDelimiters
      : true,
    cot: rules?.requiresCoT
      ? analysis.detectedFeatures.hasChainOfThought
      : true,
    json: rules?.requiresJsonFormat
      ? analysis.detectedFeatures.hasFormattingConstraints ||
        userPrompt.toLowerCase().includes("json")
      : true,
    minLength: rules?.minCharLength
      ? userPrompt.length >= rules.minCharLength
      : true,
  };

  const allCriteriaMet =
    criteriaStatus.keywords &&
    criteriaStatus.delimiters &&
    criteriaStatus.cot &&
    criteriaStatus.json &&
    criteriaStatus.minLength;

  const handleRunAndValidate = async () => {
    setIsExecuting(true);
    setValidationErrors([]);
    setActiveStep(3);

    const errors: string[] = [];

    if (rules) {
      if (rules.requiredKeywords && rules.requiredKeywords.length > 0) {
        const missing = rules.requiredKeywords.filter(
          (kw) => !userPrompt.toLowerCase().includes(kw.toLowerCase())
        );
        if (missing.length > 0) {
          errors.push(
            `Missing critical technique keyword(s): "${missing.join('", "')}"`
          );
        }
      }

      if (rules.requiresDelimiters && !analysis.detectedFeatures.hasDelimiters) {
        errors.push(
          "Missing delimiter boundary tags (e.g. <context>...</context>, ```, or triple quotes)."
        );
      }

      if (rules.requiresCoT && !analysis.detectedFeatures.hasChainOfThought) {
        errors.push(
          'Missing explicit reasoning constraint (e.g. "Think step-by-step" or "Provide scratchpad reasoning").'
        );
      }

      if (
        rules.requiresJsonFormat &&
        !analysis.detectedFeatures.hasFormattingConstraints &&
        !userPrompt.toLowerCase().includes("json")
      ) {
        errors.push("Must mandate valid JSON schema or structured output constraints.");
      }

      if (rules.minCharLength && userPrompt.length < rules.minCharLength) {
        errors.push(
          `Prompt is too brief (${userPrompt.length} chars). Add more explicit constraints (min ${rules.minCharLength}).`
        );
      }
    }

    // Execute prompt in live model engine
    try {
      const execResult = await executeCurrentPrompt(userPrompt);
      setTestOutput(execResult.output);
    } catch (err) {
      setTestOutput("Execution completed with local simulator fallback.");
    } finally {
      setIsExecuting(false);
    }

    if (errors.length === 0) {
      setHasPassedState(true);
      setActiveStep(4);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
      if (!isCompleted) {
        onPassed(challenge.xpReward || 40);
      }
    } else {
      setValidationErrors(errors);
      setHasPassedState(false);
    }
  };

  const handleReset = () => {
    setUserPrompt(challenge.initialPrompt || challenge.brokenPrompt || "");
    setTestOutput(null);
    setValidationErrors([]);
    setActiveStep(2);
  };

  return (
    <div
      id={`sandbox-challenge-${challenge.id}`}
      className={`rounded-2xl border transition-all ${
        isCompleted || hasPassedState
          ? "border-emerald-800/60 bg-slate-900/95 shadow-xl ring-1 ring-emerald-500/20"
          : "border-indigo-800/60 bg-slate-900/95 shadow-2xl ring-1 ring-indigo-500/30"
      }`}
    >
      {/* Challenge Stepper Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold transition-all ${
              isCompleted || hasPassedState
                ? "bg-emerald-950 border border-emerald-700 text-emerald-300 shadow-md shadow-emerald-900/30"
                : "bg-indigo-950 border border-indigo-700 text-indigo-300 shadow-md shadow-indigo-900/30"
            }`}
          >
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                Sandbox Engineering Lab
              </span>
              <span className="rounded bg-indigo-950/90 border border-indigo-800/60 px-2 py-0.5 text-[10px] font-mono text-indigo-300 font-semibold">
                Bloom Level: Applying
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">{challenge.title}</h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-800/50 px-3 py-1 rounded-xl shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            +{challenge.xpReward || 40} XP
          </span>

          {(isCompleted || hasPassedState) && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-700 px-3 py-1 rounded-xl shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Solved
            </span>
          )}
        </div>
      </div>

      {/* Challenge Stage Stepper Bar */}
      <div className="px-5 py-3 border-b border-slate-800/70 bg-slate-950/60 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400 font-bold">Lab Steps:</span>

          <button
            onClick={() => setActiveStep(1)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              activeStep === 1
                ? "bg-blue-600 text-white font-bold"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <span className="h-4 w-4 rounded-full bg-slate-950 text-[10px] flex items-center justify-center font-bold">1</span>
            <span>Brief</span>
          </button>

          <span className="text-slate-600">→</span>

          <button
            onClick={() => setActiveStep(2)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              activeStep === 2
                ? "bg-blue-600 text-white font-bold"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <span className="h-4 w-4 rounded-full bg-slate-950 text-[10px] flex items-center justify-center font-bold">2</span>
            <span>Refactor</span>
          </button>

          <span className="text-slate-600">→</span>

          <button
            onClick={() => setActiveStep(3)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              activeStep === 3
                ? "bg-blue-600 text-white font-bold"
                : "bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <span className="h-4 w-4 rounded-full bg-slate-950 text-[10px] flex items-center justify-center font-bold">3</span>
            <span>Live Test</span>
          </button>

          <span className="text-slate-600">→</span>

          <button
            onClick={() => setActiveStep(4)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              activeStep === 4 || hasPassedState
                ? "bg-emerald-600 text-white font-bold"
                : "bg-slate-900 border border-slate-800 text-slate-400"
            }`}
          >
            <span className="h-4 w-4 rounded-full bg-slate-950 text-[10px] flex items-center justify-center font-bold">4</span>
            <span>Verify</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-[11px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 border border-amber-900/50 bg-amber-950/30 px-2 py-0.5 rounded-md"
          >
            <HelpCircle className="h-3 w-3" />
            {showHint ? "Hide Hint" : "Need Hint?"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 space-y-5">
        {/* Task Objective / Directive */}
        <div className="rounded-xl border border-indigo-900/50 bg-gradient-to-r from-indigo-950/30 to-slate-950/60 p-4 space-y-2">
          <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2 font-mono">
            <Zap className="h-4 w-4 text-indigo-400" /> Challenge Goal & Directive:
          </div>
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
            {challenge.taskGoal || challenge.instructions}
          </p>

          {showHint && (
            <div className="mt-3 rounded-lg border border-amber-800/50 bg-amber-950/30 p-3 text-xs text-amber-200 animate-in fade-in">
              <span className="font-bold">💡 Architectural Hint:</span> {challenge.feedback.failure}
            </div>
          )}
        </div>

        {/* Live Criteria Validation Checklist */}
        {rules && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-blue-400" /> Automated Validation Criteria
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {allCriteriaMet ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> All Criteria Met
                  </span>
                ) : (
                  <span className="text-amber-400 font-semibold">Incomplete Criteria</span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {rules.requiredKeywords && rules.requiredKeywords.length > 0 && (
                <div
                  className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${
                    criteriaStatus.keywords
                      ? "border-emerald-800/60 bg-emerald-950/30 text-emerald-300"
                      : "border-slate-800 bg-slate-900/60 text-slate-400"
                  }`}
                >
                  {criteriaStatus.keywords ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  )}
                  <span className="truncate">Keywords: {rules.requiredKeywords.join(", ")}</span>
                </div>
              )}

              {rules.requiresDelimiters && (
                <div
                  className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${
                    criteriaStatus.delimiters
                      ? "border-emerald-800/60 bg-emerald-950/30 text-emerald-300"
                      : "border-slate-800 bg-slate-900/60 text-slate-400"
                  }`}
                >
                  {criteriaStatus.delimiters ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  )}
                  <span>Explicit Boundary Delimiters</span>
                </div>
              )}

              {rules.requiresCoT && (
                <div
                  className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${
                    criteriaStatus.cot
                      ? "border-emerald-800/60 bg-emerald-950/30 text-emerald-300"
                      : "border-slate-800 bg-slate-900/60 text-slate-400"
                  }`}
                >
                  {criteriaStatus.cot ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  )}
                  <span>Chain of Thought Reasoning Constraint</span>
                </div>
              )}

              {rules.requiresJsonFormat && (
                <div
                  className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${
                    criteriaStatus.json
                      ? "border-emerald-800/60 bg-emerald-950/30 text-emerald-300"
                      : "border-slate-800 bg-slate-900/60 text-slate-400"
                  }`}
                >
                  {criteriaStatus.json ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  )}
                  <span>Structured Schema / JSON Format</span>
                </div>
              )}

              {rules.minCharLength && (
                <div
                  className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${
                    criteriaStatus.minLength
                      ? "border-emerald-800/60 bg-emerald-950/30 text-emerald-300"
                      : "border-slate-800 bg-slate-900/60 text-slate-400"
                  }`}
                >
                  {criteriaStatus.minLength ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  )}
                  <span>Min Length ({userPrompt.length}/{rules.minCharLength} chars)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prompt Code Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-mono font-semibold text-slate-300 flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-blue-400" /> Refactor Prompt in Sandbox:
            </label>
            <div className="flex items-center gap-3">
              {challenge.brokenPrompt && (
                <button
                  onClick={() => setShowDiff(!showDiff)}
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  {showDiff ? "Hide Broken Prompt" : "Compare with Broken Prompt"}
                </button>
              )}
              <button
                onClick={handleReset}
                className="text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {showDiff && challenge.brokenPrompt && (
            <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-3 space-y-1 text-xs">
              <div className="text-[11px] font-mono text-rose-300 font-bold uppercase">
                Original Flawed / Broken Prompt:
              </div>
              <pre className="font-mono text-rose-200/90 whitespace-pre-wrap">
                {challenge.brokenPrompt}
              </pre>
            </div>
          )}

          <div className="relative rounded-xl border border-slate-700 bg-slate-950 overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <textarea
              id={`sandbox-textarea-${challenge.id}`}
              value={userPrompt}
              onChange={(e) => {
                setUserPrompt(e.target.value);
                if (validationErrors.length > 0) setValidationErrors([]);
              }}
              rows={7}
              className="w-full bg-transparent p-4 font-mono text-xs text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed resize-y"
              placeholder="Refactor the prompt with required delimiters, instructions, and constraints..."
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span>AI Execution Engine:</span>
            <span className="rounded bg-blue-950 border border-blue-800 px-1.5 py-0.5 text-blue-300 font-bold">
              {aiMode.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id={`run-validate-sandbox-${challenge.id}`}
              onClick={handleRunAndValidate}
              disabled={isExecuting || !userPrompt.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-900/30 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Evaluating & Executing Live...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Execute & Validate Prompt (+{challenge.xpReward || 40} XP)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation Errors Feedback */}
        {validationErrors.length > 0 && (
          <div className="rounded-xl border border-rose-900/60 bg-rose-950/20 p-4 space-y-2 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-rose-300">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span>Validation Criteria Not Satisfied ({validationErrors.length} issues)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              {validationErrors.map((err, i) => (
                <li key={i} className="text-rose-200/90">{err}</li>
              ))}
            </ul>
            <p className="pt-1 text-[11px] text-slate-400 italic">
              Hint: {challenge.feedback.failure}
            </p>
          </div>
        )}

        {/* Success Pass Box */}
        {hasPassedState && (
          <div className="rounded-xl border border-emerald-800/80 bg-emerald-950/30 p-4 space-y-2 text-xs animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Engineering Validation Passed! (+{challenge.xpReward || 40} XP)</span>
            </div>
            <p className="text-slate-200 leading-relaxed">{challenge.feedback.success}</p>
            <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
              <span className="text-emerald-400 font-semibold">Theoretical Rationale:</span> {challenge.feedback.theoreticalRationale}
            </div>
          </div>
        )}

        {/* Live Model Output Display */}
        {testOutput && (
          <div className="space-y-1.5 pt-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-blue-400" /> Model Output from Sandbox Execution:
              </span>
            </div>
            <pre className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 border border-slate-800 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap shadow-inner">
              {testOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
