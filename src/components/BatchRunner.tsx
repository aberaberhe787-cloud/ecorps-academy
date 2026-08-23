import React, { useState, useEffect } from 'react';
import { Play, Copy, ListTree, RefreshCcw, FastForward } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateMockAiResponse } from '../lib/mockAiEngine';

interface BatchRunnerProps {
  promptTemplate: string;
  systemInstruction: string;
}

export const BatchRunner: React.FC<BatchRunnerProps> = ({ promptTemplate, systemInstruction }) => {
  const [variables, setVariables] = useState<string[]>([]);
  const [testCases, setTestCases] = useState<Record<string, string>[]>([{}]);
  const [results, setResults] = useState<Record<number, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    const matches = Array.from(promptTemplate.matchAll(/\{\{([^}]+)\}\}/g));
    const uniqueVars = Array.from(new Set(matches.map(m => m[1].trim())));
    setVariables(uniqueVars);
    
    // Ensure all test cases have all variables initialized
    if (uniqueVars.length > 0 && Object.keys(testCases[0]).length === 0) {
      setTestCases([
        uniqueVars.reduce((acc, v) => ({ ...acc, [v]: '' }), {})
      ]);
    }
  }, [promptTemplate]);

  if (variables.length === 0) return null;

  const handleUpdateTestCase = (index: number, variable: string, value: string) => {
    const newCases = [...testCases];
    newCases[index] = { ...newCases[index], [variable]: value };
    setTestCases(newCases);
  };

  const handleAddTestCase = () => {
    const newCase = variables.reduce((acc, v) => ({ ...acc, [v]: '' }), {});
    setTestCases([...testCases, newCase]);
  };

  const runBatch = async () => {
    setIsExecuting(true);
    const newResults: Record<number, string> = {};
    
    for (let i = 0; i < testCases.length; i++) {
      let hydratedPrompt = promptTemplate;
      Object.entries(testCases[i]).forEach(([k, v]) => {
        hydratedPrompt = hydratedPrompt.replaceAll(`{{${k}}}`, v as string);
      });

      // Simulate API call for each
      const res = generateMockAiResponse(hydratedPrompt, systemInstruction, 0.7);
      await new Promise(resolve => setTimeout(resolve, res.latencyMs || 300));
      newResults[i] = res.text;
    }
    
    setResults(newResults);
    setIsExecuting(false);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden mt-4">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <ListTree className="h-4 w-4 text-emerald-400" />
          <span className="font-mono text-xs font-semibold text-slate-300">Dynamic Batch Runner</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-mono">
            {variables.length} variables detected
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="px-3 py-2 rounded-tl-lg font-semibold border-b border-slate-800">#</th>
                {variables.map(v => (
                  <th key={v} className="px-3 py-2 font-semibold border-b border-slate-800">
                    <span className="text-blue-400">{"{{"}</span>{v}<span className="text-blue-400">{"}}"}</span>
                  </th>
                ))}
                <th className="px-3 py-2 rounded-tr-lg font-semibold border-b border-slate-800 w-1/3">Output</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((tc, idx) => (
                <tr key={idx} className="border-b border-slate-800/50">
                  <td className="px-3 py-2 align-top pt-3">{idx + 1}</td>
                  {variables.map(v => (
                    <td key={v} className="px-3 py-2 align-top">
                      <textarea
                        rows={2}
                        value={tc[v] || ''}
                        onChange={(e) => handleUpdateTestCase(idx, v, e.target.value)}
                        placeholder={`Value for ${v}`}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 focus:border-emerald-500 focus:outline-none resize-y"
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 align-top">
                    {results[idx] ? (
                      <div className="bg-slate-950 border border-slate-800 p-2 rounded max-h-24 overflow-y-auto whitespace-pre-wrap">
                        {results[idx]}
                      </div>
                    ) : (
                      <span className="text-slate-600 italic">Pending execution...</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleAddTestCase}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            + Add Test Case
          </button>
          
          <button
            onClick={runBatch}
            disabled={isExecuting}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50 transition-colors"
          >
            {isExecuting ? (
              <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FastForward className="h-3.5 w-3.5" />
            )}
            <span>Run All Cases</span>
          </button>
        </div>
      </div>
    </div>
  );
};
