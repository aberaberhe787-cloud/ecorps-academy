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
import { HeroGraphic } from "../components/HeroGraphic";
import { InstructorsSection } from "../components/home/InstructorsSection";
import { Button } from "../components/ui/Button";
import { OnboardingModal } from "../components/OnboardingModal";

const TRACKS = [
  { title: "Prompt Engineering Foundations", learner: "New learners", duration: "2 hours", outcome: "Safe, structured prompt habits", level: "Beginner", project: "Prompt Anatomy Lab" },
  { title: "AI Productivity for Professionals", learner: "Practitioners", duration: "4 hours", outcome: "Automated work workflows", level: "Intermediate", project: "Workflow Automation" },
  { title: "AI Systems and Evaluation", learner: "Advanced", duration: "6 hours", outcome: "Evaluated agent systems", level: "Advanced", project: "Agent Evaluation Harness" },
  { title: "AI Adoption for Teams", learner: "Leaders", duration: "4 hours", outcome: "Governance & deployment plans", level: "Strategic", project: "AI Readiness Assessment" },
];

export const HomeView: React.FC = () => {
  const { setActiveTab } = useApp();
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative space-y-6 text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
              Build practical AI capability across your work.
            </h1>
            <p className="text-lg text-slate-400 max-w-xl mx-auto lg:mx-0">
              ECORPS Academy is your hands-on learning platform for AI and modern technologies. Learn at your own pace, practice with real tools, and build projects that matter.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4">
              <Button size="lg" onClick={() => setShowOnboarding(true)} className="text-lg px-8">Start learning free →</Button>
              <Button variant="outline" size="lg" onClick={() => setShowDiagnostic(true)} className="text-lg px-8">Choose your path</Button>
              <Button variant="outline" size="lg" className="text-lg px-8">Train your team</Button>
            </div>
            
            {/* Capability highlights */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500"/>
                    <span className="font-medium">Hands-on Practice</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500"/>
                    <span className="font-medium">Expert Curriculum</span>
                </div>
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500"/>
                    <span className="font-medium">Track Progress</span>
                </div>
            </div>
          </div>
          
          <div className="hidden lg:block relative">
            <HeroGraphic />
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      {auth.currentUser ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
          <CredibilityStrip />

          <TestimonialsCarousel />

          <CapabilityBaselineChallenge />

          <PerformanceMetrics />

          {/* Tracks */}
          <section className="space-y-6">
            <h2 className="text-3xl font-bold text-white text-center">Outcome-led learning tracks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TRACKS.map(track => (
                <div key={track.title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4 hover:border-slate-600 transition-all flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white mb-2">{track.title}</h3>
                    <ul className="text-xs text-slate-400 space-y-1">
                      <li>Target: {track.learner}</li>
                      <li>Duration: {track.duration}</li>
                      <li>Level: {track.level}</li>
                    </ul>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-4 border border-slate-800">View Track →</Button>
                </div>
              ))}
            </div>
          </section>

          {/* Learn by Doing - Refined */}
          <section className="bg-slate-900/50 rounded-3xl p-8 border border-slate-800 text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">"Learn by doing" proof</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {["Weak prompt", "Structured prompt", "Evaluated output", "Measurable improvement"].map((step, i) => (
                <div key={step} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2">
                  <div className="text-2xl font-black text-blue-900/50">0{i+1}</div>
                  <div className="text-sm font-bold text-white">{step}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Corporate */}
          <section className="rounded-3xl border border-indigo-900/30 bg-indigo-950/20 p-8 space-y-6 text-center flex flex-col items-center">
            <h2 className="text-3xl font-bold text-white">Train your team with Ecorp</h2>
            <p className="text-slate-300 max-w-2xl text-lg">A structured platform to assess, assign, and measure AI capability across your organization.</p>
            <div className="flex gap-4">
              <CheckCircle2 className="text-indigo-400" /> Access anywhere
              <CheckCircle2 className="text-indigo-400" /> Assign learning paths
              <CheckCircle2 className="text-indigo-400" /> Monitor progress
            </div>
            <Button variant="indigo" size="lg">Talk to us about team training →</Button>
          </section>

          <InstructorsSection />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-slate-500">
           <p className="text-lg">Please sign in to access the full ECORPS Academy curriculum and personalized learning tools.</p>
        </div>
      )}
...

      {/* Diagnostic Modal */}
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
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

