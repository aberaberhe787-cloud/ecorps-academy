/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppProvider, useApp } from "./context/AppContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomeView } from "./views/HomeView";
import { CurriculumView } from "./views/CurriculumView";
import { PlaygroundView } from "./views/PlaygroundView";
import { PatternLibraryView } from "./views/PatternLibraryView";
import { ResourcesView } from "./views/ResourcesView";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserProfileView } from "./views/UserProfileView";
import { PromptEngineeringPath, FOUNDATION_LESSONS } from "./views/PromptEngineeringPath";
import { AssessmentView } from "./views/AssessmentView";
import { LoginPage } from "./components/LoginPage";
import { auth } from "./lib/firebase";
import { isSessionExpired, markSessionExpired, recordUserActivity } from "./lib/sessionManager";
import { DashboardHeader } from "./components/DashboardHeader";
import { RequireAuth } from "./components/RequireAuth";

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="w-full relative flex-1 flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="w-full flex-1 flex flex-col"
        >
          {activeTab === "home" && <HomeView />}
          {activeTab === "curriculum" && <RequireAuth><CurriculumView /></RequireAuth>}
          {activeTab === "foundations" && <RequireAuth><PromptEngineeringPath /></RequireAuth>}
          {activeTab === "playground" && <RequireAuth><PlaygroundView /></RequireAuth>}
          {activeTab === "patterns" && <RequireAuth><PatternLibraryView /></RequireAuth>}
          {activeTab === "resources" && <RequireAuth><ResourcesView /></RequireAuth>}
          {activeTab === "certification" && <RequireAuth><AssessmentView /></RequireAuth>}
          {activeTab === "profile" && <RequireAuth><UserProfileView /></RequireAuth>}
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

const AppShell: React.FC = () => {
  const { activeTab, activeLessonId, isDistractionFreeMode } = useApp();
  const hideGlobalChrome =
    isDistractionFreeMode && activeTab === "curriculum" && !!activeLessonId;

  return (
    <div className="flex min-h-screen flex-col w-full overflow-x-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased">
      {!hideGlobalChrome && <Navbar />}
      <MainContent />
      {!hideGlobalChrome && <Footer />}
    </div>
  );
};

const AuthGate: React.FC = () => {
  const { setActiveTab } = useApp();
  const [user, setUser] = React.useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);

  React.useEffect(() => {
    // Dedicated session expiration enforcement handler
    const enforceSessionExpiration = async () => {
      if (auth.currentUser && isSessionExpired()) {
        console.log('[ECORP:AUTH] Inactivity timeout detected -> signing out');
        markSessionExpired();
        try {
          await auth.signOut();
        } catch (signOutErr) {
          console.warn('[ECORP:AUTH] SignOut failed', signOutErr);
        }
        setUser(null);
        setIsAuthLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (nextUser: any) => {
      if (nextUser) {
        // CRITICAL: Check session expiration FIRST before accepting auth state
        if (isSessionExpired()) {
          console.log('[ECORP:AUTH] Session expired on startup / resume -> signing out');
          markSessionExpired();
          try {
            await auth.signOut();
          } catch (signOutErr) {
            console.warn('[ECORP:AUTH] SignOut failed', signOutErr);
          }
          setUser(null);
          setIsAuthLoading(false);
          return;
        }

        try {
          // Perform silent token refresh only after verifying session is valid
          await nextUser.getIdToken(false);
          recordUserActivity();
          setUser(nextUser);
          setIsAuthLoading(false);
        } catch (tokenErr) {
          console.warn('[ECORP:AUTH] Silent token refresh failed:', tokenErr);
          if (isSessionExpired()) {
            markSessionExpired();
            try {
              await auth.signOut();
            } catch {}
            setUser(null);
            setIsAuthLoading(false);
            return;
          }
          setUser(nextUser);
          setIsAuthLoading(false);
        }
      } else {
        setUser(null);
        setIsAuthLoading(false);
      }
    });

    // Handle mobile phone lock/unlock, tab visibility changes, and bfcache restores
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        enforceSessionExpiration();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pageshow', enforceSessionExpiration);
    window.addEventListener('focus', enforceSessionExpiration);
    const interval = window.setInterval(enforceSessionExpiration, 15000);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pageshow', enforceSessionExpiration);
      window.removeEventListener('focus', enforceSessionExpiration);
      window.clearInterval(interval);
    };
  }, [setActiveTab]);

  if (isAuthLoading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#050a19] text-sm text-slate-400">Loading your learning space...</div>;
  }

  return user ? <AppShell /> : <LoginPage />;
};

export default function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <AuthGate />
      </ThemeProvider>
    </AppProvider>
  );
}
