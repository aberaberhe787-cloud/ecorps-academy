import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useApp } from "../context/AppContext";
import { NavTab } from "../types";
import { GoogleTranslate } from "./GoogleTranslate";
import { EcorpLogo } from "./EcorpLogo";
import { CertificateGenerator } from "./CertificateGenerator";
import { auth } from "../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

interface ProfilePanelProps {
  onClose: () => void;
}

import { ProfilePanel } from "./profile/ProfilePanel";

import { motion, AnimatePresence } from "motion/react";

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, openSandbox, userProgress, hasRealApiAvailable, aiMode, setAiMode, t, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const results = await response.json();
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "home", label: t.nav.home, icon: Compass },
    { id: "curriculum", label: t.nav.curriculum, icon: BookOpen },
    { id: "foundations", label: "Foundations", icon: Target },
    { id: "playground", label: t.nav.sandbox, icon: Terminal },
    { id: "patterns", label: t.nav.patterns, icon: Grid3X3 },
    { id: "resources", label: t.nav.resources, icon: Sparkles },
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
            <EcorpLogo size="md" />
            <span className="hidden xs:block font-mono font-extrabold text-white">
              {t.nav.brandName}
            </span>
          </button>

          {/* Search Bar */}
          <div className="flex-1 flex justify-center px-4" role="search">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/60 pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                aria-label="Search courses and content"
              />
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/60 p-1.5 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { if (item.id === 'profile') { setProfileOpen(true); } setActiveTab(item.id); }}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
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
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Auth Buttons / Account menu */}
            <div className="relative">
              <button
                onClick={() => { setAccountOpen((s) => !s); setProfileOpen(false); }}
                className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
                aria-label="Open account menu"
              >
                <User className="h-4 w-4 text-white" />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-slate-950 border border-slate-800 shadow-lg z-50">
                  <div className="p-2">
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded"
                      onClick={async () => {
                        setAccountOpen(false);
                        try {
                          await logout();
                        } catch (e) {
                          console.error('Logout from account menu failed', e);
                        }
                      }}
                    >
                      Log out
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 rounded"
                      onClick={async () => {
                        setAccountOpen(false);
                        const email = (auth.currentUser && auth.currentUser.email) ? auth.currentUser.email : null;
                        if (!email) {
                          alert('No email available for password reset');
                          return;
                        }
                        try {
                          await sendPasswordResetEmail(auth, email);
                          alert('Password reset email sent to ' + email);
                        } catch (err) {
                          console.error('sendPasswordResetEmail failed', err);
                          alert('Failed to send password reset email');
                        }
                      }}
                    >
                      Change password
                    </button>
                    <div className="px-3 py-2">
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-300"
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
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[60] w-64 bg-slate-950 border-l border-slate-800 p-6 md:hidden"
          >
            <div className="flex justify-end mb-6">
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-300">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Drawer & Panels */}
      {profileOpen && <ProfilePanel onClose={() => setProfileOpen(false)} />}
    </>
  );
};
