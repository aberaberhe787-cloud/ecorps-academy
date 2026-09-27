/**
 * ECORP Academy — shared motion language (presentation only).
 * Keep durations short; respect reduced motion at call sites via useReducedMotion().
 */

export const easeOutSoft: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** 1. Page / view enter */
export const viewEnter = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: easeOutSoft },
} as const;

export const viewEnterReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
} as const;

/** 2. Card / list stagger */
export const staggerContainer = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.05, delayChildren: 0.04 },
  },
} as const;

export const staggerItem = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: easeOutSoft },
  },
} as const;

export const staggerItemReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.12 } },
} as const;

/** 3. Progress bar fill */
export const progressFillTransition = {
  duration: 0.45,
  ease: easeOutSoft,
} as const;

/** 4. Modal / panel */
export const modalPanel = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { duration: 0.2, ease: easeOutSoft },
} as const;

export const modalPanelReduced = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.12 },
} as const;

export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.18 },
} as const;

/** 5. Primary action micro-interactions */
export const tapScale = { scale: 0.98 } as const;
export const hoverLift = { scale: 1.01 } as const;
