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
  <section className="rounded-2xl sm:rounded-3xl border border-indigo-500/25 bg-indigo-950/30 p-5 sm:p-8 text-center space-y-4">
    <Sparkles className="h-8 w-8 text-indigo-300 mx-auto" aria-hidden="true" />
    <h2 className="text-xl sm:text-2xl font-bold text-white">Ready to keep your progress?</h2>
    <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
      Sign in to save XP, streaks, competency evidence, track certificates, and assessment results.
    </p>
    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-1">
      <Button
        size="lg"
        onClick={onSignIn}
        icon={<ArrowRight className="h-4 w-4" />}
        iconPosition="right"
      >
        Sign in / Register
      </Button>
      <Button variant="outline" size="lg" onClick={onKeepBrowsing}>
        Keep browsing free
      </Button>
    </div>
    <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
      <Layers className="h-3.5 w-3.5" aria-hidden="true" />
      Teams can use the same loop after individuals sign in.
    </p>
  </section>
);
