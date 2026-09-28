import React from "react";
import { Target } from "lucide-react";

/**
 * Illustrative outcome scenarios for the product narrative.
 * Not attributed to real individuals or companies.
 */
const OUTCOMES = [
  {
    title: "Structured requirements",
    role: "Product & ops workflows",
    feedback:
      "Replace vague asks with explicit task, audience, constraints, and success criteria before generation.",
  },
  {
    title: "Automation-ready prompts",
    role: "Engineering workflows",
    feedback:
      "Use delimited context, schemas, and verification loops so outputs fit pipelines—not one-off chat replies.",
  },
  {
    title: "Failure analysis habit",
    role: "Quality & evaluation",
    feedback:
      "Diagnose prompt failures by dimension (task, context, format, edge cases) instead of endless rewrites.",
  },
  {
    title: "Team adoption pattern",
    role: "Leaders & enablement",
    feedback:
      "Standardize patterns and assessment so AI use is measurable across roles—not ad-hoc individual experiments.",
  },
];

export const TestimonialsCarousel: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-slate-900/30 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Outcomes this curriculum is built for
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Illustrative capability targets—not individual endorsements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {OUTCOMES.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5 space-y-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                <Target className="h-4 w-4" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-white text-sm">{item.title}</h3>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-300/90">
                {item.role}
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">{item.feedback}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
