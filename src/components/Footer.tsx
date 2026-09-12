import React from "react";
import { Sparkles, BookOpen, Terminal, Grid3X3, Trophy, Check, Github, Heart } from "lucide-react";
import { useApp } from "../context/AppContext";
import { EcorpLogo } from "./EcorpLogo";

const FOOTER_FEATURE_STATISTICS = [
  {
    icon: BookOpen,
    iconColor: "text-blue-400",
    number: "10+",
    numberColor: "text-blue-300",
    text: "Interactive Lessons",
  },
  {
    icon: Terminal,
    iconColor: "text-emerald-400",
    number: "6+",
    numberColor: "text-emerald-300",
    text: "Production Patterns",
  },
  {
    icon: Trophy,
    iconColor: "text-amber-400",
    number: "5+",
    numberColor: "text-amber-300",
    text: "Graded Missions",
  },
  {
    icon: Check,
    iconColor: "text-purple-400",
    number: "100%",
    numberColor: "text-purple-300",
    text: "Hands-On Practice",
  },
];

export const Footer: React.FC = () => {
  const { setActiveTab, t } = useApp();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 text-slate-400 text-xs py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Feature Statistics Section: Explicitly stacks on mobile (< 768px) and transitions to spaced-out horizontal layout on desktop */}
        <div id="footer-feature-statistics-section" className="mb-10 pb-8 border-b border-slate-800/70">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 lg:gap-6">
            {FOOTER_FEATURE_STATISTICS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.text}
                  className="w-full md:w-auto flex items-center justify-center md:justify-start gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 px-4 py-2.5 text-xs text-slate-300 shadow-sm shrink-0 whitespace-nowrap"
                >
                  <Icon className={`h-4 w-4 ${stat.iconColor} shrink-0`} />
                  <span className="whitespace-nowrap">
                    <strong className={`${stat.numberColor} font-bold mr-1.5`}>{stat.number}</strong>
                    {stat.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <EcorpLogo size="sm" />
              <span className="font-mono text-base font-bold text-white">
                {t.nav.brandName} <span className="text-blue-400">Acadamy</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t.footer.brandDesc}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              {t.footer.tracksHeader}
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className="hover:text-blue-400 transition-colors"
                >
                  {t.footer.trackFoundations}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className="hover:text-blue-400 transition-colors"
                >
                  {t.footer.trackReasoning}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className="hover:text-blue-400 transition-colors"
                >
                  {t.footer.trackSystems}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className="hover:text-blue-400 transition-colors"
                >
                  {t.footer.trackSecurity}
                </button>
              </li>
            </ul>
          </div>

          {/* Interactive Tools */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              {t.footer.toolsHeader}
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button
                  onClick={() => setActiveTab("playground")}
                  className="hover:text-blue-400 transition-colors"
                >
                  {t.footer.toolSandbox}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("playground")}
                  className="hover:text-blue-400 transition-colors"
                >
                  {t.footer.toolMissions}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("patterns")}
                  className="hover:text-blue-400 transition-colors"
                >
                  {t.footer.toolPatterns}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("resources")}
                  className="hover:text-blue-400 transition-colors"
                >
                  {t.footer.toolResources}
                </button>
              </li>
            </ul>
          </div>

          {/* Principles */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">
              Engineering Core
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Designed with enterprise best practices: structured XML tags, typed JSON schema validation, zero hallucination guardrails, and deterministic temperature controls.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
              <span>Status: All Heuristic Analyzers Operational</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left gap-4 text-[11px] text-slate-500">
          <p>© 2026 Ecorp Acadamy. {t.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <span>{t.footer.designedFor}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
