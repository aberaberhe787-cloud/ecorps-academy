import { Achievement, UserProgress } from "../types";

export interface MilestoneDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "curriculum" | "streak" | "tools" | "mastery";
  check: (progress: UserProgress) => boolean;
}

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    id: "first-lesson",
    title: "First Lesson Completed",
    description: "Successfully mastered your first Prompt Engineering lesson.",
    icon: "first-prompt",
    category: "curriculum",
    check: (p) => (p.completedLessons?.length || 0) >= 1,
  },
  {
    id: "module-1-master",
    title: "Foundations Master",
    description: "Completed all foundational lessons in Module 1.",
    icon: "sandbox-1",
    category: "curriculum",
    check: (p) => {
      const mod1Ids = ["delimiters-token-isolation", "system-prompts-role-priming", "few-shot-exemplar-engineering", "structured-json-xml-outputs"];
      return mod1Ids.every((id) => p.completedLessons?.includes(id));
    },
  },
  {
    id: "module-2-master",
    title: "Reasoning Specialist",
    description: "Completed all reasoning and chain-of-thought lessons in Module 2.",
    icon: "sandbox-2",
    category: "curriculum",
    check: (p) => {
      const mod2Ids = ["chain-of-thought-scratchpad", "self-consistency-majority-vote", "tree-of-thoughts-heuristic-search", "negative-prompting-guardrails"];
      return mod2Ids.every((id) => p.completedLessons?.includes(id));
    },
  },
  {
    id: "streak-3",
    title: "Consistency Spark",
    description: "Maintained a 3-day active study streak in the Academy.",
    icon: "streak-3",
    category: "streak",
    check: (p) => (p.streakDays || 0) >= 3,
  },
  {
    id: "streak-7",
    title: "Habit Builder",
    description: "Maintained a 7-day study streak with daily engagement.",
    icon: "streak-7",
    category: "streak",
    check: (p) => (p.streakDays || 0) >= 7,
  },
  {
    id: "streak-10",
    title: "10 Day Streak",
    description: "Dedication unlocked: 10 consecutive days visiting the Academy.",
    icon: "streak-7",
    category: "streak",
    check: (p) => (p.streakDays || 0) >= 10,
  },
  {
    id: "first-prompt",
    title: "Prompt Crafter",
    description: "Designed and saved a custom enterprise prompt to your local library.",
    icon: "first-prompt",
    category: "tools",
    check: (p) => (p.savedCustomPrompts?.length || 0) >= 1,
  },
  {
    id: "first-mission",
    title: "Mission Operative",
    description: "Passed your first prompt challenge mission with grade validation.",
    icon: "perfect-assessment",
    category: "mastery",
    check: (p) => (p.completedMissions?.length || 0) >= 1,
  },
  {
    id: "halfway-scholar",
    title: "Halfway Scholar",
    description: "Completed 8 or more curriculum lessons across modules.",
    icon: "level-up",
    category: "curriculum",
    check: (p) => (p.completedLessons?.length || 0) >= 8,
  },
  {
    id: "prompt-architect",
    title: "Prompt Architect",
    description: "Mastered all 16 curriculum lessons in Ecorp Academy.",
    icon: "ai-master",
    category: "mastery",
    check: (p) => (p.completedLessons?.length || 0) >= 16,
  },
  {
    id: "prompts-10",
    title: "10 Prompts Engineered",
    description: "Designed and executed 10 prompts across the sandbox and challenges.",
    icon: "first-prompt",
    category: "tools",
    check: (p) => (p.promptsEngineeredCount || 0) >= 10,
  },
  {
    id: "prompts-50",
    title: "50 Prompts Engineered",
    description: "Designed and executed 50 prompts across the sandbox and challenges.",
    icon: "sandbox-2",
    category: "tools",
    check: (p) => (p.promptsEngineeredCount || 0) >= 50,
  },
  {
    id: "prompts-100",
    title: "100 Prompts Engineered",
    description: "Designed and executed 100 prompts across the sandbox and challenges.",
    icon: "ai-master",
    category: "mastery",
    check: (p) => (p.promptsEngineeredCount || 0) >= 100,
  },
];

// Event emitter for achievement unlocked notifications
type AchievementListener = (achievement: Achievement) => void;
const listeners = new Set<AchievementListener>();

export function subscribeToAchievementUnlocked(fn: AchievementListener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function notifyAchievementUnlocked(achievement: Achievement): void {
  listeners.forEach((fn) => {
    try {
      fn(achievement);
    } catch (e) {
      console.error("Error in achievement notification listener", e);
    }
  });
}

/**
 * Checks current user progress against all milestone definitions.
 * Returns any newly unlocked achievements and emits notification events.
 */
export function evaluateUserAchievements(progress: UserProgress): {
  newAchievements: Achievement[];
  allAchievements: Achievement[];
} {
  const existingIds = new Set((progress.achievements || []).map((a) => a.id));
  const newAchievements: Achievement[] = [];

  for (const milestone of MILESTONE_DEFINITIONS) {
    if (!existingIds.has(milestone.id) && milestone.check(progress)) {
      const unlocked: Achievement = {
        id: milestone.id,
        title: milestone.title,
        description: milestone.description,
        icon: milestone.icon,
        earnedAt: Date.now(),
      };
      newAchievements.push(unlocked);
      existingIds.add(milestone.id);
      // Trigger notification event
      notifyAchievementUnlocked(unlocked);
    }
  }

  const allAchievements = [...(progress.achievements || []), ...newAchievements];
  return { newAchievements, allAchievements };
}
