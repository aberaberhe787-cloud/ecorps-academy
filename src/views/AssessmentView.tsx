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
    setStatus('loading');
    try {
      const functions = getFunctions();
      const submitAssessment = httpsCallable(functions, 'submitAssessment');
      
      const res = await submitAssessment({
        assessmentId: 'prompt-foundations-final',
        assessmentVersion: '1.0.0',
        pathId: 'prompt-foundations',
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
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Prompt Engineering Foundations Assessment</h1>
      {status === 'idle' && (
        <div className="space-y-4">
          <textarea
            className="w-full h-40 bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-200"
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
            placeholder="Submit your engineered prompt..."
          />
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-white font-bold"
          >
            Submit for Assessment <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
      {status === 'loading' && <Loader2 className="animate-spin h-8 w-8 text-blue-500" />}
      {status === 'pass' && (
        <div className="bg-emerald-950 p-6 rounded-lg text-emerald-300">
          <CheckCircle2 className="h-8 w-8 mb-4" />
          <h2 className="text-xl font-bold">Assessment Passed!</h2>
          <p>Score: {result.score}</p>
        </div>
      )}
      {status === 'fail' && (
        <div className="bg-rose-950 p-6 rounded-lg text-rose-300">
          <AlertCircle className="h-8 w-8 mb-4" />
          <h2 className="text-xl font-bold">Assessment Failed</h2>
          <p>Please try again after 5 minutes.</p>
        </div>
      )}
    </div>
  );
};
