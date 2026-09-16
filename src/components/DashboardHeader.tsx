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
    <header className="w-full bg-transparent" id="dashboard-header">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative h-12 flex items-center justify-between">
          {/* Daily Study Streak Counter */}
          <div className="flex items-center gap-3">
            {userProgress && (
              <div
                id="dashboard-header-streak-counter"
                title={`${userProgress.streakDays} Consecutive Days Study Streak!`}
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/30 hover:border-orange-500/50 hover:bg-orange-500/20 rounded-full px-3 py-1 text-xs font-bold text-orange-400 cursor-pointer transition select-none shadow-sm"
              >
                <Flame className="h-4 w-4 fill-orange-500 text-orange-400 animate-pulse shrink-0" />
                <span className="font-mono text-xs">{userProgress.streakDays} Day Streak</span>
              </div>
            )}
          </div>

          <div className="p-2">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded px-3 py-1.5 text-sm font-medium bg-rose-600 text-white hover:bg-rose-500"
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
