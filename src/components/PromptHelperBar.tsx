import React from "react";
import { UserCheck, Tag, GitCommit, FileJson, ShieldAlert, Sparkles, Plus } from "lucide-react";
import promptPatterns from "../data/promptPatterns.json";

interface PromptHelperBarProps {
  onInsertText: (snippet: string) => void;
}

export const PromptHelperBar: React.FC<PromptHelperBarProps> = ({ onInsertText }) => {
  const snippets = [
    {
      label: "Role / Persona",
      icon: UserCheck,
      color: "hover:border-blue-500 hover:text-blue-300",
      snippet: `Act as a Principal Staff Engineer specializing in distributed cloud systems.\n\n`
    },
    {
      label: "XML Delimiters",
      icon: Tag,
      color: "hover:border-cyan-500 hover:text-cyan-300",
      snippet: `\n<context>\n[Paste your background data or document here]\n</context>\n`
    },
    {
      label: "Chain-of-Thought",
      icon: GitCommit,
      color: "hover:border-purple-500 hover:text-purple-300",
      snippet: `\nExecute the following deduction steps before answering:\n1. [ANALYSIS]: Break down the core constraints and variables.\n2. [REASONING]: Work through each step systematically.\n3. [VERIFICATION]: Sanity check calculations against premises.\n4. [FINAL_ANSWER]: Present clear conclusive solution.\n`
    },
    {
      label: "Strict JSON Schema",
      icon: FileJson,
      color: "hover:border-emerald-500 hover:text-emerald-300",
      snippet: `\nReturn RAW JSON ONLY matching this schema without markdown code blocks:\n{\n  "status": "success" | "error",\n  "summary": "string",\n  "keyFindings": ["string"],\n  "urgencyScore": 1-5\n}\n`
    },
    {
      label: "Negative Guardrails",
      icon: ShieldAlert,
      color: "hover:border-rose-500 hover:text-rose-300",
      snippet: `\nStrict Negative Constraints:\n- Do NOT use filler intros like "Certainly!", "Sure thing", or "As an AI".\n- Do NOT exceed 200 words.\n- Never invent unverified citations.\n`
    },
    {
      label: "Few-Shot Exemplars",
      icon: Sparkles,
      color: "hover:border-amber-500 hover:text-amber-300",
      snippet: `\n---\nExample 1:\nInput: "High latency on login endpoint"\nOutput: Category: AUTH | Priority: P0 | Team: SecOps\n---\nExample 2:\nInput: "Need invoice copy for Q2"\nOutput: Category: BILLING | Priority: P2 | Team: Finance\n---\nTarget Input:\nInput: "[Your target inquiry here]"\nOutput:\n`
    }
  ];

  const patternSnippets = promptPatterns.map((pattern) => ({
    label: pattern.title,
    icon: Sparkles,
    color: "hover:border-amber-500 hover:text-amber-300",
    snippet: `\n${pattern.template}\n`,
  }));

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
      <span className="text-slate-400 font-medium text-[11px] whitespace-nowrap mr-1 flex items-center gap-1">
        <Plus className="h-3 w-3 text-blue-400" /> Quick Inject:
      </span>
      {[...snippets, ...patternSnippets].map((snip, idx) => {
        const Icon = snip.icon;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onInsertText(snip.snippet)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-slate-300 transition-all active:scale-95 ${snip.color}`}
            title={`Insert ${snip.label}`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{snip.label}</span>
          </button>
        );
      })}
    </div>
  );
};
