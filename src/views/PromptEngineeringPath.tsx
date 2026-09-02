import React, { useEffect, useState } from 'react';
import { Award, ArrowRight, CheckCircle2, ChevronDown, Circle, Lightbulb, Sparkles } from 'lucide-react';
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
  const { userProgress, markLessonComplete, setActiveTab } = useApp();
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
          {completedCount >= FOUNDATION_LESSONS.length && (
            <div className="rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  <Award className="h-4 w-4" /> Capstone Pathway Unlocked
                </div>
                <h3 className="text-lg font-bold text-white">All 5 Foundation Modules Mastered!</h3>
                <p className="text-xs text-slate-300">
                  You are now ready to take the official Capstone Assessment evaluation to verify your prompt engineering credential.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("certification")}
                className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>Take Capstone Assessment</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
          <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-300">
                  Concept {FOUNDATION_LESSONS.findIndex((lesson) => lesson.id === activeLesson.id) + 1} of {FOUNDATION_LESSONS.length}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-white">{activeLesson.title}</h2>
                <p className="mt-2 text-slate-300">{activeLesson.summary}</p>
              </div>
              <Lightbulb className="h-7 w-7 shrink-0 text-amber-400" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-4">
                <p className="mb-2 text-xs font-bold uppercase text-rose-300 font-mono">Vague Pattern</p>
                <pre className="whitespace-pre-wrap text-sm text-slate-300 font-mono">{activeLesson.example}</pre>
              </div>
              <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4">
                <p className="mb-2 text-xs font-bold uppercase text-emerald-300 font-mono">Precise Engineered Pattern</p>
                <pre className="whitespace-pre-wrap text-sm text-slate-300 font-mono">{activeLesson.refined}</pre>
              </div>
            </div>

            {/* Guided Practice Lab */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Interactive Practice Check</h3>
                </div>
                {practiceScore !== null ? (
                  <span
                    className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full border ${
                      practiceScore >= 60
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {practiceScore >= 60
                      ? `✓ Rubric Score: ${practiceScore}/100 (Pass)`
                      : `⚠ Score: ${practiceScore}/100 (Min 60 Required)`}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-mono bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
                    Step 1: Execute prompt to evaluate score
                  </span>
                )}
              </div>

              <textarea
                value={practicePrompt}
                onChange={(event) => setPracticePrompt(event.target.value)}
                rows={3}
                placeholder="Write or refine your prompt..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-xs sm:text-sm font-mono text-slate-200 outline-none focus:border-blue-500 transition-colors"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={runPractice}
                  disabled={isPracticing}
                  className="rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-4 py-2 text-xs font-bold text-white shadow transition-all active:scale-95"
                >
                  {isPracticing ? 'Analyzing Prompt...' : 'Run and Score Prompt'}
                </button>
                {practiceScore !== null && practiceScore < 60 && (
                  <span className="text-xs text-amber-300/90 font-mono">
                    💡 Tip: Add specific context, explicit role, or defined output constraints.
                  </span>
                )}
              </div>

              {practiceOutput && (
                <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3.5 space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 font-mono uppercase">Model Execution Output</p>
                  <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-300">{practiceOutput}</p>
                </div>
              )}
            </div>

            {/* Concept Check Quiz */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-white">Concept Verification</p>
                {conceptCheckPassed ? (
                  <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-full">
                    ✓ Correct
                  </span>
                ) : (
                  <span className="text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2.5 py-1 rounded-full">
                    Step 2: Select the correct concept
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Which change makes a prompt easiest for a large language model to reliably follow?
              </p>
              <select
                value={quizAnswer}
                onChange={(event) => setQuizAnswer(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
              >
                <option value="">Choose an answer...</option>
                <option value="specificity">Add a specific task, explicit audience, and success criteria</option>
                <option value="length">Make the prompt longer without structured goals</option>
              </select>
            </div>

            {/* Completion & Diagnostic Action Panel */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-800 pt-5">
              <button
                type="button"
                onClick={() => markLessonComplete(activeLesson.id)}
                disabled={userProgress.completedLessons.includes(activeLesson.id) || !canComplete}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95 ${
                  userProgress.completedLessons.includes(activeLesson.id)
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-800/60 cursor-default'
                    : canComplete
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                }`}
              >
                {userProgress.completedLessons.includes(activeLesson.id) ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Lesson Completed</span>
                  </>
                ) : canComplete ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-white" />
                    <span>Complete Lesson (+50 XP)</span>
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4" />
                    <span>Complete All Requirements</span>
                  </>
                )}
              </button>

              {/* Requirement Diagnostic Badges */}
              {!userProgress.completedLessons.includes(activeLesson.id) && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border ${
                      practiceScore !== null && practiceScore >= 60
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {practiceScore !== null && practiceScore >= 60 ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    <span>Score ≥ 60 {practiceScore !== null ? `(${practiceScore})` : ''}</span>
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border ${
                      conceptCheckPassed
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}
                  >
                    {conceptCheckPassed ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    <span>Concept Quiz</span>
                  </span>
                </div>
              )}
            </div>
          </article>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h3 className="text-sm font-bold text-white">Reusable prompt templates</h3><div className="mt-3 flex flex-wrap gap-2">{promptPatterns.slice(0, 3).map((pattern) => <button key={pattern.id} type="button" onClick={() => setPracticePrompt(pattern.template)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-blue-500 hover:text-blue-300">Use {pattern.title}</button>)}</div><p className="mt-3 text-xs text-slate-400">Choose a template, adapt it to the scenario, run it, and review the rubric feedback.</p>{practiceScore !== null && <p className="mt-3 rounded-lg border border-blue-900/60 bg-blue-950/30 p-3 text-xs text-blue-200">Rubric feedback: {practiceFeedback}</p>}</div>
          <PromptPlayground initialPrompt={activeLesson.example} />
        </main>
      </div>
    </div>
  );
};
