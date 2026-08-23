import React, { useState } from 'react';
import { Columns2, LoaderCircle, Play, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PromptPlayground: React.FC<{ initialPrompt?: string }> = ({ initialPrompt = 'Explain photosynthesis.' }) => {
  const { executeCurrentPrompt } = useApp();
  const [promptA, setPromptA] = useState(initialPrompt);
  const [promptB, setPromptB] = useState(`${initialPrompt}\nAnswer for a 12-year-old in exactly 3 bullet points.`);
  const [outputA, setOutputA] = useState('');
  const [outputB, setOutputB] = useState('');
  const [running, setRunning] = useState(false);
  const [specificity, setSpecificity] = useState(70);
  const [maxWords, setMaxWords] = useState(80);

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

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div><h3 className="flex items-center gap-2 text-lg font-bold text-white"><Columns2 className="h-5 w-5 text-blue-400" /> Prompt comparison lab</h3><p className="mt-1 text-xs text-slate-400">Change one principle at a time, then compare the outputs.</p></div>
        <button type="button" onClick={() => { setPromptA(initialPrompt); setPromptB(`${initialPrompt}\nAnswer for a 12-year-old in exactly 3 bullet points.`); setOutputA(''); setOutputB(''); }} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Reset prompts"><RotateCcw className="h-4 w-4" /></button>
      </div>
      <div className="mt-4 grid gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:grid-cols-2">
        <label className="text-xs text-slate-400">Specificity <span className="font-semibold text-blue-300">{specificity}/100</span><input type="range" min="0" max="100" value={specificity} onChange={(event) => setSpecificity(Number(event.target.value))} className="mt-2 w-full accent-blue-500" /></label>
        <label className="text-xs text-slate-400">Output limit <span className="font-semibold text-blue-300">{maxWords} words</span><input type="range" min="20" max="300" step="10" value={maxWords} onChange={(event) => setMaxWords(Number(event.target.value))} className="mt-2 w-full accent-blue-500" /></label>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[{ label: 'A · Baseline', value: promptA, setValue: setPromptA, output: outputA }, { label: 'B · Refined', value: promptB, setValue: setPromptB, output: outputB }].map((panel) => (
          <div key={panel.label} className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-blue-300">{panel.label}</label>
            <textarea value={panel.value} onChange={(event) => panel.setValue(event.target.value)} rows={6} className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200 outline-none focus:border-blue-500" />
            <div className="min-h-32 rounded-lg border border-slate-800 bg-slate-950/70 p-3 text-sm leading-6 text-slate-300 whitespace-pre-wrap">{panel.output || 'Run the comparison to see the model response.'}</div>
          </div>
        ))}
      </div>
      <button type="button" onClick={compare} disabled={running} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60">{running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Compare prompts</button>
    </section>
  );
};
