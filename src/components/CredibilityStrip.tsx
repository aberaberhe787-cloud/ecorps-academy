import React from "react";
import { BookOpen, Terminal, ShieldCheck, ClipboardCheck } from "lucide-react";

/** Honest product signals — no fabricated enrollment metrics. */
export const CredibilityStrip: React.FC = () => {
  const metrics = [
    { icon: BookOpen, label: "Curriculum modules", value: "4" },
    { icon: Terminal, label: "Practice surfaces", value: "Sandbox · Missions · CTF" },
    { icon: ClipboardCheck, label: "Assessment path", value: "Capstone + quizzes" },
  ];

  return (
    <section className="py-8 bg-slate-950/50 border border-slate-800 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10 w-full md:w-auto">
            {metrics.map((metric) => (
              <div key={metric.label} className="flex flex-col items-center gap-1 text-center">
                <metric.icon className="h-6 w-6 text-indigo-400 mb-1" aria-hidden="true" />
                <span className="text-sm sm:text-base font-bold text-white leading-snug">{metric.value}</span>
                <span className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider font-semibold">
                  {metric.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 shrink-0">
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" aria-hidden="true" />
            <span className="text-xs font-semibold text-slate-300">
              <span className="text-emerald-500 font-bold">Early access:</span> structured pilot curriculum
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
