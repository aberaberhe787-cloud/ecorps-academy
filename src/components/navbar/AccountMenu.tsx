import React, { useState, useRef, useEffect } from "react";
import { User, ArrowRight, KeyRound, LogOut, CheckCircle2 } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { auth } from "../../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export const AccountMenu: React.FC = () => {
  const { userProgress, setActiveTab, logout } = useApp();
  const [accountOpen, setAccountOpen] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  const level = Math.floor((userProgress?.xp || 0) / 250) + 1;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePasswordReset = async () => {
    if (!auth.currentUser?.email) {
      setResetStatus("No email associated with current session.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      setResetStatus(`Reset link dispatched to ${auth.currentUser.email}`);
    } catch (err: any) {
      setResetStatus(err?.message || "Failed to send password reset email.");
    }
  };

  return (
    <div ref={accountMenuRef} className="relative" id="account-menu-container">
      <button
        id="navbar-account-btn"
        onClick={() => {
          setAccountOpen((s) => !s);
          setResetStatus(null);
        }}
        className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center hover:opacity-90 transition-opacity border border-blue-400/40 shadow-sm cursor-pointer"
        aria-label="Open account menu"
        aria-expanded={accountOpen}
      >
        <User className="h-4 w-4 text-white" />
      </button>

      {accountOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-xl bg-slate-950 border border-slate-800 shadow-2xl z-50 p-2 text-xs animate-in fade-in duration-150"
          role="menu"
        >
          <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
            <p className="font-semibold text-white truncate text-sm">
              {auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || "Scholar"}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {auth.currentUser?.email || "Authenticated Scholar"}
            </p>
            <div className="mt-2 flex items-center justify-between text-xs font-mono text-blue-400 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800/60">
              <span>Level {level}</span>
              <span>{userProgress.xp || 0} XP</span>
            </div>
          </div>

          {resetStatus && (
            <div className="mb-2 p-2 rounded-lg bg-blue-950/60 border border-blue-800/80 text-[11px] text-blue-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-400 shrink-0" />
              <span>{resetStatus}</span>
            </div>
          )}

          <button
            className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
            onClick={() => {
              setAccountOpen(false);
              setActiveTab("profile");
            }}
          >
            <span>Academic Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
          </button>

          <button
            className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            onClick={handlePasswordReset}
          >
            <KeyRound className="h-3.5 w-3.5 text-slate-500" />
            <span>Send Password Reset</span>
          </button>

          <div className="border-t border-slate-800/80 my-1"></div>

          <button
            className="w-full text-left px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors font-medium flex items-center gap-2 cursor-pointer"
            onClick={async () => {
              setAccountOpen(false);
              try {
                await logout();
              } catch (e) {
                console.error("Logout from account menu failed", e);
              }
            }}
          >
            <LogOut className="h-3.5 w-3.5 text-rose-400" />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
};
