import React from "react";
import { ArrowRight, Terminal } from "lucide-react";
import { Button } from "../ui/Button";

interface GuestPracticeTeaserProps {
  onOpenSandbox: () => void;
}

export const GuestPracticeTeaser: React.FC<GuestPracticeTeaserProps> = ({ onOpenSandbox }) => (
  <section className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/40 p-5 sm:p-8">
    <div className="flex flex-col md:flex-row md:items-center gap-6 md:justify-between">
      <div className="space-y-2 min-w-0">
        <div className="flex items-center gap-2 text-indigo-300">
          <Terminal className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">
            Practice
          </span>
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
        onClick={onOpenSandbox}
        icon={<ArrowRight className="h-4 w-4" />}
        iconPosition="right"
      >
        Open sandbox
      </Button>
    </div>
  </section>
);
