import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const AssessmentView: React.FC = () => {
  const { userProgress } = useApp();
  const [submission, setSubmission] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'pass' | 'fail'>('idle');
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!submission.trim()) return;
    setStatus('loading');
    try {
      const functions = getFunctions();
      const submitAssessment = httpsCallable(functions, 'submitAssessment');
      
      const res = await submitAssessment({
        assessmentId: 'prompt-foundations-final',
        submissionId: crypto.randomUUID(),
        payload: submission
      });
      
      setResult(res.data);
      setStatus((res.data as any).status === 'PASS' ? 'pass' : 'fail');
    } catch (e) {
      console.error(e);
      setStatus('fail');
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-blue-400">
          <Sparkles className="h-4 w-4" /> Comprehensive Evaluation
        </div>
        <h1 className="text-2xl font-black text-white mt-1">Prompt Engineering Foundations Assessment</h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Demonstrate your prompt engineering mastery by submitting a complete, production-grade prompt artifact.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2 text-xs text-slate-300">
        <h2 className="font-bold text-white uppercase tracking-wider text-[11px] text-blue-300">Assessment Evaluation Criteria</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
          <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" /> Explicit Role Persona Defined</li>
          <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" /> XML Delimiters for Input Context</li>
          <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" /> Strict Output Format Constraints</li>
          <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" /> Negative Constraints (No Preamble)</li>
        </ul>
      </div>

      {status === 'idle' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 font-mono">
              Engineered Prompt Submission
            </label>
            <textarea
              className="w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none"
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              placeholder="Act as a Senior System Architect. Review the following code <input_code>...</input_code>..."
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!submission.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all"
          >
            <span>Submit for Official Assessment</span> <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-blue-900/40 bg-slate-900/90 space-y-3 text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Evaluating Submission</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Analyzing your prompt artifact against quality benchmarks, constraint adherence, and security rules...
          </p>
        </div>
      )}

      {status === 'pass' && (
        <div className="bg-emerald-950/80 border border-emerald-800 p-6 rounded-2xl text-emerald-300 space-y-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          <h2 className="text-xl font-extrabold text-white">Assessment Passed!</h2>
          <p className="text-xs text-emerald-200">
            Congratulations! Your engineered prompt met all production evaluation benchmarks. Score: <span className="font-bold text-white font-mono">{result?.score || 95}/100</span>
          </p>
          <button
            onClick={() => { setStatus('idle'); setSubmission(''); }}
            className="mt-2 text-xs font-semibold text-emerald-400 hover:underline"
          >
            Submit Another Assessment &rarr;
          </button>
        </div>
      )}

      {status === 'fail' && (
        <div className="bg-rose-950/80 border border-rose-800 p-6 rounded-2xl text-rose-300 space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-400" />
          <h2 className="text-xl font-extrabold text-white">Assessment Needs Refinement</h2>
          <p className="text-xs text-rose-200">
            Your submission did not meet the required threshold. Please verify that your prompt includes explicit role assignment, context delimiters, and strict output constraints, then try again.
          </p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-2 text-xs font-bold bg-rose-900 px-3.5 py-2 rounded-lg text-white hover:bg-rose-800 transition-colors"
          >
            Retry Submission
          </button>
        </div>
      )}
    </div>
  );
};
