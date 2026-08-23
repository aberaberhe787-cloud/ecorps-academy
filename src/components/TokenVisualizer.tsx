import React, { useMemo } from 'react';
import { Layers, Activity, DollarSign } from 'lucide-react';

interface TokenVisualizerProps {
  text: string;
}

// Simple heuristic tokenization for visualization
const heuristicTokenize = (text: string) => {
  if (!text) return [];
  // Split by whitespace and punctuation, keeping delimiters
  const regex = /([a-zA-Z0-9_]+|[^a-zA-Z0-9_\s]+|\s+)/g;
  const matches = text.match(regex) || [];
  return matches.map(chunk => ({
    text: chunk,
    isWhitespace: /^[\s]+$/.test(chunk),
    colorIndex: Math.floor(Math.random() * 5)
  }));
};

const COLORS = [
  'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'bg-rose-500/20 text-rose-300 border-rose-500/30'
];

export const TokenVisualizer: React.FC<TokenVisualizerProps> = ({ text }) => {
  const tokens = useMemo(() => heuristicTokenize(text), [text]);
  const tokenCount = useMemo(() => tokens.filter(t => !t.isWhitespace).length + Math.floor(text.length / 4), [tokens, text]);
  
  const estimatedCostGemini1_5 = ((tokenCount / 1000000) * 1.25).toFixed(6);
  const estimatedCostFlash = ((tokenCount / 1000000) * 0.075).toFixed(6);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden mt-4">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-purple-400" />
          <span className="font-mono text-xs font-semibold text-slate-300">Live Tokenization Visualizer</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-blue-400" />
            <span>~{tokenCount} Tokens</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Token Output */}
        <div className="rounded-lg bg-slate-950 border border-slate-800 p-3 max-h-40 overflow-y-auto font-mono text-xs leading-relaxed">
          {tokens.length === 0 && <span className="text-slate-600 italic">No input to tokenize...</span>}
          {tokens.map((token, i) => (
            token.isWhitespace ? (
              <span key={i}>{token.text}</span>
            ) : (
              <span 
                key={i} 
                className={`inline-block border px-0.5 mx-[1px] rounded-[2px] ${COLORS[token.colorIndex]}`}
                title={`Token: ${token.text}`}
              >
                {token.text}
              </span>
            )
          ))}
        </div>

        {/* Cost Estimates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-mono">Gemini 1.5 Pro (Input)</div>
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1 mt-0.5">
                <DollarSign className="h-3 w-3 text-emerald-400" /> {estimatedCostGemini1_5}
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-mono">Gemini 1.5 Flash (Input)</div>
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1 mt-0.5">
                <DollarSign className="h-3 w-3 text-emerald-400" /> {estimatedCostFlash}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
