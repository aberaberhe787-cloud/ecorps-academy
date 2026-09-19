import React from "react";
import { Flame, Menu } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { auth } from "../../lib/firebase";
import { ThemeToggle } from "../ThemeToggle";
import { NetworkStatusBadge } from "../NetworkStatusIndicator";
import { AccountMenu } from "./AccountMenu";

interface SystemControlsProps {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const SystemControls: React.FC<SystemControlsProps> = ({
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const { userProgress, setActiveTab } = useApp();

  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2" id="navbar-system-controls">
      {auth.currentUser && userProgress && (
        <div 
          title={`${userProgress.streakDays} Day Activity Streak!`}
          onClick={() => setActiveTab("profile")}
          className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/25 hover:border-orange-500/40 hover:bg-orange-500/20 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-bold text-orange-400 cursor-pointer transition select-none active:scale-[0.95]"
        >
          <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-400 animate-pulse shrink-0" />
          <span className="font-mono text-xs leading-none">{userProgress.streakDays || 0}</span>
        </div>
      )}

      <div className="hidden md:flex items-center gap-1 sm:gap-2">
        <NetworkStatusBadge />
        <ThemeToggle />
        <AccountMenu />
      </div>

      <button
        id="mobile-menu-toggle-btn"
        onClick={onToggleMobileMenu}
        className="md:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
        aria-label="Toggle navigation menu"
        aria-expanded={mobileMenuOpen}
      >
        <Menu className="h-5 w-5" />
      </button>
    </div>
  );
};
