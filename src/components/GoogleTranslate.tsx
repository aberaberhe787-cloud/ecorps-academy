import React, { useState, useRef, useEffect } from "react";
import { Languages, ChevronDown, Check, Globe } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Language } from "../i18n/translations";

interface LangOption {
  code: Language;
  nativeName: string;
  flag: string;
  label: string;
}

const LANG_OPTIONS: LangOption[] = [
  { code: "en", nativeName: "English", flag: "🇺🇸", label: "English" },
  { code: "am", nativeName: "አማርኛ", flag: "🇪🇹", label: "Amharic" },
];

export const GoogleTranslate: React.FC = () => {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = LANG_OPTIONS.find((l) => l.code === language) ?? LANG_OPTIONS[0];
  const isAmharic = language === "am";

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex" ref={ref}>
      {/* Toggle Button */}
      <button
        id="language-toggle-btn"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-sm transition-all active:scale-95 ${
          isAmharic
            ? "border-emerald-500/60 bg-emerald-950/50 text-emerald-300 hover:border-emerald-400"
            : "border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-500 hover:text-white"
        }`}
        title="Switch Language / ቋንቋ ቀይር"
        aria-label="Language switcher"
      >
        <Languages className={`h-3.5 w-3.5 shrink-0 ${isAmharic ? "text-emerald-400" : "text-blue-400"}`} />
        <span className="hidden sm:inline">{current.flag}</span>
        <span className="hidden sm:inline">{current.nativeName}</span>
        <span className="sm:hidden font-mono text-[10px] uppercase">{current.code}</span>
        <ChevronDown className={`h-3 w-3 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          id="language-dropdown"
          className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-700/80 bg-slate-900/98 p-1.5 shadow-2xl backdrop-blur-xl z-[60]"
        >
          {/* Header */}
          <div className="flex items-center gap-1.5 border-b border-slate-800 px-2.5 pb-2 mb-1.5">
            <Globe className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-[11px] font-semibold text-slate-400">
              Select Language / ቋንቋ ምረጥ
            </span>
          </div>

          {/* Language Options */}
          {LANG_OPTIONS.map((lang) => {
            const isActive = language === lang.code;
            return (
              <button
                key={lang.code}
                id={`lang-${lang.code}`}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? lang.code === "am"
                      ? "bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/40 text-emerald-200 font-semibold"
                      : "bg-blue-600 text-white font-semibold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <div className="text-left">
                    <div className="font-semibold text-sm leading-tight">{lang.nativeName}</div>
                    <div className="text-[10px] opacity-60">{lang.label}</div>
                  </div>
                </div>
                {isActive && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}

          {/* Footer */}
          <div className="border-t border-slate-800 mt-1.5 pt-1.5 px-2.5 pb-0.5">
            <p className="text-[10px] text-slate-600 text-center">
              Native i18n engine · No tracking
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
