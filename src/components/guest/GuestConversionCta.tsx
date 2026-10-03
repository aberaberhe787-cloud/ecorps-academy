import React from "react";
import { ArrowRight, Layers, Sparkles } from "lucide-react";
import { Button } from "../ui/Button";

interface GuestConversionCtaProps {
  onSignIn: () => void;
  onKeepBrowsing: () => void;
}

export const GuestConversionCta: React.FC<GuestConversionCtaProps> = ({
  onSignIn,
  onKeepBrowsing,
}) => (
  <section className="ecorp-panel-glow rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center space-y-5">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-400/25">
      <Sparkles className="h-6 w-6 text-indigo-300" aria-hidden="true" />
    </div>
    <h2 className="ecorp-display text-xl sm:text-2xl text-white">Ready to keep your progress?</h2>
    <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
      Sign in to save XP, streaks, competency evidence, track certificates, and assessment results.
    </p>
    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-1">
      <Button
        size="lg"
        onClick={onSignIn}
        icon={<ArrowRight className="h-4 w-4" />}
        iconPosition="right"
        className="px-8"
      >
        Sign in / Register
      </Button>
      <Button variant="outline" size="lg" onClick={onKeepBrowsing} className="px-8">
        Keep browsing free
      </Button>
    </div>
    <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
      <Layers className="h-3.5 w-3.5" aria-hidden="true" />
      Teams use the same Learn → Practice → Assess loop after individuals sign in.
    </p>
  </section>
);
