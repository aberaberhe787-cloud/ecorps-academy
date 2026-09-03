import React, { useEffect, useState } from 'react';
import { auth, onAuthStateChanged } from '../lib/firebaseClient';

export const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthed(true);
      } else {
        setAuthed(false);
      }
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center w-full h-64 text-sm text-slate-400">
        Checking authentication...
      </div>
    );
  }

  if (!authed) return null;
  return <>{children}</>;
};
