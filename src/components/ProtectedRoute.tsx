import React from 'react';
import { auth } from '../lib/firebase';
import { LoginPage } from './LoginPage';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState(auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return unsubscribe;
  }, []);

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
};
