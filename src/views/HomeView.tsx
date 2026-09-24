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
import { TestimonialsCarousel } from "../components/TestimonialsCarousel";
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
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen">
      {/* Hero Section - Redesigned */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 -z-0"></div>
        <div className="relative max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
            Master <span className="text-blue-500">AI Architecture</span>.
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
            Practical, role-based learning for prompt engineering, AI productivity, and enterprise-grade agent systems.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button size="lg" onClick={() => setActiveTab("curriculum")} className="text-lg px-8">Start Learning Free</Button>
            <Button variant="outline" size="lg" onClick={() => setShowDiagnostic(true)} className="text-lg px-8">Choose Your Path</Button>
          </div>
        </div>
      </section>
      
      {/* Content wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        <CredibilityStrip />

        {/* Learn by Doing - Refined */}
        <section className="bg-slate-900/50 rounded-3xl p-10 border border-slate-800">
          <h2 className="text-3xl font-bold text-white mb-10 text-center">Built for outcome-led teams</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {["Weak prompt", "Structured prompt", "Evaluated output", "Measurable improvement"].map((step, i) => (
              <div key={step} className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2 hover:border-blue-500/50 transition-colors">
                <div className="text-4xl font-black text-blue-900/50">0{i+1}</div>
                <div className="font-bold text-white">{step}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Tracks & Carousel */}
        <section className="space-y-16">
           <section className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center">Curriculum tracks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TRACKS.map(track => (
                <div key={track.title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4 hover:border-slate-600 transition-all">
                  <h3 className="font-bold text-white h-12">{track.title}</h3>
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>Target: {track.learner}</li>
                    <li>Duration: {track.duration}</li>
                    <li>Level: {track.level}</li>
                  </ul>
                  <Button variant="ghost" size="sm" className="w-full mt-4">View Track</Button>
                </div>
              ))}
            </div>
          </section>
          <TestimonialsCarousel />
        </section>

        {/* Corporate */}
        <section className="rounded-3xl border border-indigo-900/30 bg-indigo-950/20 p-12 space-y-8 text-center flex flex-col items-center">
          <h2 className="text-3xl font-bold text-white">Train your team with Ecorp</h2>
          <p className="text-slate-300 max-w-2xl text-lg">A structured platform to assess, assign, and measure AI capability across your organization.</p>
          <Button variant="indigo" size="lg">Talk to us about team training</Button>
        </section>

        <InstructorsSection />
      </div>

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

