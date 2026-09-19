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
import { DashboardHeader } from "./components/DashboardHeader";
import { RequireAuth } from "./components/RequireAuth";
import { NetworkStatusToast } from "./components/NetworkStatusIndicator";
import { SessionInactivityWarning } from "./components/SessionInactivityWarning";
import { GlobalShortcutsHandler } from "./components/GlobalShortcutsHandler";
import { AchievementNotificationToast } from "./components/AchievementNotificationToast";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { LearnerInactivityReminder } from "./components/LearnerInactivityReminder";
import { MobileBottomNav } from "./components/MobileBottomNav";

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  // Smooth scroll to top whenever the tab selection changes
  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [activeTab]);

  return (
    <main className="w-full max-w-full overflow-x-hidden min-w-0 relative flex-1 flex flex-col pb-16 md:pb-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(2px)" }}
          transition={{
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1], // Custom cubic bezier for smooth, snappy deceleration
          }}
          className="w-full max-w-full min-w-0 flex-1 flex flex-col"
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
    <div className="flex min-h-dvh flex-col w-full max-w-full overflow-x-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased">
      {!hideGlobalChrome && <Navbar />}
      {!hideGlobalChrome && <Breadcrumbs />}
      <MainContent />
      {!hideGlobalChrome && <MobileBottomNav />}
      {!hideGlobalChrome && <Footer />}
    </div>
  );
};

const AuthGate: React.FC = () => {
  const [user, setUser] = React.useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((nextUser: any) => {
      setUser(nextUser);
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (isAuthLoading) {
    return <div className="flex min-h-dvh items-center justify-center bg-[#050a19] text-sm text-slate-400">Loading your learning space...</div>;
  }

  return user ? <AppShell /> : <LoginPage />;
};

export default function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <AuthGate />
        <GlobalShortcutsHandler />
        <LearnerInactivityReminder />
        <NetworkStatusToast />
        <AchievementNotificationToast />
        <SessionInactivityWarning />
      </ThemeProvider>
    </AppProvider>
  );
}
