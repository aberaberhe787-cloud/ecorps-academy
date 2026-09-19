/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, X } from "lucide-react";
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
          {activeTab === "curriculum" && <CurriculumView />}
          {activeTab === "foundations" && <PromptEngineeringPath />}
          {activeTab === "playground" && <PlaygroundView />}
          {activeTab === "patterns" && <PatternLibraryView />}
          {activeTab === "resources" && <ResourcesView />}
          {activeTab === "certification" && <RequireAuth><AssessmentView /></RequireAuth>}
          {activeTab === "profile" && <RequireAuth><UserProfileView /></RequireAuth>}
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

const AppShell: React.FC = () => {
  const { activeTab, activeLessonId, isDistractionFreeMode, isAuthModalOpen, authModalMessage, closeAuthModal } = useApp();
  const hideGlobalChrome =
    isDistractionFreeMode && activeTab === "curriculum" && !!activeLessonId;

  return (
    <div className="flex min-h-dvh flex-col w-full max-w-full overflow-x-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-blue-600 selection:text-white font-sans antialiased">
      {!hideGlobalChrome && <Navbar />}
      {!hideGlobalChrome && <Breadcrumbs />}
      <MainContent />
      {!hideGlobalChrome && <MobileBottomNav />}
      {!hideGlobalChrome && <Footer />}

      {/* Global Auth Modal for Guest Action Prompts */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4 my-8"
            >
              <button
                onClick={closeAuthModal}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 pr-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Authentication Required</h3>
                  <p className="text-xs text-slate-400">
                    {authModalMessage || "Sign in to save your progress and unlock learner features."}
                  </p>
                </div>
              </div>

              <LoginPage message={authModalMessage} onSuccess={closeAuthModal} isModal />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AuthGate: React.FC = () => {
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      setIsAuthLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (isAuthLoading) {
    return <div className="flex min-h-dvh items-center justify-center bg-[#050a19] text-sm text-slate-400">Loading your learning space...</div>;
  }

  return <AppShell />;
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
