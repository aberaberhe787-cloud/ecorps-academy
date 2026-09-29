import React from "react";
import { Lock, Globe2, Briefcase } from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  getPlatformSection,
  SECTION_COPY,
  isWorkspaceTab,
} from "../lib/platformSections";

/**
 * Compact strip clarifying Public vs Workspace for the active tab.
 */
export const SectionModeBanner: React.FC = () => {
  const { activeTab, user, openAuthModal } = useApp();
  const section = getPlatformSection(activeTab);
  const copy = SECTION_COPY[section];

  // Home already has guest landing / signed-in home — skip extra strip there
  if (activeTab === "home") return null;

  const isGuestWorkspace = !user && isWorkspaceTab(activeTab);

  return (
    <div
      className={`border-b px-3 sm:px-4 py-1.5 ${
        section === "workspace"
          ? "border-violet-500/20 bg-violet-950/30"
          : "border-slate-800/80 bg-slate-950/40"
      }`}
      role="status"
    >
      <div className="mx-auto max-w-7xl 2xl:max-w-[1536px] flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs">
        <div className="flex items-center gap-2 min-w-0 text-slate-300">
          {section === "public" ? (
            <Globe2 className="h-3.5 w-3.5 text-indigo-300 shrink-0" aria-hidden="true" />
          ) : (
            <Briefcase className="h-3.5 w-3.5 text-violet-300 shrink-0" aria-hidden="true" />
          )}
          <span className="font-semibold text-slate-200">{copy.shortLabel}</span>
          <span className="text-slate-500 hidden sm:inline">·</span>
          <span className="text-slate-400 truncate">
            {user
              ? section === "workspace"
                ? copy.signedInHint
                : copy.guestHint.replace("Sign in when you want progress saved.", "Progress saves to your account.")
              : isGuestWorkspace
                ? copy.guestHint
                : copy.guestHint}
          </span>
        </div>

        {!user && (
          <button
            type="button"
            onClick={() =>
              openAuthModal(
                isGuestWorkspace
                  ? "Sign in to use the full learner workspace (assess + dashboard sync)."
                  : "Sign in to save XP, streaks, and credentials across the platform."
              )
            }
            className="inline-flex items-center gap-1 shrink-0 font-semibold text-indigo-300 hover:text-indigo-200 cursor-pointer"
          >
            {isGuestWorkspace && <Lock className="h-3 w-3" aria-hidden="true" />}
            Sign in
          </button>
        )}
      </div>
    </div>
  );
};
