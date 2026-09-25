import React from "react";
import { TrendingUp, CheckCircle2, AlertCircle, BarChart3 } from "lucide-react";
import { motion } from "motion/react";

export const PerformanceMetrics: React.FC = () => {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-8"
    >
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black text-white">Proven Performance Gains</h2>
        <p className="text-slate-400">Iterative refinement turns vague responses into structured, verifiable assets.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Before */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2 mb-4 text-rose-400">
            <AlertCircle className="h-5 w-5" />
            <span className="font-bold">Before: Intuitive Prompting</span>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-400 font-mono">
              "Analyze this config and tell me if it's safe."
            </div>
            <div className="p-4 bg-slate-900 rounded-lg border border-rose-900/20 text-xs text-slate-300">
              "Yes, this configuration looks generally safe, though you should check the permissions..."
            </div>
          </div>
        </div>

        {/* After */}
        <div className="p-6 rounded-2xl border border-emerald-900/30 bg-emerald-950/10">
          <div className="flex items-center gap-2 mb-4 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-bold">After: Ecorp Refinement</span>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 font-mono">
              "Act as Senior Security Architect. Analyze &lt;config&gt; for risk_level and 3 vulnerabilities..."
            </div>
            <div className="p-4 bg-slate-950 rounded-lg border border-emerald-900/20 text-xs text-slate-300">
              {"{ \"risk_level\": \"High\", \"vulnerabilities\": [\"...\"], \"verification\": \"passed\" }"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Data Accuracy", before: "65%", after: "98%" },
          { label: "Constraint Adherence", before: "40%", after: "100%" },
          { label: "Eval Confidence", before: "Low", after: "High" },
        ].map((metric, i) => (
          <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-300">{metric.label}</span>
            <div className="flex gap-2 items-center font-mono">
              <span className="text-slate-500">{metric.before}</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">{metric.after}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
};
