import React, { useEffect, useState } from 'react';
import { auth, onAuthStateChanged } from '../lib/firebaseClient';
import { LoginPage } from './LoginPage';
import { Lock } from 'lucide-react';

export const RequireAuth: React.FC<{ children: React.ReactNode; message?: string }> = ({
  children,
  message = "Sign in to save your progress and unlock learner features.",
}) => {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthed(Boolean(user));
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center w-full h-64 text-sm text-slate-400 font-mono">
        Checking authentication status...
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="rounded-2xl border border-blue-500/30 bg-slate-900/90 p-6 sm:p-8 text-center space-y-3 shadow-xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Lock className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Authentication Required</h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">{message}</p>
          </div>
        </div>
        <LoginPage message={message} />
      </div>
    );
  }

  return <>{children}</>;
};
