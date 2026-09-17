import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  CheckCircle2,
  Code2,
  Copy,
  Check,
  Sparkles
} from "lucide-react";
import { ConceptBlock } from "../../types";

interface ConceptCardProps {
  concept: ConceptBlock;
  index: number;
  totalConcepts: number;
  isRead: boolean;
  onMarkRead: () => void;
}

export const ConceptCard: React.FC<ConceptCardProps> = ({
  concept,
  index,
  totalConcepts,
  isRead,
  onMarkRead,
}) => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const bloom = concept.bloomLevel || "Understanding";

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <article
      id={`concept-section-${concept.id}`}
      className="py-6 sm:py-8 border-b border-slate-800/80 last:border-b-0 space-y-5"
    >
      {/* Header & Subtext */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-blue-400 font-bold">Concept {index + 1} of {totalConcepts}</span>
            <span>•</span>
            <span className="text-slate-300">{bloom}</span>
            <span>•</span>
            <span>{concept.readMinutes || 5} min read</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {concept.title}
          </h2>
        </div>

        {concept.academicCitation && (
          <span className="text-xs font-mono text-slate-400 border border-slate-800 bg-slate-900/60 px-2 py-1 rounded">
            Ref: {concept.academicCitation}
          </span>
        )}
      </div>

      {/* Main Reading Flow */}
      <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed font-sans prose-p:text-slate-300 prose-p:leading-relaxed prose-headings:text-slate-100 prose-strong:text-white prose-code:text-blue-300 prose-code:bg-slate-950 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-mono">
        <ReactMarkdown>{concept.content}</ReactMarkdown>
      </div>

      {/* Code Anatomy / Concrete Snippet */}
      {concept.codeSnippet && (
        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-sm">
          <div className="px-3.5 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-300 font-semibold flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-blue-400" />
              {concept.codeSnippet.caption || `${concept.codeSnippet.language.toUpperCase()} Anatomy`}
            </span>
            <button
              id={`copy-snippet-${concept.id}`}
              onClick={() => handleCopyCode(concept.codeSnippet!.code)}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
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

      {/* Key Takeaway / Axiom */}
      {concept.keyTakeaway && (
        <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4">
          <div className="flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-300 block">
                Key Takeaway
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {concept.keyTakeaway}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Review Confirmation */}
      <div className="pt-2 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {isRead ? "Section reviewed." : "Read through before testing your recall."}
        </span>
        <button
          id={`mark-read-btn-${concept.id}`}
          onClick={onMarkRead}
          className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
            isRead
              ? "bg-slate-800 border border-slate-700 text-slate-300"
              : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm active:scale-95"
          }`}
        >
          <CheckCircle2 className={`h-3.5 w-3.5 ${isRead ? "text-emerald-400" : "text-white"}`} />
          <span>{isRead ? "Reviewed ✓" : "I've reviewed this"}</span>
        </button>
      </div>
    </article>
  );
};
