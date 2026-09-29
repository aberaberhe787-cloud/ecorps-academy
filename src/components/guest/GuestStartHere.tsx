import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

interface GuestStartHereProps {
  onOpenFirstLesson: () => void;
  onOpenCurriculum: () => void;
}

export const GuestStartHere: React.FC<GuestStartHereProps> = ({
  onOpenFirstLesson,
  onOpenCurriculum,
}) => (
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
          Replace vague goals with an explicit task, audience, and success criteria. The
          recommended first step for every new learner.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
        <Button
          size="lg"
          onClick={onOpenFirstLesson}
          icon={<ArrowRight className="h-4 w-4" />}
          iconPosition="right"
        >
          Open first lesson
        </Button>
        <Button variant="outline" size="lg" onClick={onOpenCurriculum}>
          Full curriculum
        </Button>
      </div>
    </div>
  </section>
);
