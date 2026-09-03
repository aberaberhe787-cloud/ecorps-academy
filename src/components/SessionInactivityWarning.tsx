import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  isSessionInWarning,
  isSessionExpired,
  getRemainingSessionMs,
  recordUserActivity,
  markSessionExpired,
} from '../lib/sessionManager';
import { auth } from '../lib/firebaseClient';
import { Clock, ShieldAlert, LogOut } from 'lucide-react';

export const SessionInactivityWarning: React.FC = () => {
  const { logout } = useApp();
  const [inWarning, setInWarning] = useState<boolean>(false);
  const [remainingSec, setRemainingSec] = useState<number>(300);

  useEffect(() => {
    const checkTimer = () => {
      // Only check if user is signed in
      if (!auth.currentUser) {
        if (inWarning) setInWarning(false);
        return;
      }

      if (isSessionExpired()) {
        markSessionExpired();
        void logout();
        return;
      }

      if (isSessionInWarning()) {
        setInWarning(true);
        const ms = getRemainingSessionMs();
        setRemainingSec(Math.max(0, Math.floor(ms / 1000)));
      } else {
        setInWarning(false);
      }
    };

    // Check every 2 seconds
    const interval = window.setInterval(checkTimer, 2000);
    checkTimer();

    return () => {
      window.clearInterval(interval);
    };
  }, [logout, inWarning]);

  if (!inWarning) return null;

  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const handleContinue = () => {
    recordUserActivity(true);
    setInWarning(false);
  };

  const handleSignOut = () => {
    void logout();
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="inactivity-warning-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 text-slate-100">
        <div className="flex items-center gap-3 text-amber-400 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 id="inactivity-warning-title" className="font-mono font-bold text-lg text-white">
              Session Inactivity Warning
            </h3>
            <p className="text-xs text-amber-300/80 font-sans">
              25 minutes of inactivity detected
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-5 leading-relaxed">
          For your account security, your Ecorp Academy session will expire in{' '}
          <span className="font-mono font-bold text-amber-400 inline-flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
            <Clock className="w-3.5 h-3.5 inline" /> {timeFormatted}
          </span>{' '}
          unless you confirm you are still active.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 text-xs font-mono rounded-lg border border-slate-700 bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="flex items-center gap-2 px-5 py-2 text-xs font-mono font-bold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 transition"
          >
            Keep Session Active
          </button>
        </div>
      </div>
    </div>
  );
};
