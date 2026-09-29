import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ArrowRight,
  BookOpen,
  Terminal,
  ClipboardCheck,
  GraduationCap,
  Compass,
} from "lucide-react";
import { Button } from "./ui/Button";
import { useApp } from "../context/AppContext";

const STORAGE_KEY = "ecorp_guest_onboarding_v1";

export function hasCompletedGuestOnboarding(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "done";
  } catch {
    return true; // don't force modal if storage blocked
  }
}

export function markGuestOnboardingDone(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "done");
  } catch {
    /* ignore */
  }
}

type StepId = "welcome" | "loop" | "start";

const STEPS: {
  id: StepId;
  title: string;
  body: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: "welcome",
    title: "Welcome to ECORP Academy",
    body: "A structured platform to learn prompt engineering, practice in the sandbox, and measure skill. You can browse free as a guest—sign in later to save XP and credentials.",
    icon: GraduationCap,
  },
  {
    id: "loop",
    title: "How learning works here",
    body: "Learn structured lessons → Practice in Sandbox, Missions, or CTF → Assess when ready → Progress shows on your profile after you sign in.",
    icon: Compass,
  },
  {
    id: "start",
    title: "Start with Foundations",
    body: "Lesson 1 teaches clarity and specificity—the habit behind every reliable prompt. Takes a few minutes. No account required.",
    icon: BookOpen,
  },
];

interface GuestOnboardingProps {
  open: boolean;
  onClose: () => void;
}

export const GuestOnboarding: React.FC<GuestOnboardingProps> = ({ open, onClose }) => {
  const { setActiveTab, setActiveLessonId } = useApp();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  const finish = (navigate?: "foundations" | "curriculum" | "playground") => {
    markGuestOnboardingDone();
    onClose();
    if (navigate === "foundations") {
      setActiveLessonId("foundation-clarity");
      setActiveTab("foundations");
    } else if (navigate === "curriculum") {
      setActiveTab("curriculum");
    } else if (navigate === "playground") {
      setActiveTab("playground");
    }
  };

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-onboarding-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl p-5 sm:p-7 relative max-h-[90dvh] overflow-y-auto"
          >
            <button
              type="button"
              onClick={() => finish()}
              className="absolute top-3 right-3 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Skip onboarding"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-5 pt-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-300">
                <Icon className="h-7 w-7" aria-hidden="true" />
              </div>

              <div className="space-y-2 px-1">
                <p className="text-[11px] font-mono uppercase tracking-wider text-indigo-300/90">
                  Guest onboarding · {step + 1}/{STEPS.length}
                </p>
                <h2 id="guest-onboarding-title" className="text-xl sm:text-2xl font-bold text-white">
                  {current.title}
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
                  {current.body}
                </p>
              </div>

              {current.id === "loop" && (
                <div className="grid grid-cols-3 gap-2 w-full text-left">
                  {[
                    { icon: BookOpen, label: "Learn", hint: "Lessons" },
                    { icon: Terminal, label: "Practice", hint: "Sandbox" },
                    { icon: ClipboardCheck, label: "Assess", hint: "Sign in" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1"
                    >
                      <item.icon className="h-4 w-4 text-indigo-300" aria-hidden="true" />
                      <p className="text-xs font-bold text-white">{item.label}</p>
                      <p className="text-[10px] text-slate-500">{item.hint}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                <div className="flex justify-center sm:justify-start gap-1.5" aria-hidden="true">
                  {STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === step ? "w-6 bg-indigo-500" : "w-1.5 bg-slate-700"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 w-full sm:w-auto">
                  {step > 0 && (
                    <Button variant="ghost" onClick={() => setStep((s) => s - 1)} className="border border-slate-800">
                      Back
                    </Button>
                  )}
                  {!isLast ? (
                    <Button
                      onClick={() => setStep((s) => s + 1)}
                      icon={<ArrowRight className="h-4 w-4" />}
                      iconPosition="right"
                    >
                      Next
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => finish("playground")}>
                        Try sandbox
                      </Button>
                      <Button
                        onClick={() => finish("foundations")}
                        icon={<ArrowRight className="h-4 w-4" />}
                        iconPosition="right"
                      >
                        Start first lesson
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => finish()}
                className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Skip for now — explore the landing page
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
