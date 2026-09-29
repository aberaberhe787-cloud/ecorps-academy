import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { EcorpLogo } from "./EcorpLogo";
import { PrimaryNavigation } from "./navbar/PrimaryNavigation";
import { GlobalSearch } from "./navbar/GlobalSearch";
import { SystemControls } from "./navbar/SystemControls";
import { MobileMenuOverlay } from "./MobileMenuOverlay";
import { getPlatformSection, SECTION_COPY } from "../lib/platformSections";

export const Navbar: React.FC = () => {
  const { setActiveTab, t, activeTab, user } = useApp();
  const section = getPlatformSection(activeTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        role="banner"
        aria-label="Ecorp Academy Platform Navigation"
        className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#070b14]/80 backdrop-blur-xl transition-colors"
      >
        <div className="mx-auto flex h-14 sm:h-16 w-full max-w-7xl 2xl:max-w-[1536px] items-center justify-between gap-1.5 sm:gap-3 lg:gap-4 px-3 sm:px-4 lg:px-8 min-w-0">
          {/* Brand Identity */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setActiveTab("home")}
              className="flex items-center gap-1.5 sm:gap-2 focus:outline-none group cursor-pointer min-w-0"
              aria-label="Go to Ecorp Academy Home"
            >
              <EcorpLogo size="sm" />
              <div className="flex flex-col text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs sm:text-sm md:text-base font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors truncate">
                    {t.nav.brandName}
                  </span>
                  <span className="hidden min-[360px]:inline rounded-md bg-indigo-500/15 border border-indigo-400/25 px-1.5 py-0.5 font-mono text-[9px] font-bold text-indigo-300 shrink-0 tracking-wide">
                    ACADEMY
                  </span>
                  <span
                    className={`hidden sm:inline rounded-md px-1.5 py-0.5 font-mono text-[9px] font-bold shrink-0 tracking-wide border ${
                      section === "workspace"
                        ? "bg-violet-500/15 border-violet-400/25 text-violet-300"
                        : "bg-slate-800/80 border-slate-600/40 text-slate-400"
                    }`}
                    title={user ? "Signed in" : "Browsing as guest"}
                  >
                    {SECTION_COPY[section].shortLabel}
                    {!user ? " · Guest" : ""}
                  </span>
                </div>
                <span className="hidden md:block text-[10px] text-slate-400 -mt-0.5 truncate">
                  {t.nav.brandSubtitle}
                </span>
              </div>
            </button>
          </div>

          <GlobalSearch />
          <PrimaryNavigation />
          <SystemControls
            mobileMenuOpen={mobileMenuOpen}
            onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          />
        </div>
      </header>

      <MobileMenuOverlay
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenSearch={() => {
          setMobileMenuOpen(false);
          window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
        }}
      />
    </>
  );
};
