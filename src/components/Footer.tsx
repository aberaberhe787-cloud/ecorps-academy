import React from "react";
import { Sparkles, BookOpen, Terminal, Trophy, Check } from "lucide-react";
import { useApp } from "../context/AppContext";
import { EcorpLogo } from "./EcorpLogo";

export const Footer: React.FC = () => {
  const { setActiveTab, t } = useApp();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 text-slate-400 text-xs py-10" id="ecorp-app-footer">
      <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <EcorpLogo size="sm" />
              <span className="font-mono text-base font-bold text-white">
                {t.nav.brandName} <span className="text-blue-400">Academy</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.footer.brandDesc}
            </p>
          </div>

          {/* Curriculum Tracks */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-xs mb-3 font-mono">
              {t.footer.tracksHeader}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {t.footer.trackFoundations}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {t.footer.trackReasoning}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {t.footer.trackSystems}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("curriculum")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {t.footer.trackSecurity}
                </button>
              </li>
            </ul>
          </div>

          {/* Interactive Tools */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-xs mb-3 font-mono">
              {t.footer.toolsHeader}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab("playground")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {t.footer.toolSandbox}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("playground")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {t.footer.toolMissions}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("patterns")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {t.footer.toolPatterns}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab("resources")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  {t.footer.toolResources}
                </button>
              </li>
            </ul>
          </div>

          {/* Principles */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-xs mb-3 font-mono">
              {t.footer.engineeringCoreHeader}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.footer.engineeringCoreDesc}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t.footer.systemStatus}</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center sm:justify-between text-center sm:text-left gap-4 text-xs text-slate-500">
          <p>© 2026 Ecorp Academy. {t.footer.copyright}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("ecorp:open-shortcuts-modal"))}
              className="hover:text-blue-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="View all keyboard shortcuts"
            >
              <kbd className="px-1.5 py-0.5 rounded border border-slate-700 bg-slate-900 text-[10px] font-mono text-slate-300">?</kbd>
              <span>{t.footer.shortcuts}</span>
            </button>
            <span>•</span>
            <span>{t.footer.designedFor}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
