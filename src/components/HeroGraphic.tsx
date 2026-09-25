import React from "react";
import { Terminal, BrainCircuit, ShieldCheck, Zap } from "lucide-react";

export const HeroGraphic: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[300px] bg-slate-900/50 rounded-2xl border border-slate-700 p-6 flex flex-col justify-between overflow-hidden">
      <div className="flex justify-between items-start">
        <div className="p-3 bg-blue-950/50 rounded-lg border border-blue-800 text-blue-400">
          <Terminal className="h-8 w-8" />
        </div>
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/50"></div>
          <div className="h-3 w-3 rounded-full bg-amber-500/50"></div>
          <div className="h-3 w-3 rounded-full bg-emerald-500/50"></div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="h-4 w-3/4 bg-slate-800 rounded"></div>
        <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
        <div className="flex gap-4">
            <div className="p-3 bg-indigo-950/50 rounded-lg border border-indigo-800 text-indigo-400">
                <BrainCircuit className="h-6 w-6" />
            </div>
            <div className="p-3 bg-emerald-950/50 rounded-lg border border-emerald-800 text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
            </div>
             <div className="p-3 bg-amber-950/50 rounded-lg border border-amber-800 text-amber-400">
                <Zap className="h-6 w-6" />
            </div>
        </div>
      </div>
      
      <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-blue-500/20 rounded-full blur-3xl"></div>
    </div>
  );
};
