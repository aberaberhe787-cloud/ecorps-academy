import React from "react";
import { ArrowRight, GraduationCap, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";
import { HeroGraphic } from "../HeroGraphic";

interface GuestHeroProps {
  onStartFree: () => void;
  onChoosePath: () => void;
  onSignIn: () => void;
}

export const GuestHero: React.FC<GuestHeroProps> = ({
  onStartFree,
  onChoosePath,
  onSignIn,
}) => (
  <section className="relative pt-12 sm:pt-16 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
    {/* Local hero glow */}
    <div
      className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[min(90vw,48rem)] rounded-full bg-indigo-500/15 blur-3xl"
      aria-hidden="true"
    />

    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative">
      <div className="space-y-6 sm:space-y-7 text-center lg:text-left min-w-0">
        <p className="inline-flex items-center gap-2 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold text-indigo-200 shadow-[0_0_0_1px_rgba(99,102,241,0.08)]">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-indigo-300" aria-hidden="true" />
          Corporate AI skill platform · Early access
        </p>

        <h1 className="ecorp-display text-4xl sm:text-5xl md:text-[3.25rem] text-white">
          Build measurable{" "}
          <span className="ecorp-gradient-text">prompt engineering</span>{" "}
          capability.
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
          ECORP Academy is a structured Learn → Practice → Assess loop—not a chat toy.
          Start Foundations free. Sign in when you want XP, streaks, and credentials saved.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3 pt-1">
          <Button
            size="lg"
            onClick={onStartFree}
            className="px-7 sm:px-9 shadow-lg shadow-indigo-950/50"
            icon={<ArrowRight className="h-4 w-4" />}
            iconPosition="right"
          >
            Start learning free
          </Button>
          <Button variant="outline" size="lg" onClick={onChoosePath} className="px-7 sm:px-9">
            Choose your path
          </Button>
          <Button variant="secondary" size="lg" onClick={onSignIn} className="px-7 sm:px-9">
            Sign in
          </Button>
        </div>

        <ul className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-slate-400 pt-2">
          {[
            "No account to browse",
            "Real curriculum & sandbox",
            "Sign in to save evidence",
          ].map((line) => (
            <li key={line} className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" aria-hidden="true" />
              {line}
            </li>
          ))}
        </ul>

        <div className="hidden sm:flex items-center gap-3 pt-2 text-[11px] text-slate-500 justify-center lg:justify-start">
          <GraduationCap className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <span>Designed for professionals, teams, and serious beginners</span>
        </div>
      </div>

      <div className="hidden lg:block relative min-w-0">
        <div className="absolute -inset-4 rounded-3xl bg-indigo-500/10 blur-2xl" aria-hidden="true" />
        <div className="relative ecorp-panel ecorp-panel-glow p-1 rounded-3xl overflow-hidden">
          <HeroGraphic />
        </div>
      </div>
    </div>
  </section>
);
