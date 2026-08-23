import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  BookOpen,
  CheckCircle2,
  Bookmark,
  GraduationCap,
  Sparkles,
  Code2,
  Layers,
  ArrowDownCircle,
  Copy,
  Check
} from "lucide-react";
import { ConceptBlock, BloomsTaxonomyLevel } from "../../types";

interface ConceptCardProps {
  concept: ConceptBlock;
  index: number;
  totalConcepts: number;
  isRead: boolean;
  onMarkRead: () => void;
}

const BLOOM_COLORS: Record<BloomsTaxonomyLevel, { bg: string; text: string; border: string }> = {
  Remembering: { bg: "bg-slate-800", text: "text-slate-300", border: "border-slate-700" },
  Understanding: { bg: "bg-blue-950/80", text: "text-blue-300", border: "border-blue-700/50" },
  Applying: { bg: "bg-emerald-950/80", text: "text-emerald-300", border: "border-emerald-700/50" },
  Analyzing: { bg: "bg-amber-950/80", text: "text-amber-300", border: "border-amber-700/50" },
  Evaluating: { bg: "bg-purple-950/80", text: "text-purple-300", border: "border-purple-700/50" },
  Creating: { bg: "bg-rose-950/80", text: "text-rose-300", border: "border-rose-700/50" },
};

export const ConceptCard: React.FC<ConceptCardProps> = ({
  concept,
  index,
  totalConcepts,
  isRead,
  onMarkRead,
}) => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const bloom = concept.bloomLevel || "Understanding";
  const bloomStyle = BLOOM_COLORS[bloom] || BLOOM_COLORS.Understanding;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      id={`concept-card-${concept.id}`}
      className={`rounded-2xl border transition-all duration-300 ${
        isRead
          ? "border-slate-800/80 bg-slate-900/80 shadow-md"
          : "border-blue-900/40 bg-slate-900/95 shadow-xl ring-1 ring-blue-500/20"
      }`}
    >
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-950 border border-blue-800/60 font-mono text-xs font-bold text-blue-300">
            {index + 1}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">{concept.title}</h3>
              <span
                className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold border ${bloomStyle.bg} ${bloomStyle.text} ${bloomStyle.border}`}
              >
                {bloom}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
              <span>Micro-Concept {index + 1} of {totalConcepts}</span>
              <span>•</span>
              <span className="font-mono">{concept.readMinutes || 5} min read</span>
            </div>
          </div>
        </div>

        {/* Academic citation if present */}
        {concept.academicCitation && (
          <div className="rounded-md bg-slate-950 px-2.5 py-1 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
            <GraduationCap className="h-3 w-3 text-blue-400" />
            <span>Ref: {concept.academicCitation}</span>
          </div>
        )}
      </div>

      {/* Main Theoretical Content (Markdown) */}
      <div className="p-5 sm:p-6 space-y-5">
        <div className="text-sm leading-relaxed text-slate-300 space-y-4 font-sans max-w-none">
          <div className="prose prose-invert prose-sm max-w-none prose-headings:text-slate-100 prose-headings:font-bold prose-p:text-slate-300 prose-p:leading-relaxed prose-strong:text-white prose-code:text-blue-300 prose-code:bg-slate-950 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-ul:my-2 prose-li:my-0.5">
            <ReactMarkdown>{concept.content}</ReactMarkdown>
          </div>
        </div>

        {/* Code Anatomy / Concrete Implementation Snippet */}
        {concept.codeSnippet && (
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
            <div className="px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-blue-400" />
                {concept.codeSnippet.caption || `${concept.codeSnippet.language.toUpperCase()} Anatomy`}
              </span>
              <button
                id={`copy-snippet-${concept.id}`}
                onClick={() => handleCopyCode(concept.codeSnippet!.code)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <pre className="p-4 font-mono text-xs text-blue-200/90 leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {concept.codeSnippet.code}
            </pre>
          </div>
        )}

        {/* Key Pedagogical Takeaway Box */}
        {concept.keyTakeaway && (
          <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/20 to-slate-950 p-4 shadow-sm">
            <div className="flex items-start gap-2.5">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 block mb-1">
                  Key Takeaway / Theoretical Axiom
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {concept.keyTakeaway}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer: Read Verification Interaction */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400">
            {isRead ? "Concept verified & active recall unlocked." : "Review the concept theory carefully before proceeding."}
          </span>
          <button
            id={`mark-read-btn-${concept.id}`}
            onClick={onMarkRead}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              isRead
                ? "bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/40"
                : "bg-blue-600 text-white shadow-md hover:bg-blue-500 active:scale-95"
            }`}
          >
            <CheckCircle2 className={`h-4 w-4 ${isRead ? "text-emerald-400" : "text-white"}`} />
            <span>{isRead ? "Understood ✓" : "Mark as Understood"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
