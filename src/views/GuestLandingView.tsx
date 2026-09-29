import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Terminal,
  ArrowRight,
  ClipboardCheck,
  User,
  X,
  GraduationCap,
  Layers,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { staggerContainer, staggerItem, staggerItemReduced } from "../lib/motionPresets";
import { useApp } from "../context/AppContext";
import { LearningRouteDiagnostic } from "../components/LearningRouteDiagnostic";
import { CredibilityStrip } from "../components/CredibilityStrip";
import { TestimonialsCarousel } from "../components/TestimonialsCarousel";
import { HeroGraphic } from "../components/HeroGraphic";
import { InstructorsSection } from "../components/home/InstructorsSection";
import { Button } from "../components/ui/Button";
import {
  GuestOnboarding,
  hasCompletedGuestOnboarding,
} from "../components/GuestOnboarding";

const TRACKS = [
  {
    title: "Prompt Engineering Foundations",
    learner: "New learners",
    duration: "2 hours",
    outcome: "Safe, structured prompt habits",
    level: "Beginner",
    tab: "foundations" as const,
    lessonId: "foundation-clarity",
  },
  {
    title: "AI Productivity for Professionals",
    learner: "Practitioners",
    duration: "4 hours",
    outcome: "Automated work workflows",
    level: "Intermediate",
    tab: "curriculum" as const,
    lessonId: "m1-l1",
  },
  {
    title: "AI Systems and Evaluation",
    learner: "Advanced",
    duration: "6 hours",
    outcome: "Evaluated agent systems",
    level: "Advanced",
    tab: "curriculum" as const,
    lessonId: "m2-l1",
  },
  {
    title: "AI Adoption for Teams",
    learner: "Leaders",
    duration: "4 hours",
    outcome: "Governance & deployment plans",
    level: "Strategic",
    tab: "curriculum" as const,
    lessonId: "m3-l1",
  },
];

const LOOP_STEPS = [
  {
    step: "01",
    title: "Learn",
    detail: "Curriculum and foundations with explicit tasks, constraints, and checks.",
    icon: BookOpen,
    action: "Browse curriculum",
    tab: "curriculum" as const,
  },
  {
    step: "02",
    title: "Practice",
    detail: "Sandbox, missions, and CTF labs to test prompts under real constraints.",
    icon: Terminal,
    action: "Open sandbox",
    tab: "playground" as const,
  },
  {
    step: "03",
    title: "Assess",
    detail: "Capstone-style evaluation to verify skill—not just completion.",
    icon: ClipboardCheck,
    action: "Sign in to assess",
    tab: "certification" as const,
    requiresAuth: true,
  },
  {
    step: "04",
    title: "Progress",
    detail: "XP, streaks, and competency evidence on your profile after you sign in.",
    icon: User,
    action: "Sign in to track",
    tab: "profile" as const,
    requiresAuth: true,
  },
];

/**
 * Dedicated first-visit / guest landing — browse free, convert to save progress.
 */
export const GuestLandingView: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const itemMotion = reduceMotion ? staggerItemReduced : staggerItem;
  const { setActiveTab, setActiveLessonId, openAuthModal } = useApp();
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // First-visit guest onboarding (once per browser)
  useEffect(() => {
    if (!hasCompletedGuestOnboarding()) {
      const t = window.setTimeout(() => setShowOnboarding(true), 400);
      return () => window.clearTimeout(t);
    }
  }, []);

  const openLearningPath = (tab: "curriculum" | "foundations", lessonId?: string) => {
    if (lessonId) setActiveLessonId(lessonId);
    setActiveTab(tab);
  };

  const openTab = (tab: "curriculum" | "foundations" | "playground" | "certification" | "profile" | "resources", requiresAuth?: boolean) => {
    if (requiresAuth || tab === "certification" || tab === "profile") {
      openAuthModal(
        tab === "certification"
          ? "Sign in to take the assessment and save credentials."
          : tab === "profile"
            ? "Sign in to view your profile and progress."
            : "Sign in to continue."
      );
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden bg-slate-950 text-slate-100">
      {/* Guest ribbon */}
      <div className="border-b border-indigo-500/20 bg-indigo-950/40 px-4 py-2 text-center">
        <p className="text-xs sm:text-sm text-slate-300">
          <span className="font-semibold text-indigo-200">Guest mode</span>
          {" — "}
          browse curriculum and practice free.{" "}
          <button
            type="button"
            onClick={() => openAuthModal("Create an account to save XP, progress, and certificates.")}
            className="text-indigo-300 font-semibold hover:text-indigo-200 underline-offset-2 hover:underline cursor-pointer"
          >
            Sign in to save progress
          </button>
          {" · "}
          <button
            type="button"
            onClick={() => setShowOnboarding(true)}
            className="text-slate-400 hover:text-slate-200 underline-offset-2 hover:underline cursor-pointer"
          >
            How it works
          </button>
        </p>
      </div>

      {/* Hero */}
      <section className="relative pt-10 sm:pt-14 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div className="space-y-5 sm:space-y-6 text-center lg:text-left min-w-0">
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] sm:text-xs font-semibold text-indigo-200">
              <GraduationCap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Corporate AI skill platform · Early access
            </p>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.15]">
              Learn, practice, and measure{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-indigo-200 to-violet-300 bg-clip-text text-transparent">
                prompt engineering
              </span>{" "}
              skill.
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              ECORP Academy is a structured learning loop—not a chat toy.
              Start with Foundations free. Sign in when you want XP, streaks, and credentials saved.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3">
              <Button
                size="lg"
                onClick={() => openLearningPath("foundations", "foundation-clarity")}
                className="px-6 sm:px-8"
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
              >
                Start learning free
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowDiagnostic(true)}
                className="px-6 sm:px-8"
              >
                Choose your path
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => openAuthModal("Sign in to save progress and unlock assessment.")}
                className="px-6 sm:px-8"
              >
                Sign in
              </Button>
            </div>

            <ul className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-slate-400 pt-1">
              {["No account needed to browse", "Real curriculum & sandbox", "Sign in to save evidence"].map((line) => (
                <li key={line} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:block relative min-w-0">
            <HeroGraphic />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 space-y-14 sm:space-y-16">
        <CredibilityStrip />

        {/* Start here */}
        <section className="rounded-2xl sm:rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-950 p-5 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 min-w-0">
              <p className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 font-semibold">
                Start here · no sign-in required
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Foundations · Lesson 1 — Clarity &amp; specificity
              </h2>
              <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                Replace vague goals with an explicit task, audience, and success criteria.
                The recommended first step for every new learner.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Button
                size="lg"
                onClick={() => openLearningPath("foundations", "foundation-clarity")}
                icon={<ArrowRight className="h-4 w-4" />}
                iconPosition="right"
              >
                Open first lesson
              </Button>
              <Button variant="outline" size="lg" onClick={() => openTab("curriculum")}>
                Full curriculum
              </Button>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-6">
          <div className="text-center space-y-2 px-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">How ECORP Academy works</h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Learn → Practice → Assess → Progress. Guests can learn and practice; sign in to assess and save.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.15 }}
          >
            {LOOP_STEPS.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.step}
                  variants={itemMotion}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col gap-3 min-w-0"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-indigo-300/80">{item.step}</span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed flex-1">{item.detail}</p>
                  <button
                    type="button"
                    onClick={() => openTab(item.tab, item.requiresAuth)}
                    className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1 cursor-pointer mt-1"
                  >
                    {item.action}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* Tracks */}
        <section className="space-y-6">
          <div className="text-center space-y-2 px-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Outcome-led tracks</h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto">
              Open any track as a guest. Sign in later to keep completion and XP.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.15 }}
          >
            {TRACKS.map((track) => (
              <motion.div
                key={track.title}
                variants={itemMotion}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6 space-y-4 hover:border-indigo-500/30 transition-colors flex flex-col justify-between min-w-0"
              >
                <div className="space-y-3">
                  <span className="inline-flex text-[10px] font-mono font-semibold uppercase tracking-wide text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                    {track.level}
                  </span>
                  <h3 className="font-bold text-white text-sm sm:text-base leading-snug">{track.title}</h3>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>For: {track.learner}</li>
                    <li>About: {track.duration}</li>
                    <li>Outcome: {track.outcome}</li>
                  </ul>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full border border-slate-800"
                  onClick={() => openLearningPath(track.tab, track.lessonId)}
                  icon={<ArrowRight className="h-3.5 w-3.5" />}
                  iconPosition="right"
                >
                  Open track
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Practice */}
        <section className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/40 p-5 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:justify-between">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2 text-indigo-300">
                <Terminal className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Practice</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Try the sandbox as a guest</h2>
              <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                Run prompts and explore labs. Mission XP and saved artifacts require an account.
              </p>
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="shrink-0"
              onClick={() => openTab("playground")}
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
            >
              Open sandbox
            </Button>
          </div>
        </section>

        <TestimonialsCarousel />
        <InstructorsSection />

        {/* Conversion footer */}
        <section className="rounded-2xl sm:rounded-3xl border border-indigo-500/25 bg-indigo-950/30 p-5 sm:p-8 text-center space-y-4">
          <Sparkles className="h-8 w-8 text-indigo-300 mx-auto" aria-hidden="true" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">Ready to keep your progress?</h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Sign in to save XP, streaks, competency evidence, track certificates, and assessment results.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-1">
            <Button
              size="lg"
              onClick={() => openAuthModal("Create an account or sign in to save your learning progress.")}
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
            >
              Sign in / Register
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => openLearningPath("foundations", "foundation-clarity")}
            >
              Keep browsing free
            </Button>
          </div>
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            Teams can use the same loop after individuals sign in.
          </p>
        </section>
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
