import React, { useState } from "react";
import { BookOpen, Terminal, ArrowRight, Flame, Award, Compass, Zap, Grid3X3, ShieldCheck, Target, CheckCircle2, ChevronRight, BriefcaseBusiness, Users, BarChart3, GraduationCap, X } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../context/AppContext";
import { auth } from "../lib/firebase";
import { EcorpLogo } from "../components/EcorpLogo";
import { LearningRouteDiagnostic } from "../components/LearningRouteDiagnostic";
import { CapabilityBaselineChallenge } from "../components/CapabilityBaselineChallenge";
import { PerformanceMetrics } from "../components/PerformanceMetrics";
import { CredibilityStrip } from "../components/CredibilityStrip";
import { InstructorsSection } from "../components/home/InstructorsSection";
import { Button } from "../components/ui/Button";

const TRACKS = [
  { title: "Prompt Engineering Foundations", learner: "New learners", duration: "2 hours", outcome: "Safe, structured prompt habits", level: "Beginner", project: "Prompt Anatomy Lab" },
  { title: "AI Productivity for Professionals", learner: "Practitioners", duration: "4 hours", outcome: "Automated work workflows", level: "Intermediate", project: "Workflow Automation" },
  { title: "AI Systems and Evaluation", learner: "Advanced", duration: "6 hours", outcome: "Evaluated agent systems", level: "Advanced", project: "Agent Evaluation Harness" },
  { title: "AI Adoption for Teams", learner: "Leaders", duration: "4 hours", outcome: "Governance & deployment plans", level: "Strategic", project: "AI Readiness Assessment" },
];

export const HomeView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-24">
      {/* 1. Hero */}
      <section className="text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto">
          Build practical AI capability across your work.
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Interactive, role-based learning for prompt engineering, AI productivity, and responsible AI adoption.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button size="lg" onClick={() => setActiveTab("curriculum")}>Start learning free</Button>
          <Button variant="outline" size="lg" onClick={() => setShowDiagnostic(true)}>Choose your path</Button>
          <Button variant="outline" size="lg">Train your team</Button>
        </div>
        <div className="pt-8 text-sm text-slate-500 font-mono">
          Built for modern, outcome-focused teams.
        </div>
      </section>
      
      <CredibilityStrip />

      {/* 1.5 Baseline Challenge */}
      <CapabilityBaselineChallenge />
      
      {/* 1.6 Performance Metrics */}
      <PerformanceMetrics />

      {/* 2. Outcome-led learning tracks */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">Outcome-led learning tracks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRACKS.map(track => (
            <div key={track.title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
              <h3 className="font-bold text-white">{track.title}</h3>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>Target: {track.learner}</li>
                <li>Duration: {track.duration}</li>
                <li>Outcome: {track.outcome}</li>
                <li>Level: {track.level}</li>
                <li>Result: {track.project}</li>
              </ul>
              <Button variant="ghost" size="sm" className="w-full">View Track</Button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Learn by doing proof */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 space-y-6">
        <h2 className="text-2xl font-bold text-white">“Learn by doing” proof</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          {["Weak prompt", "Structured prompt", "Evaluated output", "Measurable improvement"].map(step => (
            <div key={step} className="p-4 bg-slate-950 rounded-lg border border-slate-800">
              <div className="font-bold text-blue-400">{step}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Corporate training */}
      <section className="rounded-2xl border border-indigo-900/30 bg-indigo-950/20 p-8 space-y-6">
        <h2 className="text-2xl font-bold text-white">Train your team with Ecorp</h2>
        <p className="text-slate-300 max-w-2xl">A structured platform to assess, assign, and measure AI capability across your organization.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["Assess capability", "Assign learning plans", "Measure progress"].map(feat => (
            <div key={feat} className="flex items-center gap-3 text-sm font-semibold text-white">
              <CheckCircle2 className="text-indigo-400" /> {feat}
            </div>
          ))}
        </div>
        <Button variant="indigo" size="lg">Talk to us about team training</Button>
      </section>

      <InstructorsSection />

      {/* Diagnostic Modal */}
      {showDiagnostic && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowDiagnostic(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-900 rounded-3xl p-6 max-w-lg w-full relative shadow-2xl border border-indigo-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDiagnostic(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <LearningRouteDiagnostic />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

