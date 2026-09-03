import React, { useState } from "react";
import {
  Grid3X3,
  Search,
  Bookmark,
  BookmarkCheck,
  Play,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Tag,
  ArrowRight,
  Code2,
  FileText,
  LineChart,
  Boxes
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { promptPatterns } from "../data/patternsData";
import { PromptPattern } from "../types";

export const PatternLibraryView: React.FC = () => {
  const { userProgress, toggleBookmarkPattern, loadIntoPlayground, t, selectedPatternId } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activePattern, setActivePattern] = useState<PromptPattern>(promptPatterns[0]);

  // Sync when selectedPatternId is triggered from Global Search
  React.useEffect(() => {
    if (selectedPatternId) {
      const match = promptPatterns.find((p) => p.id === selectedPatternId);
      if (match) {
        handleSelectPattern(match);
        setSelectedCategory(match.category);
      }
    }
  }, [selectedPatternId]);
  const [variableValues, setVariableValues] = useState<{ [key: string]: string }>(() => {
    const initial: { [key: string]: string } = {};
    promptPatterns[0].variables.forEach((v) => {
      initial[v.name] = v.defaultValue;
    });
    return initial;
  });
  const [copied, setCopied] = useState(false);

  const categories = ["All", "Coding", "Writing", "Analysis", "Architecture"];

  const filteredPatterns = promptPatterns.filter((pattern) => {
    const matchesCategory = selectedCategory === "All" || pattern.category === selectedCategory;
    const matchesSearch =
      pattern.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pattern.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pattern.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSelectPattern = (pattern: PromptPattern) => {
    setActivePattern(pattern);
    const newVars: { [key: string]: string } = {};
    pattern.variables.forEach((v) => {
      newVars[v.name] = v.defaultValue;
    });
    setVariableValues(newVars);
  };

  const handleVariableChange = (name: string, val: string) => {
    setVariableValues((prev) => ({
      ...prev,
      [name]: val
    }));
  };

  // Compile prompt with replaced variables
  const compiledPrompt = activePattern.variables.reduce((acc, v) => {
    const val = variableValues[v.name] !== undefined ? variableValues[v.name] : v.defaultValue;
    return acc.replaceAll(`{{${v.name}}}`, val);
  }, activePattern.template);

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadInPlayground = () => {
    loadIntoPlayground({
      prompt: compiledPrompt,
      systemInstruction: `You are an expert ${activePattern.category} assistant.`
    });
  };

  const isBookmarked = userProgress.bookmarkedPatterns.includes(activePattern.id);

  return (
    <div className="app-view mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-blue-400" />
          <h1 className="text-xl font-bold tracking-tight text-white">{t.patterns.title}</h1>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {t.patterns.subtitle}
        </p>

        {/* Search and Category Filters */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              id="pattern-search-input"
              type="text"
              placeholder={t.patterns.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70 p-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Patterns List + Interactive Template Filler */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Pattern Grid/List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Available Patterns ({filteredPatterns.length})</span>
            <span>Click to customize</span>
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {filteredPatterns.map((pattern) => {
              const isSelected = activePattern.id === pattern.id;
              const isMarked = userProgress.bookmarkedPatterns.includes(pattern.id);

              return (
                <div
                  key={pattern.id}
                  id={`pattern-card-${pattern.id}`}
                  onClick={() => handleSelectPattern(pattern)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-blue-500 bg-slate-900/90 shadow-lg shadow-blue-500/10"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-blue-300 font-mono">
                          {pattern.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {pattern.difficulty}
                        </span>
                      </div>
                      <h3 className="mt-1.5 text-sm font-bold text-white">{pattern.title}</h3>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmarkPattern(pattern.id);
                      }}
                      className="text-slate-400 hover:text-amber-400 p-1"
                    >
                      {isMarked ? (
                        <BookmarkCheck className="h-4 w-4 text-amber-400 fill-amber-400" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {pattern.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {pattern.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Variable Customizer & Live Output (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl backdrop-blur-md space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-950 border border-blue-800 px-2 py-0.5 font-mono text-xs text-blue-300">
                    {activePattern.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{activePattern.variables.length} Dynamic Variables</span>
                </div>
                <h2 className="mt-1.5 text-xl font-bold text-white">{activePattern.title}</h2>
                <p className="mt-0.5 text-xs text-slate-300">{activePattern.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="pattern-copy-btn"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied Prompt!" : "Copy"}</span>
                </button>
                <button
                  id="pattern-load-sandbox-btn"
                  onClick={handleLoadInPlayground}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Test in Sandbox</span>
                </button>
              </div>
            </div>

            {/* Variable Inputs Form */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
                <Sliders className="h-3.5 w-3.5 text-blue-400" /> Customize Template Variables
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activePattern.variables.map((v) => (
                  <div key={v.name} className={v.defaultValue.includes("\n") ? "sm:col-span-2" : ""}>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {v.label} <span className="text-slate-500 font-mono">({`{{${v.name}}}`})</span>
                    </label>
                    {v.defaultValue.includes("\n") || v.defaultValue.length > 60 ? (
                      <textarea
                        rows={3}
                        value={variableValues[v.name] || ""}
                        onChange={(e) => handleVariableChange(v.name, e.target.value)}
                        placeholder={v.placeholder}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <input
                        type="text"
                        value={variableValues[v.name] || ""}
                        onChange={(e) => handleVariableChange(v.name, e.target.value)}
                        placeholder={v.placeholder}
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Rendered Prompt Preview */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Compiled Prompt Preview:</span>
                <span className="font-mono text-slate-500 text-[11px]">{compiledPrompt.length} characters</span>
              </div>
              <pre className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
                {compiledPrompt}
              </pre>
            </div>

            {/* Why it works */}
            <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4">
              <h4 className="text-xs font-bold text-blue-300 flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" /> Architectural Rationale (Why This Works)
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activePattern.whyItWorks.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
