import {
  BookOpen,
  Terminal,
  ClipboardCheck,
  User,
} from "lucide-react";

export type GuestLearnTab = "curriculum" | "foundations";
export type GuestNavTab =
  | "curriculum"
  | "foundations"
  | "playground"
  | "certification"
  | "profile"
  | "resources";

/** Align with Learning Hub tracks only (not marketing-only paths). */
export const GUEST_TRACKS = [
  {
    title: "Prompt Engineering Foundations",
    learner: "New learners",
    duration: "~1 hour",
    outcome: "Clear tasks, roles, constraints, and iteration habits",
    level: "Beginner",
    tab: "foundations" as const,
    lessonId: "foundation-clarity",
  },
  {
    title: "AI Systems & Applied Prompting",
    learner: "After foundations",
    duration: "Self-paced",
    outcome: "In-context mechanics, reasoning patterns, and structured outputs",
    level: "Intermediate → Advanced",
    tab: "curriculum" as const,
    lessonId: "m1-l1",
  },
] as const;

export const GUEST_LOOP_STEPS = [
  {
    step: "01",
    title: "Learn",
    detail: "Curriculum and foundations with explicit tasks, constraints, and checks.",
    icon: BookOpen,
    action: "Browse Learning Hub",
    tab: "curriculum" as const,
    requiresAuth: false,
  },
  {
    step: "02",
    title: "Practice",
    detail: "Sandbox, missions, and CTF labs to test prompts under real constraints.",
    icon: Terminal,
    action: "Open sandbox",
    tab: "playground" as const,
    requiresAuth: false,
  },
  {
    step: "03",
    title: "Assess",
    detail: "Capstone-style evaluation to verify skill—not just completion.",
    icon: ClipboardCheck,
    action: "Open assessment",
    tab: "certification" as const,
    requiresAuth: false,
  },
  {
    step: "04",
    title: "Progress",
    detail: "XP, streaks, and competency evidence on your profile after you sign in.",
    icon: User,
    action: "Open dashboard",
    tab: "profile" as const,
    requiresAuth: false,
  },
] as const;
