import React from 'react';
import { auth } from '../lib/firebase';
import { isSessionExpired, markSessionExpired } from '../lib/sessionManager';
import { LoginPage } from './LoginPage';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState(auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u && isSessionExpired()) {
        markSessionExpired();
        try {
          await auth.signOut();
        } catch {}
        setUser(null);
      } else {
        setUser(u);
      }
    });
    return unsubscribe;
  }, []);

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
};
