import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft, Award, BookOpen, ShieldCheck, Check } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { analyzePrompt } from '../lib/promptAnalyzer';

export const AssessmentView: React.FC = () => {
  const { userProgress, setActiveTab, completeAssessment } = useApp();
  const previouslyPassed = (userProgress.completedAssessments || []).includes('prompt-foundations-final');
  const [submission, setSubmission] = useState(previouslyPassed ? (userProgress.missionEvidence?.['prompt-foundations-final'] || '') : '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'pass' | 'fail'>(previouslyPassed ? 'pass' : 'idle');
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
      
      const data: any = res.data;
      setResult(data);
      if (data.status === 'PASS') {
        setStatus('pass');
        completeAssessment('prompt-foundations-final', submission);
      } else {
        setStatus('fail');
      }
    } catch (e) {
      console.warn("Backend grading function offline or unavailable, running client rubric evaluator:", e);
      // Client-side deterministic rubric evaluation fallback
      const analysis = analyzePrompt(submission);
      const hasPersona = analysis.detectedFeatures.hasRole;
      const hasDelim = analysis.detectedFeatures.hasDelimiters;
      const hasFormat = analysis.detectedFeatures.hasFormattingConstraints;
      const hasLength = analysis.wordCount >= 20;

      const isPass = analysis.score >= 70 && hasPersona && (hasDelim || hasFormat);
      
      setResult({
        score: analysis.score,
        grade: analysis.grade,
        status: isPass ? 'PASS' : 'FAIL',
        feedback: analysis.strengths.length > 0 ? analysis.strengths.join(' ') : 'Prompt structure evaluated against foundational criteria.',
        suggestions: analysis.suggestions,
        criteria: {
          hasPersona,
          hasDelimiters: hasDelim,
          hasFormattingConstraints: hasFormat,
          hasSufficientDepth: hasLength
        }
      });

      if (isPass) {
        setStatus('pass');
        completeAssessment('prompt-foundations-final', submission);
      } else {
        setStatus('fail');
      }
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => setActiveTab('foundations')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Foundations Path</span>
        </button>
        <span className="text-[11px] font-mono text-blue-400 bg-blue-950/60 border border-blue-800/80 px-2.5 py-0.5 rounded-full">
          Capstone Final Evaluation
        </span>
      </div>

      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-blue-400">
          <ShieldCheck className="h-4 w-4" /> Comprehensive Evaluation
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Prompt Engineering Capstone Assessment</h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Demonstrate production-grade prompt engineering mastery by constructing an end-to-end engineered prompt adhering to persona adoption, XML delimitation, and strict output constraints.
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2 text-xs text-slate-300">
        <h2 className="font-bold text-white uppercase tracking-wider text-[11px] text-blue-300 flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-blue-400" /> Capstone Rubric & Passing Criteria (Min Score: 70/100)
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono mt-2">
          <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" /> Explicit Persona ("Act as a Senior...")</li>
          <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" /> Delimiters (e.g. &lt;context&gt; or ```)</li>
          <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" /> Strict Output Format (JSON / Table / Schema)</li>
          <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" /> Negative Constraints or Success Criteria</li>
        </ul>
      </div>

      {status === 'idle' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono flex items-center justify-between">
              <span>Engineered Prompt Submission</span>
              <span className="text-slate-500 font-normal">{submission.trim().split(/\s+/).filter(Boolean).length} words</span>
            </label>
            <textarea
              className="w-full h-56 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              placeholder="Act as a Senior Cloud Security Architect. Analyze the following configuration inside <config>...</config>. Return a JSON response with keys: 'risk_level', 'vulnerabilities', and 'remediation_steps'. Do not include markdown preamble."
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleSubmit}
              disabled={!submission.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all active:scale-95"
            >
              <span>Submit for Official Assessment</span> <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setSubmission("Act as a Senior System Architect. Analyze the requirements inside <system_specs>\nHigh-traffic distributed payment processor with 99.99% uptime\n</system_specs>.\nReturn the architectural blueprint strictly formatted as a JSON object with keys: 'components', 'database_choice', and 'failover_strategy'. Never include conversational preamble.")}
              className="text-xs text-slate-400 hover:text-blue-300 underline font-mono"
            >
              Insert exemplar prompt template
            </button>
          </div>
        </div>
      )}

      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center p-12 rounded-2xl border border-blue-900/40 bg-slate-900/90 space-y-3 text-center">
          <Loader2 className="animate-spin h-8 w-8 text-blue-400" />
          <h3 className="text-sm font-bold text-white">Evaluating Submission</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            Analyzing your prompt artifact against pedagogical benchmarks, delimiter validation, and output constraint schemas...
          </p>
        </div>
      )}

      {status === 'pass' && (
        <div className="bg-emerald-950/80 border border-emerald-800 p-6 rounded-2xl text-emerald-300 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/40">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">Capstone Assessment Passed!</h2>
              <p className="text-xs text-emerald-200">
                Evaluation Benchmark Score: <span className="font-bold text-white font-mono text-sm">{result?.score || 95}/100</span> (+150 XP Earned)
              </p>
            </div>
          </div>
          
          <div className="rounded-xl bg-slate-950/60 border border-emerald-800/60 p-3.5 text-xs text-slate-300 space-y-1.5">
            <p className="font-semibold text-emerald-300 font-mono">Rubric Feedback:</p>
            <p className="text-slate-300">{result?.feedback || "Your engineered prompt demonstrated high precision, structured role clarity, and constraint fidelity."}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              <Award className="h-4 w-4" />
              <span>View Verified Certificate on Dashboard &rarr;</span>
            </button>
            <button
              onClick={() => { setStatus('idle'); setSubmission(''); }}
              className="text-xs font-semibold text-emerald-300 hover:text-white border border-emerald-800 px-3.5 py-2 rounded-xl transition-colors"
            >
              Submit Another Prompt Artifact
            </button>
          </div>
        </div>
      )}

      {status === 'fail' && (
        <div className="bg-rose-950/80 border border-rose-800 p-6 rounded-2xl text-rose-300 space-y-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-rose-400 shrink-0" />
            <div>
              <h2 className="text-xl font-extrabold text-white">Assessment Needs Refinement</h2>
              <p className="text-xs text-rose-200">
                Score: <span className="font-bold text-white font-mono">{result?.score || 45}/100</span> (Target: ≥70/100)
              </p>
            </div>
          </div>

          {result?.suggestions && result.suggestions.length > 0 && (
            <div className="rounded-xl bg-slate-950/60 border border-rose-900/60 p-3 text-xs text-rose-200 space-y-1">
              <p className="font-semibold text-rose-300 font-mono">Suggestions for Improvement:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                {result.suggestions.map((sug: string, i: number) => (
                  <li key={i}>{sug}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setStatus('idle')}
              className="text-xs font-bold bg-rose-900 px-4 py-2 rounded-xl text-white hover:bg-rose-800 transition-colors"
            >
              Edit & Retry Submission
            </button>
            <button
              onClick={() => setActiveTab('foundations')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Review Foundation Modules
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
