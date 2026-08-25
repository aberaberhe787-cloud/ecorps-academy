import React, { useEffect } from 'react';
import { auth, onAuthStateChanged, signOut } from '../lib/firebaseClient';

const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

export const DashboardHeader: React.FC = () => {
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
    <header className="w-full bg-transparent">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative h-12 flex items-center">
          {/* Spacer for left side */}
          <div className="flex-1" />
          <div className="absolute right-0 top-0 p-2">
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
