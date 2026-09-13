import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Play, Sparkles, Terminal, RefreshCw, Copy, Check } from 'lucide-react';

interface CodeLine {
  num: string;
  prefix?: string;
  content: string;
  colorClass: string;
  tag?: string;
  indent?: boolean;
}

const DIRECTIVE_LINES: CodeLine[] = [
  {
    num: '01',
    content: '<system_directive>',
    colorClass: 'text-purple-400 font-semibold',
  },
  {
    num: '02',
    prefix: 'role: ',
    content: '"Senior AI Systems Architect",',
    colorClass: 'text-blue-300',
    indent: true,
  },
  {
    num: '03',
    prefix: 'reasoning_protocol: ',
    content: '"Chain-of-Thought + ReAct",',
    colorClass: 'text-amber-300',
    indent: true,
  },
  {
    num: '04',
    prefix: 'constraints: ',
    content: '["Zero Hallucinations", "Strict JSON Schema"]',
    colorClass: 'text-emerald-300',
    indent: true,
  },
  {
    num: '05',
    content: '</system_directive>',
    colorClass: 'text-purple-400 font-semibold',
  },
];

export const AnimatedPromptRuntime: React.FC = () => {
  const [activeLine, setActiveLine] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [score, setScore] = useState<number>(98);
  const [validationState, setValidationState] = useState<'validating' | 'passed'>('passed');

  // Cycle lines simulation / stream effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isExecuting) {
      interval = setInterval(() => {
        setActiveLine((prev) => {
          if (prev >= DIRECTIVE_LINES.length) {
            setValidationState('passed');
            return 0;
          }
          if (prev === DIRECTIVE_LINES.length - 1) {
            setValidationState('passed');
          }
          return prev + 1;
        });
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isExecuting]);

  const handleCopy = () => {
    const raw = DIRECTIVE_LINES.map(
      (l) => `${l.indent ? '  ' : ''}${l.prefix || ''}${l.content}`
    ).join('\n');
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunReplay = () => {
    setActiveLine(0);
    setValidationState('validating');
    setIsExecuting(true);
    setTimeout(() => {
      setValidationState('passed');
    }, 4000);
  };

  return (
    <div
      id="prompt-runtime-animated-section"
      className="hidden sm:block rounded-2xl border border-slate-800/90 bg-slate-900/85 p-4 sm:p-5 backdrop-blur-xl shadow-2xl shadow-black/50 space-y-3.5 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300"
    >
      {/* Subtle Background Glow Animation */}
      <motion.div
        animate={{
          opacity: [0.08, 0.18, 0.08],
          scale: [0.98, 1.02, 0.98],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-transparent rounded-full blur-3xl pointer-events-none"
      />

      {/* Top Header Bar with Mac Buttons & Live Score Badge */}
      <div className="flex items-center justify-between border-b border-slate-800/90 pb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <motion.div
              whileHover={{ scale: 1.2 }}
              className="h-3 w-3 rounded-full bg-rose-500/80 shadow-sm shadow-rose-500/30 cursor-pointer"
            />
            <motion.div
              whileHover={{ scale: 1.2 }}
              className="h-3 w-3 rounded-full bg-amber-500/80 shadow-sm shadow-amber-500/30 cursor-pointer"
            />
            <motion.div
              whileHover={{ scale: 1.2 }}
              className="h-3 w-3 rounded-full bg-emerald-500/80 shadow-sm shadow-emerald-500/30 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 ml-2">
            <Terminal className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
              prompt_engineering_runtime.ts
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"
                title="Live Active Runtime"
              />
            </span>
          </div>
        </div>

        {/* Right Side: Animated Score & Action Controls */}
        <div className="flex items-center gap-2">
          {/* Action replay / copy buttons */}
          <button
            type="button"
            onClick={handleRunReplay}
            title="Re-run Prompt Validation"
            className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800/80 transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${validationState === 'validating' ? 'animate-spin text-blue-400' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleCopy}
            title="Copy system directive"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          </button>

          {/* Animated Score Pill */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0px rgba(16, 185, 129, 0)',
                '0 0 10px rgba(16, 185, 129, 0.35)',
                '0 0 0px rgba(16, 185, 129, 0)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-mono text-emerald-400 font-semibold"
          >
            <motion.div
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            </motion.div>
            <span>Score: {score}/100</span>
          </motion.div>
        </div>
      </div>

      {/* Code Directive Display Area */}
      <div className="font-mono text-xs text-slate-300 space-y-1 relative overflow-x-auto select-none py-1">
        {/* Animated Scanning Beam / Laser Bar */}
        <motion.div
          animate={{
            top: ['0%', '100%', '0%'],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute left-0 right-0 h-4 bg-gradient-to-b from-transparent via-blue-500/15 to-transparent pointer-events-none rounded"
        />

        {DIRECTIVE_LINES.map((line, idx) => {
          const isCurrentFocus = activeLine === idx;

          return (
            <motion.div
              key={line.num}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.12, duration: 0.4 }}
              className={`flex items-center gap-3 px-2 py-0.5 rounded transition-all duration-300 relative ${
                isCurrentFocus
                  ? 'bg-blue-500/10 border-l-2 border-blue-400 shadow-sm shadow-blue-500/10'
                  : 'hover:bg-slate-800/40 border-l-2 border-transparent'
              }`}
            >
              {/* Line Number */}
              <span className="text-slate-500 select-none w-5 text-right font-mono text-[11px] shrink-0">
                {line.num}
              </span>

              {/* Line Code Content */}
              <div className={`flex items-center flex-wrap ${line.indent ? 'pl-3' : ''}`}>
                {line.prefix && (
                  <span className="text-slate-400">{line.prefix}</span>
                )}
                <span className={line.colorClass}>
                  {line.content}
                </span>

                {/* Animated typing cursor on the active line */}
                {isCurrentFocus && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-1.5 h-3.5 bg-blue-400 ml-1 rounded-sm shadow-sm shadow-blue-400/80"
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Bottom Execution Status Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/70 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-blue-400 font-medium">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Directives Compiled
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Latency: 14ms</span>
        </div>

        <span className="text-emerald-400/90 font-medium">
          Zero Hallucination Guard: Active
        </span>
      </div>
    </div>
  );
};
