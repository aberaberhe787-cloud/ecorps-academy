import React, { useState, useEffect } from 'react';
import { Braces, CheckCircle2, XCircle, Code2 } from 'lucide-react';

interface JsonValidatorProps {
  outputString: string;
}

export const JsonValidator: React.FC<JsonValidatorProps> = ({ outputString }) => {
  const [schemaStr, setSchemaStr] = useState("{\n  \"type\": \"object\",\n  \"properties\": {\n    \"name\": {\"type\": \"string\"}\n  },\n  \"required\": [\"name\"]\n}");
  const [validationResult, setValidationResult] = useState<{valid: boolean; error?: string; parsedData?: any} | null>(null);

  useEffect(() => {
    if (!outputString) {
      setValidationResult(null);
      return;
    }
    
    try {
      // Basic JSON Parse test
      let cleaned = outputString.trim();
      // Auto-strip markdown backticks if leaked
      if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
      if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
      if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
      cleaned = cleaned.trim();
      
      const parsed = JSON.parse(cleaned);
      
      // Attempt to validate against simple schema (naive validation for demo purposes)
      try {
        const schema = JSON.parse(schemaStr);
        if (schema.type === 'object' && typeof parsed !== 'object') {
          throw new Error('Root must be an object');
        }
        if (schema.required) {
          for (const req of schema.required) {
            if (!(req in parsed)) {
              throw new Error(`Missing required property: ${req}`);
            }
          }
        }
      } catch (e: any) {
        setValidationResult({ valid: false, error: `Schema Validation Error: ${e.message}`, parsedData: parsed });
        return;
      }
      
      setValidationResult({ valid: true, parsedData: parsed });
    } catch (e: any) {
      setValidationResult({ valid: false, error: `JSON Parse Error: ${e.message}` });
    }
  }, [outputString, schemaStr]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden mt-4">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Braces className="h-4 w-4 text-amber-400" />
          <span className="font-mono text-xs font-semibold text-slate-300">Strict Output Validator</span>
        </div>
        {validationResult && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            {validationResult.valid ? (
              <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Valid JSON</span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1"><XCircle className="h-3.5 w-3.5" /> Invalid Output</span>
            )}
          </div>
        )}
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <Code2 className="h-3 w-3" /> Target Schema Definition
          </label>
          <textarea
            rows={8}
            value={schemaStr}
            onChange={(e) => setSchemaStr(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 font-mono text-[11px] text-slate-300 focus:border-amber-500 focus:outline-none resize-y"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 mb-1 block">Validation Log</label>
          <div className="h-full min-h-[150px] bg-slate-950 border border-slate-800 rounded p-2.5 font-mono text-[11px] overflow-y-auto">
            {!outputString ? (
              <span className="text-slate-600 italic">Waiting for AI output...</span>
            ) : validationResult?.valid ? (
              <div className="text-emerald-400">
                <p>✓ Successfully parsed raw JSON.</p>
                <p>✓ Schema structure verified.</p>
                <p className="mt-2 text-slate-500">Parsed Data:</p>
                <pre className="text-slate-300 mt-1">{JSON.stringify(validationResult.parsedData, null, 2)}</pre>
              </div>
            ) : (
              <div className="text-rose-400 whitespace-pre-wrap">
                <p>✗ Validation Failed</p>
                <p className="mt-1">{validationResult?.error}</p>
                {validationResult?.parsedData && (
                  <>
                    <p className="mt-2 text-slate-500">Partial/Invalid Data:</p>
                    <pre className="text-slate-300 mt-1">{JSON.stringify(validationResult.parsedData, null, 2)}</pre>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
