import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { EcorpLogo } from "./EcorpLogo";
import { PrimaryNavigation } from "./navbar/PrimaryNavigation";
import { GlobalSearch } from "./navbar/GlobalSearch";
import { SystemControls } from "./navbar/SystemControls";
import { MobileMenuOverlay } from "./MobileMenuOverlay";

export const Navbar: React.FC = () => {
  const { setActiveTab, t } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        role="banner"
        aria-label="Ecorp Academy Platform Navigation"
        className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md transition-colors"
      >
        <div className="mx-auto flex h-16 w-full max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] lg:max-w-7xl 2xl:max-w-[1536px] items-center justify-between gap-1.5 sm:gap-3 lg:gap-4 px-2 sm:px-4 lg:px-8 min-w-0">
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
                  <span className="font-mono text-xs sm:text-sm md:text-base font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors truncate">
                    {t.nav.brandName}
                  </span>
                  <span className="rounded bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 font-mono text-[9px] font-bold text-blue-400 shrink-0">
                    ACADEMY
                  </span>
                </div>
                <span className="hidden md:block text-[10px] text-slate-400 -mt-0.5 truncate">
                  {t.nav.brandSubtitle}
                </span>
              </div>
            </button>
          </div>

          {/* Global Search Bar & Command Palette */}
          <GlobalSearch />

          {/* Desktop & Compact Primary Navigation */}
          <PrimaryNavigation />

          {/* System Controls & Account Menu */}
          <SystemControls 
            mobileMenuOpen={mobileMenuOpen} 
            onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)} 
          />
        </div>
      </header>

      {/* Responsive Mobile Drawer */}
      <MobileMenuOverlay
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenSearch={() => {
          setMobileMenuOpen(false);
          // Focus search by dispatching standard shortcut
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
        }}
      />
    </>
  );
};
