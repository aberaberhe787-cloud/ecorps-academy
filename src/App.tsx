/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
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
import { LoginPage } from "./components/LoginPage";
import { auth } from "./lib/firebase";
import { DashboardHeader } from "./components/DashboardHeader";
import { RequireAuth } from "./components/RequireAuth";

const MainContent: React.FC = () => {
  const { activeTab, userProgress } = useApp();
  const profilePath = {
    id: "prompt-engineering-foundations",
    title: "Prompt Engineering Foundations",
    lessons: FOUNDATION_LESSONS.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      completed: userProgress.completedLessons.includes(lesson.id),
    })),
  };

  return (
    <main className="flex-1">
      {activeTab === "home" && <HomeView />}
      {activeTab === "curriculum" && <RequireAuth><CurriculumView /></RequireAuth>}
      {activeTab === "foundations" && <RequireAuth><PromptEngineeringPath /></RequireAuth>}
      {activeTab === "playground" && <RequireAuth><PlaygroundView /></RequireAuth>}
      {activeTab === "patterns" && <RequireAuth><PatternLibraryView /></RequireAuth>}
      {activeTab === "resources" && <RequireAuth><ResourcesView /></RequireAuth>}
      {activeTab === "profile" && <RequireAuth><UserProfileView path={profilePath} /></RequireAuth>}
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
  const [user, setUser] = React.useState(auth.currentUser);
  const [isAuthLoading, setIsAuthLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((nextUser) => {
      setUser(nextUser);
      setIsAuthLoading(false);
      if (nextUser) {
        setActiveTab("home");
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
