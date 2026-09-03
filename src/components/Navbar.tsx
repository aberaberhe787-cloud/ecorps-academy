import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  BookOpen,
  Terminal,
  Grid3X3,
  Compass,
  Trophy,
  Zap,
  Menu,
  X,
  User,
  Award,
  Flame,
  Star,
  ChevronRight,
  Search,
  Target,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  CornerDownLeft,
  Command,
  Layers,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { NetworkStatusBadge } from "./NetworkStatusIndicator";
import { useApp } from "../context/AppContext";
import { NavTab } from "../types";
import { GoogleTranslate } from "./GoogleTranslate";
import { EcorpLogo } from "./EcorpLogo";
import { CertificateGenerator } from "./CertificateGenerator";
import { auth } from "../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { ProfilePanel } from "./profile/ProfilePanel";
import { motion, AnimatePresence } from "motion/react";
import {
  buildGlobalSearchIndex,
  queryGlobalSearch,
  POPULAR_QUICK_SEARCHES,
  GlobalSearchItem,
  SearchItemType,
} from "../lib/globalSearch";

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    openSandbox,
    userProgress,
    hasRealApiAvailable,
    aiMode,
    setAiMode,
    t,
    logout,
    setActiveLessonId,
    selectedPatternId,
    setSelectedPatternId,
    selectedResourceFilter,
    setSelectedResourceFilter,
    language,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState<'all' | SearchItemType>('all');
  const [searchResults, setSearchResults] = useState<GlobalSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Global search index built across all academy lessons, patterns, resources, missions
  const globalIndex = React.useMemo(() => {
    return buildGlobalSearchIndex(language);
  }, [language]);

  // Execute global search whenever query or category changes
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSelectedIndex(0);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results = queryGlobalSearch(globalIndex, searchQuery, searchCategory, 12);
    setSearchResults(results);
    setSelectedIndex(0);
    setIsSearching(false);
  }, [searchQuery, searchCategory, globalIndex]);

  // Keyboard shortcut listener (⌘K or Ctrl+K)
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
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
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

  const handleSelectSearchResult = (item: GlobalSearchItem) => {
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

  const handlePasswordReset = async () => {
    const email = auth.currentUser?.email;
    if (!email) {
      setResetStatus("No active authenticated email detected.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetStatus(`Password reset link sent to ${email}`);
    } catch (err: any) {
      console.error("sendPasswordResetEmail failed", err);
      setResetStatus(err.message || "Failed to send reset link.");
    }
  };

  const getItemIcon = (type: SearchItemType) => {
    switch (type) {
      case 'lesson':
        return <BookOpen className="h-3.5 w-3.5 text-blue-400" />;
      case 'foundation':
        return <Target className="h-3.5 w-3.5 text-indigo-400" />;
      case 'pattern':
        return <Grid3X3 className="h-3.5 w-3.5 text-emerald-400" />;
      case 'resource':
        return <Sparkles className="h-3.5 w-3.5 text-amber-400" />;
      case 'mission':
        return <Terminal className="h-3.5 w-3.5 text-purple-400" />;
      default:
        return <BookOpen className="h-3.5 w-3.5 text-blue-400" />;
    }
  };

  const getItemBadgeClass = (type: SearchItemType) => {
    switch (type) {
      case 'lesson':
        return 'bg-blue-950/70 text-blue-300 border-blue-800/60';
      case 'foundation':
        return 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60';
      case 'pattern':
        return 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60';
      case 'resource':
        return 'bg-amber-950/70 text-amber-300 border-amber-800/60';
      case 'mission':
        return 'bg-purple-950/70 text-purple-300 border-purple-800/60';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  const SEARCH_CATEGORIES: { id: 'all' | SearchItemType; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'lesson', label: 'Lessons' },
    { id: 'pattern', label: 'Patterns' },
    { id: 'resource', label: 'Resources' },
    { id: 'mission', label: 'Missions' },
  ];

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "home", label: t.nav.home, icon: Compass },
    { id: "curriculum", label: t.nav.curriculum, icon: BookOpen },
    { id: "foundations", label: "Foundations", icon: Target },
    { id: "playground", label: t.nav.sandbox, icon: Terminal },
    { id: "patterns", label: t.nav.patterns, icon: Grid3X3 },
    { id: "resources", label: t.nav.resources, icon: Sparkles },
    { id: "certification", label: "Assessment", icon: Award },
    { id: "profile", label: "Dashboard", icon: User }
  ];

  const level = Math.floor(userProgress.xp / 500) + 1;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md" role="banner">
        <nav className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6 lg:px-8" aria-label="Main navigation">
          
          {/* Brand Logo */}
          <button
            onClick={() => setActiveTab("home")}
            className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-90"
            aria-label="Go to home"
          >
            <EcorpLogo size="sm" className="sm:hidden" />
            <EcorpLogo size="md" className="hidden sm:flex" />
            <span className="hidden sm:block font-mono font-extrabold text-white text-sm sm:text-base">
              {t.nav.brandName}
            </span>
          </button>

          {/* Global Search Bar with Autocomplete Modal / Dropdown */}
          <div ref={searchContainerRef} className="relative flex-1 min-w-0 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-1 sm:mx-3" role="search">
            <div className="relative w-full">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search lessons, patterns, resources..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={handleInputKeyDown}
                className="w-full rounded-xl border border-slate-700/90 bg-slate-900/90 pl-8 sm:pl-9 pr-14 py-1.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none truncate transition-all shadow-inner"
                aria-label="Global search across academy lessons, patterns, and resources"
                aria-expanded={searchOpen}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {isSearching && (
                  <Loader2 className="h-3.5 w-3.5 text-blue-400 animate-spin" />
                )}
                {!isSearching && searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      searchInputRef.current?.focus();
                    }}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                {!searchQuery && (
                  <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800/90 border border-slate-700/80 rounded select-none shadow-xs">
                    ⌘K
                  </kbd>
                )}
              </div>
            </div>

            {/* Global Search Results Dropdown / Modal */}
            {searchOpen && (
              <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 w-[calc(100vw-24px)] sm:w-[500px] md:w-[560px] max-w-[94vw] max-h-[82vh] overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-950/98 backdrop-blur-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
                {/* Category Filter Tabs */}
                <div className="flex items-center gap-1 px-3 pt-2.5 pb-2 border-b border-slate-800/80 overflow-x-auto scrollbar-none bg-slate-900/40">
                  {SEARCH_CATEGORIES.map((cat) => {
                    const isSelected = searchCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSearchCategory(cat.id)}
                        className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                  {searchResults.length > 0 && (
                    <span className="ml-auto text-[10px] font-mono text-slate-400 shrink-0 pr-1">
                      {searchResults.length} match{searchResults.length === 1 ? '' : 'es'}
                    </span>
                  )}
                </div>

                {/* Content Area */}
                <div className="overflow-y-auto max-h-[380px] p-2 space-y-1">
                  {searchQuery.trim().length >= 2 ? (
                    searchResults.length > 0 ? (
                      searchResults.map((item, idx) => {
                        const isHighlighted = idx === selectedIndex;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelectSearchResult(item)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={`w-full text-left rounded-xl p-2.5 transition-all flex items-start gap-3 group border ${
                              isHighlighted
                                ? "bg-slate-900/90 border-blue-500/50 shadow-sm"
                                : "hover:bg-slate-900/60 border-transparent"
                            }`}
                          >
                            <div className="shrink-0 mt-0.5 p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center">
                              {getItemIcon(item.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className={`text-xs font-semibold truncate ${
                                  isHighlighted ? "text-blue-300" : "text-slate-200 group-hover:text-blue-300"
                                }`}>
                                  {item.title}
                                </p>
                              </div>
                              {item.subtitle && (
                                <p className="text-[11px] text-slate-400 line-clamp-1">
                                  {item.subtitle}
                                </p>
                              )}
                              <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                                <span>{item.category}</span>
                                {item.tags && item.tags.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="text-slate-400 truncate max-w-[150px]">
                                      #{item.tags[0]}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-1.5 mt-0.5">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border capitalize ${getItemBadgeClass(item.type)}`}>
                                {item.type}
                              </span>
                              {isHighlighted && (
                                <CornerDownLeft className="h-3 w-3 text-blue-400 animate-pulse" />
                              )}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="py-8 px-4 text-center">
                        <p className="text-xs font-medium text-slate-300">
                          No matches found for &ldquo;{searchQuery}&rdquo;
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          Try searching for prompt concepts like &ldquo;Chain-of-Thought&rdquo;, &ldquo;Zero-Shot&rdquo;, or &ldquo;XML Delimiters&rdquo;.
                        </p>
                      </div>
                    )
                  ) : (
                    /* Suggestions & Quick Links when query is empty */
                    <div className="p-3">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2.5">
                        <span>Popular Academy Topics</span>
                        <span className="text-slate-400">Quick Filter</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_QUICK_SEARCHES.map((qs) => (
                          <button
                            key={qs.label}
                            onClick={() => {
                              setSearchQuery(qs.query);
                              searchInputRef.current?.focus();
                            }}
                            className="text-left px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1.5 group"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 group-hover:scale-125 transition-transform" />
                            <span>{qs.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Keyboard Shortcut Footer */}
                <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <div className="flex items-center gap-3">
                    <span><kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">↑↓</kbd> navigate</span>
                    <span><kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">↵</kbd> select</span>
                    <span><kbd className="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">ESC</kbd> close</span>
                  </div>
                  <span className="hidden sm:inline text-slate-400">ECORP Academy Global Search</span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); }}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Compact Nav for Intermediate Desktop (md-lg) */}
          <nav className="hidden md:flex xl:hidden items-center gap-0.5 rounded-xl border border-slate-800 bg-slate-900/60 p-1 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); }}
                  title={item.label}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Side Controls */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <NetworkStatusBadge />
            <ThemeToggle />
            
            {/* Auth Buttons / Account Menu */}
            <div ref={accountMenuRef} className="relative">
              <button
                onClick={() => { 
                  setAccountOpen((s) => !s); 
                  setProfileOpen(false); 
                  setResetStatus(null);
                }}
                className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center hover:opacity-90 transition-opacity border border-blue-400/40 shadow-sm"
                aria-label="Open account menu"
                aria-expanded={accountOpen}
              >
                <User className="h-4 w-4 text-white" />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl bg-slate-950 border border-slate-800 shadow-2xl z-50 p-2 text-xs animate-in fade-in duration-100">
                  <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                    <p className="font-semibold text-white truncate">
                      {auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "Scholar"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {auth.currentUser?.email || "Authenticated User"}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] font-mono text-blue-400">
                      <span>Level {level}</span>
                      <span>{userProgress.xp} XP</span>
                    </div>
                  </div>

                  {resetStatus && (
                    <div className="mb-2 p-2 rounded-lg bg-blue-950/60 border border-blue-800/80 text-[11px] text-blue-300">
                      {resetStatus}
                    </div>
                  )}

                  <button
                    className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-between"
                    onClick={() => {
                      setAccountOpen(false);
                      setActiveTab("profile");
                    }}
                  >
                    <span>Academic Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                  </button>

                  <button
                    className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
                    onClick={handlePasswordReset}
                  >
                    Send Password Reset Link
                  </button>

                  <div className="border-t border-slate-800/80 my-1"></div>

                  <button
                    className="w-full text-left px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors font-medium"
                    onClick={async () => {
                      setAccountOpen(false);
                      try {
                        await logout();
                      } catch (e) {
                        console.error('Logout from account menu failed', e);
                      }
                    }}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 text-slate-300 hover:text-white"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </header>
      
      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[60] w-72 max-w-[85vw] bg-slate-950 border-l border-slate-800 p-5 sm:p-6 md:hidden overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <EcorpLogo size="sm" />
                    <span className="font-mono font-bold text-white text-sm">
                      {t.nav.brandName}
                    </span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    aria-label="Close navigation menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Search Trigger in Drawer */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchOpen(true);
                    setTimeout(() => searchInputRef.current?.focus(), 150);
                  }}
                  className="w-full mb-3 flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-colors shadow-inner"
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-blue-400" />
                    <span>Search academy content...</span>
                  </div>
                  <kbd className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">⌘K</kbd>
                </button>

                <div className="flex flex-col gap-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { 
                          setActiveTab(item.id); 
                          setMobileMenuOpen(false); 
                        }}
                        className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                            : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-800/80 text-xs text-slate-400 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Level {level}</span>
                  <span className="text-blue-400 font-mono font-semibold">{userProgress.xp} XP</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Streak</span>
                  <span className="text-amber-400 font-semibold">{userProgress.streakDays} days 🔥</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Drawer & Panels */}
      {profileOpen && <ProfilePanel onClose={() => setProfileOpen(false)} />}
    </>
  );
};

