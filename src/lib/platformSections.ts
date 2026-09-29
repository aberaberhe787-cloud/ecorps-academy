import type { NavTab } from "../types";

/**
 * Platform information architecture:
 *
 * PUBLIC (guest-friendly)
 *   Browse curriculum, foundations, sandbox, patterns, resources, landing.
 *   No account required to open these surfaces.
 *
 * WORKSPACE (authenticated value)
 *   Assess + Academic Dashboard (profile). Guests may preview;
 *   submitting, saving, and syncing require sign-in.
 */

export const PUBLIC_NAV_TABS: readonly NavTab[] = [
  "home",
  "curriculum",
  "foundations",
  "playground",
  "patterns",
  "resources",
] as const;

export const WORKSPACE_NAV_TABS: readonly NavTab[] = [
  "certification",
  "profile",
] as const;

export type PlatformSection = "public" | "workspace";

export function getPlatformSection(tab: NavTab): PlatformSection {
  return (WORKSPACE_NAV_TABS as readonly string[]).includes(tab) ? "workspace" : "public";
}

export function isPublicTab(tab: NavTab): boolean {
  return getPlatformSection(tab) === "public";
}

export function isWorkspaceTab(tab: NavTab): boolean {
  return getPlatformSection(tab) === "workspace";
}

export const SECTION_COPY = {
  public: {
    shortLabel: "Public",
    title: "Public learning area",
    guestHint: "Browse and practice free. Sign in when you want progress saved.",
  },
  workspace: {
    shortLabel: "Workspace",
    title: "Learner workspace",
    guestHint: "Preview only — sign in to submit assessments and sync your dashboard.",
    signedInHint: "Your progress, assessment, and credentials live here.",
  },
} as const;
