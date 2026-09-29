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

export const GUEST_TRACKS = [
  {
    title: "Prompt Engineering Foundations",
    learner: "New learners",
    duration: "2 hours",
    outcome: "Safe, structured prompt habits",
    level: "Beginner",
    tab: "foundations" as const,
    lessonId: "foundation-clarity",
  },
  {
    title: "AI Productivity for Professionals",
    learner: "Practitioners",
    duration: "4 hours",
    outcome: "Automated work workflows",
    level: "Intermediate",
    tab: "curriculum" as const,
    lessonId: "m1-l1",
  },
  {
    title: "AI Systems and Evaluation",
    learner: "Advanced",
    duration: "6 hours",
    outcome: "Evaluated agent systems",
    level: "Advanced",
    tab: "curriculum" as const,
    lessonId: "m2-l1",
  },
  {
    title: "AI Adoption for Teams",
    learner: "Leaders",
    duration: "4 hours",
    outcome: "Governance & deployment plans",
    level: "Strategic",
    tab: "curriculum" as const,
    lessonId: "m3-l1",
  },
] as const;

export const GUEST_LOOP_STEPS = [
  {
    step: "01",
    title: "Learn",
    detail: "Curriculum and foundations with explicit tasks, constraints, and checks.",
    icon: BookOpen,
    action: "Browse curriculum",
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
    action: "Sign in to assess",
    tab: "certification" as const,
    requiresAuth: true,
  },
  {
    step: "04",
    title: "Progress",
    detail: "XP, streaks, and competency evidence on your profile after you sign in.",
    icon: User,
    action: "Sign in to track",
    tab: "profile" as const,
    requiresAuth: true,
  },
] as const;
