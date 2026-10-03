import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { LearningRouteDiagnostic } from "../components/LearningRouteDiagnostic";
import { CredibilityStrip } from "../components/CredibilityStrip";
import { TestimonialsCarousel } from "../components/TestimonialsCarousel";
import { InstructorsSection } from "../components/home/InstructorsSection";
import {
  GuestOnboarding,
  hasCompletedGuestOnboarding,
} from "../components/GuestOnboarding";
import {
  GuestRibbon,
  GuestHero,
  GuestStartHere,
  GuestHowItWorks,
  GuestTracks,
  GuestPracticeTeaser,
  GuestConversionCta,
  type GuestLearnTab,
  type GuestNavTab,
} from "../components/guest";

/**
 * First-visit / guest landing composed from modular guest components.
 */
export const GuestLandingView: React.FC = () => {
  const { setActiveTab, setActiveLessonId, openAuthModal } = useApp();
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!hasCompletedGuestOnboarding()) {
      const t = window.setTimeout(() => setShowOnboarding(true), 400);
      return () => window.clearTimeout(t);
    }
  }, []);

  const openLearningPath = (tab: GuestLearnTab, lessonId?: string) => {
    if (lessonId) setActiveLessonId(lessonId);
    setActiveTab(tab);
  };

  const openTab = (tab: GuestNavTab, _requiresAuth?: boolean) => {
    // Guests can visit every nav surface; submit/save still prompts sign-in inside those views.
    setActiveTab(tab);
  };

  const startFoundations = () => openLearningPath("foundations", "foundation-clarity");

  return (
    <div className="w-full max-w-full overflow-x-hidden text-slate-100">
      <GuestRibbon
        onSignIn={() =>
          openAuthModal("Create an account to save XP, progress, and certificates.")
        }
        onHowItWorks={() => setShowOnboarding(true)}
      />

      <GuestHero
        onStartFree={startFoundations}
        onChoosePath={() => setShowDiagnostic(true)}
        onSignIn={() => openAuthModal("Sign in to save progress and unlock assessment.")}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 space-y-14 sm:space-y-16">
        <CredibilityStrip />

        <GuestStartHere
          onOpenFirstLesson={startFoundations}
          onOpenCurriculum={() => openTab("curriculum")}
        />

        <GuestHowItWorks onOpenTab={openTab} />

        <GuestTracks onOpenTrack={openLearningPath} />

        <GuestPracticeTeaser onOpenSandbox={() => openTab("playground")} />

        <TestimonialsCarousel />
        <InstructorsSection />

        <GuestConversionCta
          onSignIn={() =>
            openAuthModal("Create an account or sign in to save your learning progress.")
          }
          onKeepBrowsing={startFoundations}
        />
      </div>

      <GuestOnboarding open={showOnboarding} onClose={() => setShowOnboarding(false)} />

      {showDiagnostic && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
          onClick={() => setShowDiagnostic(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Choose your learning path"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-lg w-full relative shadow-2xl border border-indigo-500/20 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowDiagnostic(false)}
              className="absolute top-3 right-3 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <LearningRouteDiagnostic />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
