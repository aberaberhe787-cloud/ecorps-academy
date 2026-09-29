import React from "react";
import { ArrowRight, GraduationCap, CheckCircle2 } from "lucide-react";
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
          ECORP Academy is a structured learning loop—not a chat toy. Start with
          Foundations free. Sign in when you want XP, streaks, and credentials saved.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-3">
          <Button
            size="lg"
            onClick={onStartFree}
            className="px-6 sm:px-8"
            icon={<ArrowRight className="h-4 w-4" />}
            iconPosition="right"
          >
            Start learning free
          </Button>
          <Button variant="outline" size="lg" onClick={onChoosePath} className="px-6 sm:px-8">
            Choose your path
          </Button>
          <Button variant="secondary" size="lg" onClick={onSignIn} className="px-6 sm:px-8">
            Sign in
          </Button>
        </div>

        <ul className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-slate-400 pt-1">
          {["No account needed to browse", "Real curriculum & sandbox", "Sign in to save evidence"].map(
            (line) => (
              <li key={line} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" aria-hidden="true" />
                {line}
              </li>
            )
          )}
        </ul>
      </div>

      <div className="hidden lg:block relative min-w-0">
        <HeroGraphic />
      </div>
    </div>
  </section>
);
