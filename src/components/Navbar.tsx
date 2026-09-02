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
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useApp } from "../context/AppContext";
import { NavTab } from "../types";
import { GoogleTranslate } from "./GoogleTranslate";
import { EcorpLogo } from "./EcorpLogo";
import { CertificateGenerator } from "./CertificateGenerator";
import { auth } from "../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { curriculumModules } from "../data/lessonsData";
import { FOUNDATION_LESSONS } from "../views/PromptEngineeringPath";
import { promptPatterns } from "../data/patternsData";
import { ProfilePanel } from "./profile/ProfilePanel";
import { motion, AnimatePresence } from "motion/react";

interface SearchResultItem {
  id: string;
  title: string;
  type: "curriculum" | "foundation" | "pattern" | "tab";
  tab: NavTab;
  category?: string;
  lessonId?: string;
}

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, openSandbox, userProgress, hasRealApiAvailable, aiMode, setAiMode, t, logout, setActiveLessonId } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    setIsSearching(true);
    setSearchOpen(true);

    const q = query.toLowerCase().trim();
    const localMatches: SearchResultItem[] = [];

    // Search foundations
    FOUNDATION_LESSONS.forEach((lesson) => {
      if (
        lesson.title.toLowerCase().includes(q) ||
        lesson.summary.toLowerCase().includes(q)
      ) {
        localMatches.push({
          id: lesson.id,
          title: lesson.title,
          type: "foundation",
          tab: "foundations",
          category: "Foundations",
          lessonId: lesson.id,
        });
      }
    });

    // Search curriculum modules
    curriculumModules.forEach((mod) => {
      if (mod.title.toLowerCase().includes(q)) {
        localMatches.push({
          id: mod.id,
          title: mod.title,
          type: "curriculum",
          tab: "curriculum",
          category: "Curriculum Module",
        });
      }
      mod.lessons.forEach((l) => {
        if (
          l.title.toLowerCase().includes(q) ||
          (l.conceptSummary && l.conceptSummary.toLowerCase().includes(q)) ||
          (l.subtitle && l.subtitle.toLowerCase().includes(q))
        ) {
          localMatches.push({
            id: l.id,
            title: l.title,
            type: "curriculum",
            tab: "curriculum",
            category: mod.title,
            lessonId: l.id,
          });
        }
      });
    });

    // Search prompt patterns
    promptPatterns.forEach((pat) => {
      if (
        pat.title.toLowerCase().includes(q) ||
        pat.description.toLowerCase().includes(q) ||
        pat.category.toLowerCase().includes(q)
      ) {
        localMatches.push({
          id: pat.id,
          title: pat.title,
          type: "pattern",
          tab: "patterns",
          category: `Pattern · ${pat.category}`,
        });
      }
    });

    // Try server search or deduplicate local matches
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const serverResults = await response.json();
        if (Array.isArray(serverResults)) {
          serverResults.forEach((item: any) => {
            if (!localMatches.some((m) => m.title.toLowerCase() === item.title.toLowerCase())) {
              localMatches.push({
                id: item.id || `srv-${Math.random()}`,
                title: item.title,
                type: item.type === "course" ? "curriculum" : "tab",
                tab: item.type === "profile" ? "profile" : "curriculum",
                category: "Knowledge Base",
              });
            }
          });
        }
      }
    } catch {
      // Graceful fallback to rich local search
    }

    setSearchResults(localMatches.slice(0, 8));
    setIsSearching(false);
  };

  const handleSelectSearchResult = (item: SearchResultItem) => {
    setActiveTab(item.tab);
    if (item.lessonId && setActiveLessonId) {
      setActiveLessonId(item.lessonId);
    }
    setSearchOpen(false);
    setSearchQuery("");
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

          {/* Search Bar with Autocomplete Dropdown */}
          <div ref={searchContainerRef} className="relative flex-1 min-w-0 max-w-xs sm:max-w-sm mx-1 sm:mx-3" role="search">
            <div className="relative w-full">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search modules, patterns..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2 && searchResults.length > 0) {
                    setSearchOpen(true);
                  }
                }}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 pl-8 sm:pl-9 pr-8 py-1 sm:py-1.5 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none truncate transition-colors"
                aria-label="Search courses and content"
              />
              {isSearching && (
                <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 animate-spin" />
              )}
              {!isSearching && searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setSearchOpen(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Live Search Results Dropdown */}
            {searchOpen && (
              <div className="absolute left-0 right-0 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                {searchResults.length > 0 ? (
                  <div className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-500 flex justify-between items-center">
                      <span>Matching Content</span>
                      <span>{searchResults.length} results</span>
                    </div>
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectSearchResult(item)}
                        className="w-full text-left rounded-lg p-2.5 hover:bg-slate-900/90 transition-colors flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 truncate">
                            {item.title}
                          </p>
                          {item.category && (
                            <p className="text-[10px] text-slate-400 truncate font-mono">
                              {item.category}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 group-hover:border-blue-500/50 group-hover:text-blue-300">
                          {item.type}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </div>
                )}
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

