import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, Circle, Lightbulb, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PromptPlayground } from '../components/PromptPlayground';
import { analyzePrompt } from '../lib/promptAnalyzer';
import promptPatterns from '../data/promptPatterns.json';

export const FOUNDATION_LESSONS = [
  { id: 'foundation-clarity', title: 'Clarity & Specificity', summary: 'Replace vague goals with an explicit task, audience, and success criteria.', example: 'Summarize this report.', refined: 'Summarize the report for a CFO in 5 bullets, highlighting cost, risk, and next action.' },
  { id: 'foundation-role', title: 'Role Assignment', summary: 'Give the model a useful perspective, vocabulary, and level of expertise.', example: 'Explain this contract.', refined: 'Act as a contract lawyer. Explain the termination clause in plain language and flag negotiation risks.' },
  { id: 'foundation-constraints', title: 'Constraints & Formatting', summary: 'Define length, structure, required fields, and exclusions before generation.', example: 'List the project risks.', refined: 'Return a 3-column table with Risk, Impact, and Mitigation. Include exactly 5 risks.' },
  { id: 'foundation-iteration', title: 'Iterative Refinement', summary: 'Improve one dimension at a time: task, context, output shape, then edge cases.', example: 'Write a product update.', refined: 'Write a 100-word customer update with a headline, impact, timeline, and next step.' },
  { id: 'foundation-context', title: 'Context Injection', summary: 'Place trusted background material in delimiters and tell the model how to use it.', example: 'Answer using this document.', refined: 'Use only the facts inside <context> tags. Cite the relevant section for each answer.' },
] as const;

export const PromptEngineeringPath: React.FC = () => {
  const { userProgress, markLessonComplete } = useApp();
  const [activeId, setActiveId] = useState<string>(FOUNDATION_LESSONS[0].id);
  const [practicePrompt, setPracticePrompt] = useState('Summarize this report.');
  const [practiceOutput, setPracticeOutput] = useState('');
  const [practiceScore, setPracticeScore] = useState<number | null>(null);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [isPracticing, setIsPracticing] = useState(false);
  const { executeCurrentPrompt } = useApp();
  const activeLesson = FOUNDATION_LESSONS.find((lesson) => lesson.id === activeId) || FOUNDATION_LESSONS[0];
  const completedCount = FOUNDATION_LESSONS.filter((lesson) => userProgress.completedLessons.includes(lesson.id)).length;
  const practiceFeedback = practiceScore === null ? 'Run your prompt to receive rubric feedback.' : practiceScore >= 80 ? 'Strong structure: the task and output expectations are clear.' : practiceScore >= 60 ? 'Good start. Add a specific audience, format, or success criterion.' : 'Refine the task with a role, context, and measurable output format.';
  const conceptCheckPassed = quizAnswer === 'specificity';
  const canComplete = practiceScore !== null && practiceScore >= 60 && conceptCheckPassed;

  useEffect(() => {
    setPracticePrompt(activeLesson.example);
    setPracticeOutput('');
    setPracticeScore(null);
    setQuizAnswer('');
  }, [activeLesson.id, activeLesson.example]);

  const runPractice = async () => {
    if (!practicePrompt.trim()) return;
    setIsPracticing(true);
    const result = await executeCurrentPrompt(practicePrompt);
    setPracticeOutput(result.output);
    setPracticeScore(analyzePrompt(practicePrompt).score);
    setIsPracticing(false);
  };

  return (
    <div className="app-view foundation-page mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="rounded-2xl border border-blue-900/60 bg-gradient-to-br from-blue-950/80 to-slate-950 p-6">
        <div className="flex items-center gap-2 text-blue-300"><Sparkles className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-widest">Learning Path</span></div>
        <h1 className="mt-3 text-3xl font-black text-white">Prompt Engineering Foundations</h1>
        <p className="mt-2 max-w-2xl text-slate-300">Learn why prompts work, then test each principle in a live comparison lab.</p>
        <div className="mt-5 flex items-center gap-3"><div className="h-2 max-w-sm flex-1 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-blue-500 transition-all" style={{ width: `${(completedCount / FOUNDATION_LESSONS.length) * 100}%` }} /></div><span className="text-sm text-blue-200">{completedCount}/{FOUNDATION_LESSONS.length} complete</span></div>
      </header>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <nav className="space-y-2" aria-label="Foundations lessons">
          {FOUNDATION_LESSONS.map((lesson, index) => { const completed = userProgress.completedLessons.includes(lesson.id); return <button key={lesson.id} type="button" onClick={() => setActiveId(lesson.id)} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${activeId === lesson.id ? 'border-blue-500 bg-blue-950/50' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'}`}><span className="text-xs text-slate-500">0{index + 1}</span>{completed ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Circle className="h-4 w-4 text-slate-500" />}<span className="text-sm font-semibold text-slate-200">{lesson.title}</span></button>; })}
        </nav>
        <main className="space-y-6">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-blue-300">Concept {FOUNDATION_LESSONS.findIndex((lesson) => lesson.id === activeLesson.id) + 1}</p><h2 className="mt-1 text-2xl font-bold text-white">{activeLesson.title}</h2><p className="mt-3 text-slate-300">{activeLesson.summary}</p></div><Lightbulb className="h-7 w-7 shrink-0 text-amber-400" /></div><div className="mt-6 grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4"><p className="mb-2 text-xs font-bold uppercase text-rose-300">Vague</p><pre className="whitespace-pre-wrap text-sm text-slate-300">{activeLesson.example}</pre></div><div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4"><p className="mb-2 text-xs font-bold uppercase text-emerald-300">Precise</p><pre className="whitespace-pre-wrap text-sm text-slate-300">{activeLesson.refined}</pre></div></div><div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/60 p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-white">Guided practice check</h3>{practiceScore !== null && <span className="text-sm font-bold text-emerald-300">{practiceScore}/100</span>}</div><textarea value={practicePrompt} onChange={(event) => setPracticePrompt(event.target.value)} rows={3} className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-200 outline-none focus:border-blue-500" /><button type="button" onClick={runPractice} disabled={isPracticing} className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60">{isPracticing ? 'Running...' : 'Run and score prompt'}</button>{practiceOutput && <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-slate-400">{practiceOutput}</p>}</div><div className="mt-4 rounded-xl border border-slate-800 p-4"><p className="text-sm font-bold text-white">Concept check</p><p className="mt-1 text-xs text-slate-400">Which change makes a prompt easier for a model to follow?</p><select value={quizAnswer} onChange={(event) => setQuizAnswer(event.target.value)} className="mt-3 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"><option value="">Choose an answer</option><option value="specificity">Add a specific task, audience, and success criteria</option><option value="length">Make the prompt longer without a clear goal</option></select></div><button type="button" onClick={() => markLessonComplete(activeLesson.id)} disabled={userProgress.completedLessons.includes(activeLesson.id) || !canComplete} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700">{userProgress.completedLessons.includes(activeLesson.id) ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />} {userProgress.completedLessons.includes(activeLesson.id) ? 'Lesson completed' : canComplete ? 'Complete lesson' : 'Practice and pass the check to complete'}</button></article>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h3 className="text-sm font-bold text-white">Reusable prompt templates</h3><div className="mt-3 flex flex-wrap gap-2">{promptPatterns.slice(0, 3).map((pattern) => <button key={pattern.id} type="button" onClick={() => setPracticePrompt(pattern.template)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-blue-500 hover:text-blue-300">Use {pattern.title}</button>)}</div><p className="mt-3 text-xs text-slate-400">Choose a template, adapt it to the scenario, run it, and review the rubric feedback.</p>{practiceScore !== null && <p className="mt-3 rounded-lg border border-blue-900/60 bg-blue-950/30 p-3 text-xs text-blue-200">Rubric feedback: {practiceFeedback}</p>}</div>
          <PromptPlayground initialPrompt={activeLesson.example} />
        </main>
      </div>
    </div>
  );
};
