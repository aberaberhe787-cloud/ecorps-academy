import React, { useState } from "react";
import { Zap, BrainCircuit, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export const CapabilityBaselineChallenge: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "The Naive Approach",
      prompt: "Give me the security policy for our cloud.",
      failure: "The model hallucinates, exposes sensitive data, or provides generic, unactionable filler without verification.",
    },
    {
      title: "The Ecorp Standard",
      prompt: "Analyze <config>...</config>. Return JSON with risk_level, vulnerabilities, and verification_checks. Do not expose hidden reasoning. If evidence is missing, state the gap and escalate.",
      success: "The model provides structured, verifiable output with built-in safeguards and explicit failure states.",
    }
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-3xl bg-slate-900/40 p-8 shadow-2xl"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-blue-950">
          <BrainCircuit className="h-6 w-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">Ecorp Capability Baseline</h2>
          <p className="text-slate-400 text-sm">Understand the difference between intuition and engineering.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {steps.map((step, idx) => (
          <motion.div 
            key={idx}
            className={`p-6 rounded-2xl ${idx === activeStep ? 'bg-blue-950/20' : 'bg-slate-900/50'}`}
          >
            <h3 className="font-bold text-white mb-3">{step.title}</h3>
            <code className="block p-4 bg-slate-950 rounded-lg text-xs font-mono text-slate-300 mb-4">{step.prompt}</code>
            <p className="text-xs text-slate-400 flex gap-2">
              <span className="font-bold text-blue-400">{idx === 0 ? "Failure:" : "Success:"}</span>
              {idx === 0 ? step.failure : step.success}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveStep(activeStep === 0 ? 1 : 0)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition-all"
        >
          {activeStep === 0 ? "Compare with Ecorp Method" : "Complete Challenge"}
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.section>
  );
};
