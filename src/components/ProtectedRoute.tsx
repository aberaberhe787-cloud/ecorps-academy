import React from 'react';
import { auth } from '../lib/firebase';
import { isSessionExpired, markSessionExpired } from '../lib/sessionManager';
import { LoginPage } from './LoginPage';

/**
 * Session-aware auth gate (sign-out when session expired).
 * App shell uses RequireAuth for tab-level gating; keep this helper for
 * routes/flows that must enforce session expiry before render.
 */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState(auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u && isSessionExpired()) {
        markSessionExpired();
        try {
          await auth.signOut();
        } catch {
          /* ignore sign-out errors */
        }
        setUser(null);
      } else {
        setUser(u);
      }
    });
    return unsubscribe;
  }, []);

  if (!user) {
    return <LoginPage message="Sign in to continue. Your session may have expired." />;
  }

  return <>{children}</>;
};
