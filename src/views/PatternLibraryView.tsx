import React, { useState } from "react";
import { motion } from "motion/react";
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
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Target,
  Layers,
  GraduationCap,
  FileCode,
  ArrowRight,
  Split,
  Tag,
  Shield
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { promptPatterns } from "../data/patternsData";
import { PromptPattern, PatternType } from "../types";
import { getCompetenciesForPattern } from "../lib/competencyModel";

export const PatternLibraryView: React.FC = () => {
  const { userProgress, toggleBookmarkPattern, loadIntoPlayground, t, selectedPatternId } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activePattern, setActivePattern] = useState<PromptPattern>(promptPatterns[0]);
  const [exampleTab, setExampleTab] = useState<"improved" | "weak">("improved");
  const [copiedWeak, setCopiedWeak] = useState(false);
  const [copiedImproved, setCopiedImproved] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const categories = ["All", "Coding", "Writing", "Analysis", "Architecture"];

  const filteredPatterns = promptPatterns.filter((pattern) => {
    const matchesCategory = selectedCategory === "All" || pattern.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      pattern.title.toLowerCase().includes(q) ||
      pattern.description.toLowerCase().includes(q) ||
      (pattern.concept && pattern.concept.toLowerCase().includes(q)) ||
      (pattern.learningObjective && pattern.learningObjective.toLowerCase().includes(q)) ||
      (pattern.supportingTechniques && pattern.supportingTechniques.some((st) => st.toLowerCase().includes(q))) ||
      pattern.tags.some((tg) => tg.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleSelectPattern = (pattern: PromptPattern) => {
    setActivePattern(pattern);
    setExampleTab("improved");
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

  const handleCopyWeak = () => {
    if (activePattern.weakExample?.prompt) {
      navigator.clipboard.writeText(activePattern.weakExample.prompt);
      setCopiedWeak(true);
      setTimeout(() => setCopiedWeak(false), 2000);
    }
  };

  const handleCopyImproved = () => {
    if (activePattern.improvedExample?.prompt) {
      navigator.clipboard.writeText(activePattern.improvedExample.prompt);
      setCopiedImproved(true);
      setTimeout(() => setCopiedImproved(false), 2000);
    }
  };

  const handleLoadInPlayground = () => {
    loadIntoPlayground({
      prompt: compiledPrompt,
      systemInstruction: `You are an expert ${activePattern.category} assistant.`
    });
  };

  const isBookmarked = userProgress.bookmarkedPatterns.includes(activePattern.id);

  const getPatternTypeInfo = (type?: PatternType) => {
    switch (type) {
      case "workflow":
        return {
          label: t.patterns.typeWorkflow || "Prompt Workflow",
          badgeClass: "bg-purple-950/80 border-purple-800/70 text-purple-300",
          tagClass: "bg-purple-950/50 text-purple-400 border-purple-800/40",
          shortLabel: "Workflow"
        };
      case "evaluation":
        return {
          label: t.patterns.typeEvaluation || "Evaluation Pattern",
          badgeClass: "bg-amber-950/80 border-amber-800/70 text-amber-300",
          tagClass: "bg-amber-950/50 text-amber-400 border-amber-800/40",
          shortLabel: "Evaluation"
        };
      case "pattern":
      default:
        return {
          label: t.patterns.typePattern || "Prompt Pattern",
          badgeClass: "bg-cyan-950/80 border-cyan-800/70 text-cyan-300",
          tagClass: "bg-cyan-950/50 text-cyan-400 border-cyan-800/40",
          shortLabel: "Pattern"
        };
    }
  };

  const activeTypeInfo = getPatternTypeInfo(activePattern.patternType);

  return (
    <div className="app-view w-full max-w-7xl 2xl:max-w-[1536px] mx-auto px-2.5 sm:px-6 lg:px-8 py-2.5 sm:py-6 space-y-3 sm:space-y-6 pb-20 sm:pb-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3 sm:pb-5">
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
          <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70 p-1 no-scrollbar max-w-full relative">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200 z-10 ${
                    isActive
                      ? "text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="patternCategoryIndicator"
                      className="absolute inset-0 bg-blue-600 rounded-lg shadow-sm shadow-blue-500/25 -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 450,
                        damping: 34,
                      }}
                    />
                  )}
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Patterns List + Interactive Educational System */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8">
        {/* Left Column: Pattern Grid/List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Available Patterns ({filteredPatterns.length})</span>
            <span>Click to study & customize</span>
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {filteredPatterns.map((pattern) => {
              const isSelected = activePattern.id === pattern.id;
              const isMarked = userProgress.bookmarkedPatterns.includes(pattern.id);
              const typeInfo = getPatternTypeInfo(pattern.patternType);

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
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-blue-300 font-mono">
                          {pattern.category}
                        </span>
                        <span className={`rounded border px-1.5 py-0.5 text-[10px] font-mono font-medium ${typeInfo.badgeClass}`}>
                          {typeInfo.shortLabel}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {pattern.difficulty}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white">{pattern.title}</h3>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmarkPattern(pattern.id);
                      }}
                      className="text-slate-400 hover:text-amber-400 p-1 shrink-0"
                      aria-label="Bookmark pattern"
                    >
                      {isMarked ? (
                        <BookmarkCheck className="h-4 w-4 text-amber-400 fill-amber-400" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {pattern.concept && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-blue-300/90 bg-blue-950/30 border border-blue-900/40 rounded-md px-2 py-1 line-clamp-1">
                      <Sparkles className="h-3 w-3 text-blue-400 shrink-0" />
                      <span className="truncate">{pattern.concept}</span>
                    </div>
                  )}

                  {/* Competency Tags */}
                  {pattern.competencies && pattern.competencies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {getCompetenciesForPattern(pattern.id).map((comp) => (
                        <span
                          key={comp.id}
                          className="inline-flex items-center gap-1 rounded bg-purple-950/50 border border-purple-800/60 px-1.5 py-0.5 text-[10px] font-mono text-purple-300 font-medium"
                        >
                          <Shield className="h-2.5 w-2.5 text-purple-400" />
                          {comp.title}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {pattern.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {pattern.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px] text-slate-400 font-mono"
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

        {/* Right Column: Educational System & Interactive Customizer (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-xl backdrop-blur-md space-y-6">
            {/* 1. Pattern Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-blue-950 border border-blue-800 px-2 py-0.5 font-mono text-xs text-blue-300">
                    {activePattern.category}
                  </span>
                  <span className={`rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${activeTypeInfo.badgeClass}`}>
                    {activeTypeInfo.label}
                  </span>
                  <span className="rounded-md bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 font-mono text-xs text-slate-300">
                    {activePattern.difficulty}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {activePattern.variables.length} Dynamic Variables
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{activePattern.title}</h2>
                <p className="text-xs text-slate-300 leading-relaxed">{activePattern.description}</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-1">
                <button
                  type="button"
                  onClick={() => toggleBookmarkPattern(activePattern.id)}
                  className={`p-2 rounded-lg border transition-colors ${
                    isBookmarked
                      ? "border-amber-500/50 bg-amber-950/30 text-amber-400"
                      : "border-slate-700 bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                  title={isBookmarked ? "Remove Bookmark" : "Bookmark Pattern"}
                  aria-label="Toggle Bookmark"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </button>
                <button
                  id="pattern-copy-btn"
                  onClick={handleCopy}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors min-h-[38px]"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
                <button
                  id="pattern-load-sandbox-btn"
                  onClick={handleLoadInPlayground}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95 min-h-[38px]"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Test in Sandbox</span>
                </button>
              </div>
            </div>

            {/* 2. Educational Core: Concept & Learning Objective */}
            <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-950/40 via-slate-900 to-indigo-950/30 p-4 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-900/40 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-blue-500/20 text-blue-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400/90 block">
                      {t.patterns.concept}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {activePattern.concept}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Layers className="h-3.5 w-3.5 text-blue-400" />
                  <span>Architecture</span>
                </div>
              </div>

              {/* Supporting Techniques */}
              {activePattern.supportingTechniques && activePattern.supportingTechniques.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block">
                    {t.patterns.supportingTechniquesTitle || "Supporting Techniques:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activePattern.supportingTechniques.map((tech, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/60 text-[11px] font-medium text-blue-200"
                      >
                        <Tag className="h-2.5 w-2.5 text-blue-400" />
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Associated Unified Competencies */}
              {activePattern.competencies && activePattern.competencies.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-purple-400 block">
                    Unified Competency Alignment:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {getCompetenciesForPattern(activePattern.id).map((comp) => (
                      <span
                        key={comp.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-950/70 border border-purple-800/80 text-[11px] font-medium text-purple-200 font-mono"
                      >
                        <Shield className="h-3 w-3 text-purple-400" />
                        {comp.title} ({comp.level})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Objective */}
              <div className="flex items-start gap-2.5 pt-1 border-t border-blue-900/30">
                <Target className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-white block text-[11px] uppercase tracking-wide text-emerald-400 mb-0.5">
                    {t.patterns.learningObjective}
                  </span>
                  {activePattern.learningObjective}
                </div>
              </div>
            </div>

            {/* 3. Practical Usage Guidance: When to Use vs When NOT to Use */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* When to Use */}
              <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/15 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{t.patterns.whenToUse}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activePattern.whenToUse.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold leading-none mt-1">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* When NOT to Use */}
              <div className="rounded-xl border border-rose-900/40 bg-rose-950/15 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                  <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{t.patterns.whenNotToUse}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activePattern.whenNotToUse.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold leading-none mt-1">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4. Technical Boundaries & Limitations */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <span>{t.patterns.limitations}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {activePattern.limitations.map((limit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400/80 font-bold leading-none mt-1">•</span>
                    <span className="leading-relaxed">{limit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 5. Pattern Anatomy & Architecture (P1-G) */}
            {activePattern.anatomy && activePattern.anatomy.length > 0 && (
              <div className="rounded-xl border border-indigo-900/40 bg-slate-950/80 p-4 space-y-3.5">
                <div className="border-b border-slate-800 pb-2.5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-indigo-400" />
                      <span>{t.patterns.patternAnatomy}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {t.patterns.anatomySubtitle}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 rounded px-2 py-0.5">
                    {activePattern.anatomy.length} Architectural Blocks
                  </span>
                </div>

                <div className="space-y-2.5">
                  {activePattern.anatomy.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-800/90 bg-slate-900/60 p-3 hover:border-indigo-800/50 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-indigo-950 border border-indigo-800 text-[10px] font-mono font-bold text-indigo-300">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {item.name}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 border border-blue-900/50 text-blue-300">
                          {item.technique}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-2">
                        {item.explanation}
                      </p>
                      <div className="flex items-start gap-1.5 rounded-md bg-slate-950/90 border border-slate-800/70 p-2 text-[11px] text-slate-400">
                        <span className="font-semibold text-indigo-300 shrink-0 font-mono">
                          WHY:
                        </span>
                        <span className="leading-relaxed">{item.purpose}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Before / After Experience: Weak vs Improved (P1-H) */}
            {activePattern.weakExample && activePattern.improvedExample && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                      <Split className="h-4 w-4 text-blue-400" />
                      <span>{t.patterns.beforeAfterComparison}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Compare a realistic failure mode with the engineered prompt solution
                    </p>
                  </div>

                  {/* Toggle Tabs */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 shrink-0">
                    <button
                      type="button"
                      onClick={() => setExampleTab("improved")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        exampleTab === "improved"
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      ⚡ Engineered Pattern
                    </button>
                    <button
                      type="button"
                      onClick={() => setExampleTab("weak")}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        exampleTab === "weak"
                          ? "bg-rose-950/80 border border-rose-800/60 text-rose-200 shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      ✕ Weak Baseline
                    </button>
                  </div>
                </div>

                {/* Tab Content: Weak vs Improved */}
                {exampleTab === "weak" ? (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300">
                        <XCircle className="h-3.5 w-3.5 text-rose-400" />
                        <span>{t.patterns.weakPromptTitle}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyWeak}
                        className="flex items-center gap-1 font-mono text-[11px] text-rose-400 hover:text-rose-300"
                      >
                        {copiedWeak ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedWeak ? "Copied" : "Copy Weak Prompt"}</span>
                      </button>
                    </div>

                    <pre className="rounded-lg border border-rose-900/40 bg-rose-950/15 p-3.5 font-mono text-xs text-rose-200 whitespace-pre-wrap leading-relaxed">
                      {activePattern.weakExample.prompt}
                    </pre>

                    <div className="rounded-lg border border-rose-900/30 bg-slate-900/60 p-3.5 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 block">
                        {t.patterns.whyWeakTitle}
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {activePattern.weakExample.problems.map((prob, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-rose-400 font-bold leading-none mt-1">✕</span>
                            <span className="leading-relaxed">{prob}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                        <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{t.patterns.improvedPromptTitle}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyImproved}
                        className="flex items-center gap-1 font-mono text-[11px] text-cyan-400 hover:text-cyan-300"
                      >
                        {copiedImproved ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        <span>{copiedImproved ? "Copied" : "Copy Improved Prompt"}</span>
                      </button>
                    </div>

                    <pre className="rounded-lg border border-cyan-900/40 bg-cyan-950/15 p-3.5 font-mono text-xs text-cyan-100 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                      {activePattern.improvedExample.prompt}
                    </pre>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                          {t.patterns.whatChangedTitle}
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {activePattern.improvedExample.changes.map((change, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold leading-none mt-1">+</span>
                              <span className="leading-relaxed">{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">
                          {t.patterns.whyItMattersTitle}
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {activePattern.improvedExample.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. Variable Inputs Form */}
            <div className="border-t border-slate-800/80 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-blue-400" />
                  <span>{t.patterns.customParameters || "Customize Template Variables"}</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  {activePattern.variables.length} fields
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activePattern.variables.map((v) => (
                  <div key={v.name} className={v.defaultValue.includes("\n") ? "sm:col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
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

            {/* 8. Live Rendered Prompt Preview */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Compiled Prompt Output:</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-500 text-xs">{compiledPrompt.length} characters</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-mono"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
              <pre className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed selection:bg-blue-600/40">
                {compiledPrompt}
              </pre>
            </div>

            {/* 9. Why it works: Architectural Rationale */}
            <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4">
              <h4 className="text-xs font-bold text-blue-300 flex items-center gap-1.5 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>{t.patterns.theoreticalUnderpinning || "Architectural Rationale (Why This Works)"}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {activePattern.whyItWorks.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span className="leading-relaxed">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 10. Bottom Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div className="text-xs text-slate-400 font-mono">
                Pattern ID: <span className="text-slate-300">{activePattern.id}</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors min-h-[38px]"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Prompt"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleLoadInPlayground}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:brightness-110 active:scale-95 min-h-[38px]"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Test in Sandbox</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
