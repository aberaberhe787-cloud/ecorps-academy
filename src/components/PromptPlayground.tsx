import React, { useState } from 'react';
import { Columns2, LoaderCircle, Play, RotateCcw, ArrowUpRight, Sparkles, SlidersHorizontal, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { analyzePrompt } from '../lib/promptAnalyzer';

export const PromptPlayground: React.FC<{ initialPrompt?: string }> = ({ initialPrompt = 'Explain photosynthesis.' }) => {
  const { executeCurrentPrompt, setPrompt, setActiveTab, setPlaygroundSubTab } = useApp();
  const [promptA, setPromptA] = useState(initialPrompt);
  const [promptB, setPromptB] = useState(`${initialPrompt}\nAnswer for a 12-year-old in exactly 3 bullet points.`);
  const [outputA, setOutputA] = useState('');
  const [outputB, setOutputB] = useState('');
  const [running, setRunning] = useState(false);
  const [specificity, setSpecificity] = useState(70);
  const [maxWords, setMaxWords] = useState(80);
  const [exported, setExported] = useState<string | null>(null);

  const analysisA = analyzePrompt(promptA);
  const analysisB = analyzePrompt(promptB);

  const compare = async () => {
    if (!promptA.trim() || !promptB.trim()) return;
    setRunning(true);
    const [resultA, resultB] = await Promise.all([
      executeCurrentPrompt(promptA),
      executeCurrentPrompt(`${promptB}\nUse a specificity level of ${specificity}/100 and stay under ${maxWords} words.`),
    ]);
    setOutputA(resultA.output);
    setOutputB(resultB.output);
    setRunning(false);
  };

  const handleExportToSandbox = (textToExport: string, label: string) => {
    setPrompt(textToExport);
    setExported(label);
    setTimeout(() => {
      setPlaygroundSubTab('sandbox');
      setActiveTab('playground');
    }, 400);
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-white">
            <Columns2 className="h-5 w-5 text-blue-400" />
            <span>Prompt Comparison & A/B Testing Lab</span>
          </h3>
          <p className="text-xs text-slate-400">
            A/B test prompt variants with different specificity and constraint parameters.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setPromptA(initialPrompt);
            setPromptB(`${initialPrompt}\nAnswer for a 12-year-old in exactly 3 bullet points.`);
            setOutputA('');
            setOutputB('');
          }}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-400 hover:border-slate-700 hover:text-white transition-colors"
          aria-label="Reset prompts"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:grid-cols-2">
        <label className="text-xs text-slate-400 flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-300">Refinement Specificity Index</span>
            <span className="font-mono font-bold text-blue-400">{specificity}/100</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={specificity}
            onChange={(event) => setSpecificity(Number(event.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </label>
        <label className="text-xs text-slate-400 flex flex-col gap-1.5">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-300">Output Ceiling Constraint</span>
            <span className="font-mono font-bold text-blue-400">{maxWords} words</span>
          </div>
          <input
            type="range"
            min="20"
            max="300"
            step="10"
            value={maxWords}
            onChange={(event) => setMaxWords(Number(event.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          {
            id: 'A',
            label: 'Variant A · Baseline',
            value: promptA,
            setValue: setPromptA,
            output: outputA,
            analysis: analysisA,
          },
          {
            id: 'B',
            label: 'Variant B · Refined',
            value: promptB,
            setValue: setPromptB,
            output: outputB,
            analysis: analysisB,
          },
        ].map((panel) => (
          <div key={panel.id} className="space-y-2.5 rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-blue-300 font-mono">
                {panel.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  Rubric: {panel.analysis.score}/100
                </span>
                <button
                  type="button"
                  onClick={() => handleExportToSandbox(panel.value, panel.id)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  title="Export this prompt to Sandbox"
                >
                  {exported === panel.id ? <Check className="h-3 w-3 text-emerald-400" /> : <ArrowUpRight className="h-3 w-3" />}
                  <span>{exported === panel.id ? 'Exported!' : 'Open in Sandbox'}</span>
                </button>
              </div>
            </div>

            <textarea
              value={panel.value}
              onChange={(event) => panel.setValue(event.target.value)}
              rows={5}
              className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs sm:text-sm font-mono text-slate-200 outline-none focus:border-blue-500 transition-colors"
            />

            <div className="min-h-28 rounded-xl border border-slate-800/80 bg-slate-950/80 p-3 text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-sans">
              {panel.output || (
                <span className="text-slate-500 italic">
                  Run comparison to execute this variant against the inference engine.
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={compare}
          disabled={running}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-60"
        >
          {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          <span>Compare Variant Outputs</span>
        </button>
        <span className="text-xs text-slate-400 font-mono">
          Simultaneous dual execution with calibrated parameters
        </span>
      </div>
    </section>
  );
};
