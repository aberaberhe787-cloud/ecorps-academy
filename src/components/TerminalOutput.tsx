import React, { useState } from "react";
import {
  Copy,
  Check,
  Zap,
  Clock,
  Cpu,
  Layers,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ExecutionResult } from "../types";

interface TerminalOutputProps {
  result: ExecutionResult | null;
  isExecuting: boolean;
  title?: string;
  badge?: string;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  result,
  isExecuting,
  title = "AI Execution Output",
  badge
}) => {
  const [copied, setCopied] = useState(false);
  const [viewRaw, setViewRaw] = useState(false);

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur-md overflow-hidden">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/70 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="font-mono text-xs font-semibold text-slate-300">{title}</span>
          {badge && (
            <span className="rounded bg-blue-900/60 px-2 py-0.5 font-mono text-[10px] text-blue-300 border border-blue-700/50">
              {badge}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {result && (
            <>
              <button
                id="toggle-raw-btn"
                onClick={() => setViewRaw(!viewRaw)}
                className="rounded px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              >
                {viewRaw ? "Formatted" : "Raw Text"}
              </button>
              <button
                id="copy-output-btn"
                onClick={handleCopy}
                className="flex items-center gap-1 rounded bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Execution Status / Metrics Bar */}
      {result && (
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 bg-slate-950/40 px-4 py-1.5 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-300">
              <Cpu className="h-3.5 w-3.5 text-blue-400" />
              {result.model}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              {result.durationMs}ms
            </span>
            <span className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              ~{result.tokenCount} tokens
            </span>
          </div>

          {result.detectedTechniques && result.detectedTechniques.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-blue-400" />
              <span className="text-slate-400">Techniques:</span>
              <span className="text-blue-300 font-medium">
                {result.detectedTechniques.slice(0, 2).join(", ")}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Terminal Body */}
      <div className="flex-1 overflow-y-auto p-4 font-sans text-sm">
        {isExecuting ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="relative">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <Zap className="absolute inset-0 m-auto h-4 w-4 text-blue-400 animate-pulse" />
            </div>
            <div>
              <p className="font-mono text-sm font-semibold text-slate-200">Executing Prompt...</p>
              <p className="text-xs text-slate-400 mt-1">Applying heuristics, reasoning patterns, and schema validation</p>
            </div>
          </div>
        ) : result ? (
          viewRaw ? (
            <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap select-text leading-relaxed">
              {result.output}
            </pre>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed">
              <div className="markdown-body">
                <ReactMarkdown>{result.output}</ReactMarkdown>
              </div>
            </div>
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center text-slate-500">
            <Cpu className="h-8 w-8 text-slate-600" />
            <p className="text-sm font-medium text-slate-400">Terminal Awaiting Execution</p>
            <p className="text-xs max-w-xs text-slate-500">
              Click <span className="font-mono text-blue-400">"Run Prompt"</span> to simulate AI model generation and inspect the resulting output.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
