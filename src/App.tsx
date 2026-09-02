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
    <main className="flex-1 overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="h-full"
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
    const unsubscribe = auth.onAuthStateChanged(async (nextUser: any) => {
      if (nextUser) {
        try {
          // Perform silent token refresh before evaluating session expiration
          await nextUser.getIdToken(false);
          recordUserActivity();
          setUser(nextUser);
          setIsAuthLoading(false);
          setActiveTab("home");
        } catch (tokenErr) {
          console.warn('[ECORP:AUTH] Silent token refresh failed:', tokenErr);
          if (isSessionExpired()) {
            console.log('[ECORP:AUTH] Session expired on startup -> signing out');
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
          setActiveTab("home");
        }
      } else {
        setUser(null);
        setIsAuthLoading(false);
      }
    });
    return unsubscribe;
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
