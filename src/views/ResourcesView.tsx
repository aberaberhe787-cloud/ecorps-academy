import React, { useState } from "react";
import { FileText, Trash2, Play, BookOpen, Search, ExternalLink, Copy, Check, Calendar, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import { glossaryTerms, promptOfTheDayList, externalLearningResources } from "../data/resourcesData";
import { GlossaryTerm } from "../types";

export const ResourcesView: React.FC = () => {
  const { userProgress, deleteCustomPrompt, loadIntoPlayground, setActiveTab, t } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGlossaryCategory, setSelectedGlossaryCategory] = useState("All");
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const todayPrompt = promptOfTheDayList[0];

  const glossaryCategories = ["All", "Technique", "Reasoning", "Architecture", "Hyperparameter", "Safety & Reliability", "Agents"];

  const filteredGlossary = glossaryTerms.filter((item) => {
    const matchesCat = selectedGlossaryCategory === "All" || item.category === selectedGlossaryCategory;
    const matchesSearch =
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  return (
    <div className="app-view mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-400" />
          <h1 className="text-xl font-bold tracking-tight text-white">{t.resources.title}</h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {t.resources.subtitle}
        </p>
      </div>

      {/* Prompt of the Day Spotlight */}
      <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" /> Prompt of the Day
            </span>
            <span className="text-xs text-slate-400 font-mono">{todayPrompt.date}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyText(todayPrompt.prompt, "potd")}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            >
              {copiedPromptId === "potd" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedPromptId === "potd" ? "Copied!" : "Copy"}</span>
            </button>
            <button
              onClick={() =>
                loadIntoPlayground({
                  prompt: todayPrompt.prompt,
                  systemInstruction: "You are a senior system architect."
                })
              }
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Test in Sandbox</span>
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <h2 className="text-lg font-bold text-white mb-2">{todayPrompt.title}</h2>
            <pre className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {todayPrompt.prompt}
            </pre>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl bg-slate-950/60 border border-slate-800/80 p-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" /> Architectural Breakdown
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">{todayPrompt.whyItWorks}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {todayPrompt.tags.map((t, i) => (
                  <span key={i} className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
              New daily pattern curated each week from state-of-the-art research papers.
            </div>
          </div>
        </div>
      </div>

      {/* Saved Custom Prompts Section */}
      {userProgress.savedCustomPrompts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-400" /> My Saved Prompts ({userProgress.savedCustomPrompts.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {userProgress.savedCustomPrompts.map((saved) => (
              <div key={saved.id} className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white truncate">{saved.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(saved.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-mono text-slate-400 line-clamp-3 bg-slate-950 p-2 rounded-lg">
                    {saved.prompt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => deleteCustomPrompt(saved.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 text-xs"
                    title="Delete prompt"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      loadIntoPlayground({
                        prompt: saved.prompt
                      })
                    }
                    className="flex items-center gap-1 rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                  >
                    <Play className="h-3 w-3 fill-white" />
                    <span>Open in Editor</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Glossary Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-400" /> Prompt Engineering Glossary & Concepts
            </h2>
            <p className="text-xs text-slate-400">Search terminology and concepts.</p>
          </div>

          {/* Glossary Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter glossary terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border border-slate-800 bg-slate-900 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900 p-1">
              {glossaryCategories.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedGlossaryCategory(c)}
                  className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    selectedGlossaryCategory === c
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Glossary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGlossary.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">{item.term}</h3>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-blue-300">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{item.definition}</p>

              {item.example && (
                <div className="rounded-lg bg-slate-950 p-2.5 font-mono text-[11px] text-slate-400 whitespace-pre-wrap border border-slate-800">
                  <span className="text-slate-500 block mb-0.5">Example:</span>
                  {item.example}
                </div>
              )}

              {item.proTip && (
                <div className="text-[11px] text-emerald-300/90 bg-emerald-950/30 border border-emerald-900/40 p-2 rounded-lg flex items-start gap-1.5">
                  <span className="font-bold text-emerald-400">Pro-Tip:</span>
                  <span>{item.proTip}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* External Curated Guides */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-blue-400" /> Authoritative Reference Guides
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {externalLearningResources.map((res, i) => (
            <a
              key={i}
              href={res.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-slate-800 bg-slate-900/70 p-4 transition-all hover:border-blue-500/60 hover:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-blue-400 font-semibold uppercase">{res.type}</span>
                <h3 className="mt-1 text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                  {res.title}
                </h3>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-blue-400 group-hover:underline">
                <span>Visit Guide</span>
                <ExternalLink className="h-3 w-3" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
