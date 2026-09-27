import React, { useEffect, useState } from 'react';
import { auth, onAuthStateChanged } from '../lib/firebaseClient';
import { LoginPage } from './LoginPage';
import { Loader2 } from 'lucide-react';

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
      <div
        className="flex flex-col items-center justify-center gap-3 w-full min-h-[12rem] py-12 text-sm text-slate-400"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" aria-hidden="true" />
        <span className="font-mono text-xs sm:text-sm">Checking authentication status...</span>
      </div>
    );
  }

  if (!authed) {
    // Single auth surface — LoginPage already includes messaging; avoid duplicate banner
    return <LoginPage message={message} />;
  }

  return <>{children}</>;
};
