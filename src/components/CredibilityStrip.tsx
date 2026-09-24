import React from "react";
import { Users, GraduationCap, BarChart3, ShieldCheck } from "lucide-react";
import * as motion from "motion/react";

export const CredibilityStrip: React.FC = () => {
  const metrics = [
    { icon: Users, label: "Active Learners", value: "1,240+" },
    { icon: GraduationCap, label: "Certifications", value: "850+" },
    { icon: BarChart3, label: "Avg. Accuracy Gain", value: "+42%" },
  ];

  return (
    <section className="py-8 bg-slate-950/50 border border-slate-800 rounded-2xl">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Metrics */}
          <div className="grid grid-cols-3 gap-8 md:gap-12 w-full md:w-auto">
            {metrics.map((metric, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <metric.icon className="h-6 w-6 text-blue-500 mb-1" />
                <span className="text-xl font-black text-white">{metric.value}</span>
                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">{metric.label}</span>
              </div>
            ))}
          </div>

          {/* Branding */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900 border border-slate-800">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-300">
              <span className="text-emerald-500 font-bold">Pilot Program:</span> Academic Beta Phase
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
