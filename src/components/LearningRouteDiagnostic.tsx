import React, { useState } from "react";
import { ArrowRight, Compass } from "lucide-react";
import { useApp } from "../context/AppContext";

type Experience = "new" | "practitioner" | "advanced";

const routes: Record<Experience, { title: string; detail: string; tab: "foundations" | "curriculum" | "playground" }> = {
  new: { title: "Start with Foundations", detail: "Build clear, safe prompt habits before systems work.", tab: "foundations" },
  practitioner: { title: "Start with the Core Curriculum", detail: "Practice structured outputs, evaluation, and workflow patterns.", tab: "curriculum" },
  advanced: { title: "Start in the Practice Lab", detail: "Use missions and the sandbox, then review targeted lessons.", tab: "playground" },
};

/** Non-scored onboarding route; it never changes learner progress or credentials. */
export const LearningRouteDiagnostic: React.FC = () => {
  const { setActiveTab } = useApp();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const route = experience && goal ? routes[experience] : null;
  const options: [Experience, string][] = [["new", "New to AI"], ["practitioner", "I use AI at work"], ["advanced", "I build AI systems"]];

  return <section aria-labelledby="learning-route-title" className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 to-slate-900 p-4 sm:p-5 space-y-4">
    <div className="flex gap-3"><div className="rounded-xl border border-indigo-400/30 bg-indigo-500/10 p-2 text-indigo-300"><Compass className="h-5 w-5" /></div><div><p className="text-[10px] font-mono font-bold tracking-wider text-indigo-300">STARTING POINT</p><h2 id="learning-route-title" className="text-base font-bold text-white">Find your recommended learning route</h2><p className="mt-1 text-xs text-slate-300">This brief check does not score you or change your progress.</p></div></div>
    <fieldset><legend className="mb-2 text-xs font-semibold text-slate-200">Your current AI experience</legend><div className="grid gap-2 sm:grid-cols-3">{options.map(([value, label]) => <button key={value} type="button" onClick={() => setExperience(value)} aria-pressed={experience === value} className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold ${experience === value ? "border-indigo-400 bg-indigo-500/20 text-white" : "border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-500"}`}>{label}</button>)}</div></fieldset>
    <fieldset><legend className="mb-2 text-xs font-semibold text-slate-200">Your immediate goal</legend><div className="grid gap-2 sm:grid-cols-3">{[["learn", "Learn essentials"], ["work", "Improve a work task"], ["build", "Build or evaluate systems"]].map(([value, label]) => <button key={value} type="button" onClick={() => setGoal(value)} aria-pressed={goal === value} className={`rounded-xl border px-3 py-2.5 text-left text-xs font-semibold ${goal === value ? "border-indigo-400 bg-indigo-500/20 text-white" : "border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-500"}`}>{label}</button>)}</div></fieldset>
    {route && <div className="flex flex-col gap-3 rounded-xl border border-indigo-400/20 bg-slate-950/60 p-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold text-white">{route.title}</p><p className="mt-0.5 text-xs text-slate-400">{route.detail}</p></div><button type="button" onClick={() => setActiveTab(route.tab)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white">Open route <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></button></div>}
  </section>;
};
