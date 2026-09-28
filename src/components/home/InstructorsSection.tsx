import React from "react";
import { BookOpen, Cpu, Scale } from "lucide-react";

/** Curriculum focus areas — not named fictional instructors. */
const FOCUS_AREAS = [
  {
    title: "Prompt structure & clarity",
    role: "Foundations track",
    bio: "Task definition, roles, constraints, iteration loops, and delimited context for reliable model behavior.",
    icon: BookOpen,
  },
  {
    title: "Systems & evaluation",
    role: "Practice labs",
    bio: "Sandbox runs, missions, and evaluation habits so prompts are tested—not only written.",
    icon: Cpu,
  },
  {
    title: "Responsible adoption",
    role: "Team & governance",
    bio: "Measurable capability, assessment evidence, and patterns teams can standardize across workflows.",
    icon: Scale,
  },
];

export const InstructorsSection: React.FC = () => {
  return (
    <section className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">What you will work through</h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Focus areas of the ECORP Academy curriculum—not a celebrity instructor roster.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FOCUS_AREAS.map((area) => {
          const Icon = area.icon;
          return (
            <div
              key={area.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4"
            >
              <div className="h-14 w-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Icon className="h-7 w-7 text-indigo-300" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{area.title}</h3>
                <p className="text-sm text-indigo-300 font-semibold">{area.role}</p>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{area.bio}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
