import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  BookOpen,
  Terminal,
  Grid3X3,
  Award,
  Sparkles,
  Command,
  ArrowRight,
  Loader2,
  X,
  Target,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { NavTab } from "../../types";
import {
  buildGlobalSearchIndex,
  queryGlobalSearch,
  POPULAR_QUICK_SEARCHES,
  GlobalSearchItem,
  SearchItemType,
} from "../../lib/globalSearch";

export const GlobalSearch: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    openSandbox,
    setPrompt,
    setSystemInstruction,
    setActiveLessonId,
    setSelectedPatternId,
    setSelectedResourceFilter,
    language,
    theme,
    setTheme,
    resumeCurriculum,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState<'all' | SearchItemType | 'command'>('all');
  const [searchResults, setSearchResults] = useState<GlobalSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Command items
  const commandItems = useMemo(() => [
    {
      id: "cmd-nav-home",
      title: "Go to Home Dashboard",
      subtitle: "Navigate to your progress home overview",
      type: "command" as const,
      tab: "home" as NavTab,
      category: "Navigation",
      action: () => { setActiveTab("home"); setSearchOpen(false); }
    },
    {
      id: "cmd-nav-curriculum",
      title: "Go to Lesson Curriculum",
      subtitle: "Browse module-by-module learning paths",
      type: "command" as const,
      tab: "curriculum" as NavTab,
      category: "Navigation",
      action: () => { setActiveTab("curriculum"); setSearchOpen(false); }
    },
    {
      id: "cmd-nav-foundations",
      title: "Go to Foundations Path",
      subtitle: "Master the 10 core in-context engineering lessons",
      type: "command" as const,
      tab: "foundations" as NavTab,
      category: "Navigation",
      action: () => { setActiveTab("foundations"); setSearchOpen(false); }
    },
    {
      id: "cmd-nav-playground",
      title: "Go to AI Sandbox",
      subtitle: "Interact and test prompt architectures live",
      type: "command" as const,
      tab: "playground" as NavTab,
      category: "Navigation",
      action: () => { setActiveTab("playground"); setSearchOpen(false); }
    },
    {
      id: "cmd-nav-patterns",
      title: "Go to Pattern Library",
      subtitle: "Browse advanced structural templates and blueprints",
      type: "command" as const,
      tab: "patterns" as NavTab,
      category: "Navigation",
      action: () => { setActiveTab("patterns"); setSearchOpen(false); }
    },
    {
      id: "cmd-nav-resources",
      title: "Go to Resources & Glossary",
      subtitle: "Lookup glossary terms and prompt definitions",
      type: "command" as const,
      tab: "resources" as NavTab,
      category: "Navigation",
      action: () => { setActiveTab("resources"); setSearchOpen(false); }
    },
    {
      id: "cmd-theme-dark",
      title: "Switch Theme: Dark Mode",
      subtitle: "Change appearance to calm high-contrast dark palette",
      type: "command" as const,
      tab: activeTab,
      category: "Theme Management",
      action: () => { setTheme("dark"); setSearchOpen(false); }
    },
    {
      id: "cmd-theme-light",
      title: "Switch Theme: Light Mode",
      subtitle: "Change appearance to bright clean canvas layout",
      type: "command" as const,
      tab: activeTab,
      category: "Theme Management",
      action: () => { setTheme("light"); setSearchOpen(false); }
    },
    {
      id: "cmd-action-resume",
      title: "Action: Resume Active Lesson",
      subtitle: "Instantly jump back to your active training curriculum module",
      type: "command" as const,
      tab: "curriculum" as NavTab,
      category: "Learning Action",
      action: () => { 
        if (resumeCurriculum) {
          resumeCurriculum();
        } else {
          setActiveTab("curriculum");
        }
        setSearchOpen(false);
      }
    },
    {
      id: "cmd-action-clear-playground",
      title: "Action: Reset Sandbox Inputs",
      subtitle: "Clear the playground textareas and template states",
      type: "command" as const,
      tab: "playground" as NavTab,
      category: "Sandbox Action",
      action: () => {
        setPrompt("");
        setSystemInstruction("");
        setActiveTab("playground");
        setSearchOpen(false);
      }
    }
  ], [activeTab, resumeCurriculum, setActiveTab, setPrompt, setSystemInstruction, setTheme]);

  // Search Index Memoization
  const globalIndex = useMemo(() => {
    return buildGlobalSearchIndex(language);
  }, [language]);

  // Query Execution
  useEffect(() => {
    if (searchCategory === 'command') {
      const q = searchQuery.trim().toLowerCase();
      if (!q) {
        setSearchResults(commandItems as any);
      } else {
        const filtered = commandItems.filter(cmd =>
          cmd.title.toLowerCase().includes(q) ||
          cmd.subtitle.toLowerCase().includes(q) ||
          cmd.category.toLowerCase().includes(q)
        );
        setSearchResults(filtered as any);
      }
      setSelectedIndex(0);
      setIsSearching(false);
      return;
    }

    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSelectedIndex(0);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results = queryGlobalSearch(globalIndex, searchQuery, searchCategory === 'all' ? 'all' : searchCategory, 12);
    
    if (searchCategory === 'all') {
      const q = searchQuery.trim().toLowerCase();
      const matchedCmds = commandItems.filter(cmd =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.subtitle.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
      );
      setSearchResults([...(matchedCmds as any), ...results]);
    } else {
      setSearchResults(results);
    }
    setSelectedIndex(0);
    setIsSearching(false);
  }, [searchQuery, searchCategory, globalIndex, commandItems]);

  // Keyboard shortcut listener (⌘K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => {
          const next = !prev;
          if (next) {
            setTimeout(() => searchInputRef.current?.focus(), 50);
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelectSearchResult = (item: any) => {
    if (item.type === 'command' && item.action) {
      item.action();
      setSearchOpen(false);
      setSearchQuery("");
      return;
    }
    setActiveTab(item.tab);
    if (item.type === 'lesson' && item.lessonId && setActiveLessonId) {
      setActiveLessonId(item.lessonId);
    } else if (item.type === 'pattern' && item.patternId && setSelectedPatternId) {
      setSelectedPatternId(item.patternId);
    } else if (item.type === 'resource') {
      if (item.externalUrl) {
        window.open(item.externalUrl, '_blank', 'noopener,noreferrer');
      } else if (item.resourceTerm && setSelectedResourceFilter) {
        setSelectedResourceFilter(item.resourceTerm);
      }
    } else if (item.type === 'mission') {
      openSandbox('missions');
    }
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchOpen) {
      if (e.key === 'ArrowDown') {
        setSearchOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelectSearchResult(searchResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "lesson":
        return <BookOpen className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
      case "pattern":
        return <Grid3X3 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
      case "mission":
        return <Terminal className="h-3.5 w-3.5 text-purple-400 shrink-0" />;
      case "resource":
        return <Award className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
      case "command":
        return <Command className="h-3.5 w-3.5 text-blue-400 shrink-0" />;
      default:
        return <Sparkles className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
    }
  };

  return (
    <div ref={searchContainerRef} className="relative flex-1 min-w-0 max-w-[160px] xs:max-w-[200px] sm:max-w-xs md:max-w-[220px] lg:max-w-xs xl:max-w-sm 2xl:max-w-md" id="global-search-container">
      <div
        onClick={() => {
          setSearchOpen(true);
          setTimeout(() => searchInputRef.current?.focus(), 50);
        }}
        className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs text-slate-400 cursor-text transition shadow-sm w-full group min-w-0"
      >
        <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-400 transition-colors shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!searchOpen) setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder="Search curriculum..."
          aria-label="Search prompt curriculum and documentation"
          className="bg-transparent border-none outline-none text-slate-200 placeholder-slate-500 w-full min-w-0 text-xs font-normal focus:ring-0 focus:outline-none p-0"
        />
        {searchQuery ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSearchQuery("");
              setSearchResults([]);
            }}
            className="text-slate-500 hover:text-slate-300 p-0.5 cursor-pointer shrink-0"
            aria-label="Clear search query"
          >
            <X className="h-3 w-3" />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-slate-500 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded shadow-xs shrink-0 select-none">
            <span className="text-[10px]">⌘</span>K
          </kbd>
        )}
      </div>

      {/* Dropdown Overlay */}
      {searchOpen && (
        <div 
          className="absolute left-0 sm:left-auto sm:right-0 md:left-0 w-[calc(100vw-1.5rem)] sm:w-[460px] max-w-[92vw] mt-2 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] flex flex-col"
          role="dialog"
          aria-label="Global Search Results"
        >
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-2 bg-slate-900/60 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
            {(['all', 'lesson', 'pattern', 'mission', 'resource', 'command'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSearchCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  searchCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {cat === 'all' ? 'All Results' : cat + 's'}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto max-h-[380px] p-2 custom-scrollbar">
            {isSearching ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-500 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                <span className="text-xs">Searching Ecorp Academy index...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectSearchResult(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left p-2 rounded-xl flex items-start gap-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/15 border border-blue-500/30 text-white'
                          : 'hover:bg-slate-900/80 text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="mt-0.5 p-1 rounded-lg bg-slate-900 border border-slate-800">
                        {getItemIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-xs text-white truncate">{item.title}</p>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                            {item.category || item.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.subtitle}</p>
                      </div>
                      <ArrowRight className={`h-3.5 w-3.5 self-center shrink-0 transition-transform ${isSelected ? 'text-blue-400 translate-x-0.5' : 'text-slate-600'}`} />
                    </button>
                  );
                })}
              </div>
            ) : searchQuery.trim().length >= 2 ? (
              <div className="py-8 text-center text-slate-500 space-y-1">
                <p className="text-xs font-semibold text-slate-400">No results found for "{searchQuery}"</p>
                <p className="text-[11px]">Try searching for XML tags, Few-Shot, CoT, or Jailbreak defense</p>
              </div>
            ) : (
              <div className="py-2 px-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 px-2 mb-2 font-mono">
                  Recommended Quick Searches
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {POPULAR_QUICK_SEARCHES.map((quick) => (
                    <button
                      key={quick.label}
                      onClick={() => {
                        setSearchQuery(quick.query);
                      }}
                      className="text-left p-2 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between group cursor-pointer"
                    >
                      <div className="truncate">
                        <p className="text-xs font-medium text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                          {quick.label}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate capitalize">{quick.type}</p>
                      </div>
                      <Search className="h-3 w-3 text-slate-600 group-hover:text-blue-400 shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-2.5 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-950 border border-slate-800 rounded font-mono text-[9px]">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-950 border border-slate-800 rounded font-mono text-[9px]">↵</kbd> Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-slate-950 border border-slate-800 rounded font-mono text-[9px]">ESC</kbd> Close
              </span>
            </div>
            <span className="hidden sm:inline text-slate-400 font-mono text-[10px]">ECORP Academy</span>
          </div>
        </div>
      )}
    </div>
  );
};
