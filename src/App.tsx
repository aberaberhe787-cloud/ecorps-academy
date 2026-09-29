/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { viewEnter, viewEnterReduced, modalPanel, modalPanelReduced, modalBackdrop } from "./lib/motionPresets";
import { Lock, X } from "lucide-react";
import { AppProvider, useApp } from "./context/AppContext";
import { ThemeProvider } from "./components/ThemeProvider";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomeView } from "./views/HomeView";
import { LearningHubView } from "./views/LearningHubView";
import { PlaygroundView } from "./views/PlaygroundView";
import { PatternLibraryView } from "./views/PatternLibraryView";
import { ResourcesView } from "./views/ResourcesView";
import { UserProfileView } from "./views/UserProfileView";
import { AssessmentView } from "./views/AssessmentView";
import { LoginPage } from "./components/LoginPage";
import { LoadingOverlay } from "./components/LoadingOverlay";
import { auth } from "./lib/firebase";
import { DashboardHeader } from "./components/DashboardHeader";
import { NetworkStatusToast } from "./components/NetworkStatusIndicator";
import { SessionInactivityWarning } from "./components/SessionInactivityWarning";
import { GlobalShortcutsHandler } from "./components/GlobalShortcutsHandler";
import { AchievementNotificationToast } from "./components/AchievementNotificationToast";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { SectionModeBanner } from "./components/SectionModeBanner";
import { LearnerInactivityReminder } from "./components/LearnerInactivityReminder";
import { MobileBottomNav } from "./components/MobileBottomNav";

const MainContent: React.FC = () => {
  const { activeTab } = useApp();
  const reduceMotion = useReducedMotion();
  const viewMotion = reduceMotion ? viewEnterReduced : viewEnter;

  // Smooth scroll to top whenever the tab selection changes
  React.useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [activeTab, reduceMotion]);

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="w-full max-w-full overflow-x-hidden min-w-0 relative flex-1 flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={viewMotion.initial}
          animate={viewMotion.animate}
          exit={viewMotion.exit}
          transition={viewMotion.transition}
          className="w-full max-w-full min-w-0 flex-1 flex flex-col"
        >
          {activeTab === "home" && <HomeView />}
          {(activeTab === "curriculum" || activeTab === "foundations") && <LearningHubView />}
          
          {activeTab === "playground" && <PlaygroundView />}
          {activeTab === "patterns" && <PatternLibraryView />}
          {activeTab === "resources" && <ResourcesView />}
          {activeTab === "certification" && <AssessmentView />}
          {activeTab === "profile" && (
            <>
              <DashboardHeader />
              <UserProfileView />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
};

const AppShell: React.FC = () => {
  const { activeTab, activeLessonId, isDistractionFreeMode, isAuthModalOpen, authModalMessage, closeAuthModal, redirectPath } = useApp();
  const reduceMotion = useReducedMotion();
  const panelMotion = reduceMotion ? modalPanelReduced : modalPanel;
  const hideGlobalChrome =
    isDistractionFreeMode && (activeTab === "curriculum" || activeTab === "foundations") && !!activeLessonId;

  return (
    <div className="flex min-h-dvh flex-col w-full max-w-full overflow-x-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-indigo-600 selection:text-white font-sans antialiased supports-[padding:max(0px)]:pb-0">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>
      {!hideGlobalChrome && <Navbar />}
      {!hideGlobalChrome && <Breadcrumbs />}
      {!hideGlobalChrome && <SectionModeBanner />}
      <MainContent />
      {!hideGlobalChrome && <MobileBottomNav />}
      {!hideGlobalChrome && <Footer />}

      {/* Global Auth Modal for Guest Action Prompts */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
            initial={modalBackdrop.initial}
            animate={modalBackdrop.animate}
            exit={modalBackdrop.exit}
            transition={modalBackdrop.transition}
          >
            <motion.div
              initial={panelMotion.initial}
              animate={panelMotion.animate}
              exit={panelMotion.exit}
              transition={panelMotion.transition}
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-modal-title"
              className="relative w-full max-w-md sm:max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-5 sm:p-6 shadow-2xl space-y-4 my-8 max-h-[min(92dvh,900px)] overflow-y-auto"
            >
              <button
                onClick={closeAuthModal}
                className="absolute top-3 right-3 z-10 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3 pr-10">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 shrink-0">
                  <Lock className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 id="auth-modal-title" className="text-lg font-bold text-white">
                    Authentication Required
                  </h3>
                  <p className="text-xs text-slate-400 leading-snug">
                    {authModalMessage || "Sign in to save your progress and unlock learner features."}
                  </p>
                </div>
              </div>

              <LoginPage onSuccess={closeAuthModal} isModal redirectPath={redirectPath} />
            </motion.div>
          </motion.div>
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
    return <LoadingOverlay />;
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
