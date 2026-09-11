import React from "react";
import { ChevronRight, Home, BookOpen, Terminal, Grid3X3, Compass, Award, User, Target } from "lucide-react";
import { useApp } from "../context/AppContext";
import { curriculumModules } from "../data/lessonsData";
import { NavTab } from "../types";

export const Breadcrumbs: React.FC = () => {
  const { activeTab, activeLessonId, setActiveTab, setActiveLessonId } = useApp();

  // If we are not logged in, or there is no tab selected, we shouldn't show breadcrumbs
  if (!activeTab) return null;

  const handleHomeClick = () => {
    setActiveTab("home");
    if (setActiveLessonId) setActiveLessonId(null);
  };

  const handleTabClick = (tab: NavTab) => {
    setActiveTab(tab);
    if (setActiveLessonId) setActiveLessonId(null);
  };

  // Find module & lesson title for active tab 'curriculum' and activeLessonId
  let moduleTitle = "";
  let lessonTitle = "";
  if (activeTab === "curriculum" && activeLessonId) {
    for (const mod of curriculumModules) {
      const les = mod.lessons.find((l) => l.id === activeLessonId);
      if (les) {
        moduleTitle = mod.title.split(":")[1]?.trim() || mod.title;
        lessonTitle = les.title;
        break;
      }
    }
  }

  const getTabLabelAndIcon = (tab: NavTab) => {
    switch (tab) {
      case "home":
        return { label: "Home Dashboard", icon: Home };
      case "curriculum":
        return { label: "Lesson Curriculum", icon: BookOpen };
      case "foundations":
        return { label: "Foundations", icon: Target };
      case "playground":
        return { label: "Prompt Sandbox", icon: Terminal };
      case "patterns":
        return { label: "Pattern Library", icon: Grid3X3 };
      case "resources":
        return { label: "Glossary & Resources", icon: Compass };
      case "certification":
        return { label: "Certification", icon: Award };
      case "profile":
        return { label: "User Profile", icon: User };
      default:
        return { label: tab, icon: Home };
    }
  };

  const currentTabInfo = getTabLabelAndIcon(activeTab);
  const TabIcon = currentTabInfo.icon;

  return (
    <nav 
      aria-label="Breadcrumbs"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-1 sm:pb-2 flex items-center flex-wrap gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 select-none animate-in fade-in duration-150"
    >
      {/* Root - Academy */}
      <button
        onClick={handleHomeClick}
        className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Academy</span>
      </button>

      <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />

      {/* Active Tab */}
      <button
        onClick={() => handleTabClick(activeTab)}
        className={`flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400 transition-colors ${
          !activeLessonId ? "text-slate-900 dark:text-slate-100 font-semibold" : ""
        }`}
      >
        <TabIcon className="h-3.5 w-3.5 shrink-0" />
        <span>{currentTabInfo.label}</span>
      </button>

      {/* Conditional Sub-levels for active curriculum lesson */}
      {activeTab === "curriculum" && activeLessonId && (
        <>
          {moduleTitle && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <button
                onClick={() => {
                  if (setActiveLessonId) setActiveLessonId(null);
                }}
                className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors truncate max-w-[120px] sm:max-w-[200px]"
                title={moduleTitle}
              >
                {moduleTitle}
              </button>
            </>
          )}

          {lessonTitle && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[150px] sm:max-w-[250px]" title={lessonTitle}>
                {lessonTitle}
              </span>
            </>
          )}
        </>
      )}
    </nav>
  );
};
