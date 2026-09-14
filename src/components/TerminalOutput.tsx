import React, { useState } from "react";
import {
  Copy,
  Check,
  Zap,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Code2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ExecutionResult } from "../types";

interface TerminalOutputProps {
  result: ExecutionResult | null;
  isExecuting: boolean;
  title?: string;
  badge?: string;
  onRetry?: () => void;
}

const CodeBlockWithCopy: React.FC<{ language?: string; codeString: string; children: React.ReactNode }> = ({
  language,
  codeString,
  children,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl border border-slate-800 bg-slate-950 overflow-hidden group shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1.5 font-semibold text-slate-300 uppercase tracking-wider">
          <Code2 className="h-3.5 w-3.5 text-blue-400" />
          <span>{language || "code"}</span>
        </span>
        <button
          type="button"
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white transition-all border border-slate-700/80 shadow-sm"
          title="Copy code block to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-slate-400" />
              <span>Copy to Clipboard</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed bg-slate-950">
        {children}
      </pre>
    </div>
  );
};

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
  result,
  isExecuting,
  title = "AI Execution Output",
  badge,
  onRetry
}) => {
  const [copied, setCopied] = useState(false);
  const [viewRaw, setViewRaw] = useState(false);

  const handleCopy = () => {
    if (!result?.output) return;
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-auto min-h-[400px] flex-col rounded-xl border border-slate-800 bg-slate-900/90 shadow-xl backdrop-blur-md overflow-hidden">
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
            <span className="rounded bg-blue-900/60 px-2 py-0.5 font-mono text-xs sm:text-xs text-blue-300 border border-blue-700/50">
              {badge}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!isExecuting && result && result.status === "success" && (
            <>
              <button
                id="toggle-raw-btn"
                onClick={() => setViewRaw(!viewRaw)}
                className="rounded px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                {viewRaw ? "Formatted View" : "Raw Text"}
              </button>
              <button
                id="copy-output-btn"
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white border border-slate-700 transition-all shadow-sm active:scale-95"
                title="Copy entire output to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Execution Status / Metrics Bar (Only shown when not executing and result exists) */}
      {!isExecuting && result && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800/80 bg-slate-950/40 px-4 py-2 text-xs text-slate-400 font-mono gap-y-2">
          <div className="flex flex-wrap items-center gap-3">
            {result.status === "error" ? (
              <span className="rounded bg-rose-950/80 px-2 py-0.5 font-mono text-xs sm:text-xs text-rose-300 border border-rose-700/50 font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-rose-400" />
                EXECUTION FAILED
              </span>
            ) : (
              <span className="rounded bg-emerald-950/80 px-2 py-0.5 font-mono text-xs sm:text-xs text-emerald-300 border border-emerald-700/50 font-semibold flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                GOOGLE GEMINI
              </span>
            )}

            <span className="text-slate-400">
              Provider: <span className="text-slate-200 font-medium">{result.provider || "Google Gemini"}</span>
            </span>

            {result.model && (
              <span className="flex items-center gap-1 text-slate-300">
                <Cpu className="h-3.5 w-3.5 text-blue-400" />
                {result.model}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              {result.durationMs}ms
            </span>
            {result.status === "success" && result.tokenCount > 0 && (
              <span className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-indigo-400" />
                ~{result.tokenCount} tokens
              </span>
            )}
          </div>

          {result.detectedTechniques && result.detectedTechniques.length > 0 && result.status === "success" && (
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
      <div className="flex-1 overflow-auto p-4 font-sans text-sm">
        {isExecuting ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="relative">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <Zap className="absolute inset-0 m-auto h-4 w-4 text-blue-400 animate-pulse" />
            </div>
            <div>
              <p className="font-mono text-sm font-semibold text-slate-200">Gemini is processing your prompt...</p>
              <p className="text-xs text-slate-400 mt-1">Calling Google Gemini model via secure backend gateway</p>
            </div>
          </div>
        ) : result?.status === "error" ? (
          <div className="rounded-xl border border-rose-800/60 bg-rose-950/30 p-6 text-rose-200 space-y-4 my-auto">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Gemini execution failed.</h4>
                <p className="text-xs text-rose-300">Your prompt was not evaluated.</p>
              </div>
            </div>

            {result.errorMessage && (
              <div className="rounded-lg bg-slate-950/80 p-3 text-xs font-mono text-rose-300 border border-rose-900/50 break-words">
                {result.errorMessage}
              </div>
            )}

            {onRetry && (
              <div className="pt-2">
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow transition-all active:scale-95"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Retry Execution</span>
                </button>
              </div>
            )}
          </div>
        ) : result?.status === "success" ? (
          viewRaw ? (
            <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-xs font-mono text-slate-400">Raw Terminal Stream</span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  title="Copy raw text to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-slate-400" />
                      <span>Copy to Clipboard</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="font-mono text-xs text-slate-300 whitespace-pre overflow-x-auto select-text leading-relaxed">
                {result.output}
              </pre>
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed">
              <div className="markdown-body">
                <ReactMarkdown
                  components={{
                    code({ inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      const codeString = String(children).replace(/\n$/, "");
                      if (!inline) {
                        return (
                          <CodeBlockWithCopy language={match ? match[1] : undefined} codeString={codeString}>
                            {children}
                          </CodeBlockWithCopy>
                        );
                      }
                      return (
                        <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-blue-300 border border-slate-700/60" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {result.output}
                </ReactMarkdown>
              </div>
            </div>
          )
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center text-slate-500">
            <Cpu className="h-8 w-8 text-slate-600" />
            <p className="text-sm font-medium text-slate-400">Terminal Awaiting Execution</p>
            <p className="text-xs max-w-xs text-slate-500">
              Click <span className="font-mono text-blue-400">"Run Prompt"</span> to execute your prompt with real Google Gemini and inspect the resulting output.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
