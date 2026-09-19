import React, { useEffect } from 'react';
import { Flame } from 'lucide-react';
import { auth, onAuthStateChanged, signOut } from '../lib/firebaseClient';
import { useApp } from '../context/AppContext';

const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export const DashboardHeader: React.FC = () => {
  const { userProgress, setActiveTab } = useApp();

  useEffect(() => {
    // Listen for auth state changes and redirect to /login when signed out
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) redirectToLogin();
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error('signOut failed', e);
    } finally {
      redirectToLogin();
    }
  };

  return (
    <header className="w-full bg-transparent overflow-hidden" id="dashboard-header">
      <div className="w-full max-w-[calc(100vw-1.5rem)] sm:max-w-7xl 2xl:max-w-[1536px] mx-auto px-2 sm:px-6 lg:px-8">
        <div className="relative min-h-[48px] py-1.5 flex flex-wrap items-center justify-between gap-2 w-full">
          {/* Daily Study Streak Counter */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
            {userProgress && (
              <div
                id="dashboard-header-streak-counter"
                title={`${userProgress.streakDays} Consecutive Days Study Streak!`}
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/20 rounded-full px-2.5 sm:px-3 py-1 text-xs font-bold text-orange-400 cursor-pointer transition select-none shadow-sm shrink-0"
              >
                <Flame className="h-4 w-4 fill-orange-500 text-orange-400 animate-pulse shrink-0" />
                <span className="font-mono text-xs">{userProgress.streakDays} Day Streak</span>
              </div>
            )}
          </div>

          <div className="py-1 flex items-center shrink-0">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-sm active:scale-95"
              aria-label="Log out"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
