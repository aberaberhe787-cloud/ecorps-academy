/**
 * ECORP Academy — platform configuration (design contract).
 * Mirrors the system design proposal; safe for UI imports.
 */

export const PLATFORM = {
  name: "ECORP Academy",
  tagline: "Learn → Practice → Assess",
  version: "0.1.0",
  loops: ["learn", "practice", "assess", "progress"] as const,
  publicTabs: [
    "home",
    "curriculum",
    "foundations",
    "playground",
    "patterns",
    "resources",
  ] as const,
  workspaceTabs: ["certification", "profile"] as const,
  xpPerLevel: 250,
  rateLimits: {
    generatePerMinute: 30,
    evaluatePerMinute: 20,
  },
} as const;
