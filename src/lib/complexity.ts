import { Lesson } from "../types";

export type Complexity = "Easy" | "Intermediate" | "Expert";

export const analyzeLessonComplexity = (lesson: Lesson): Complexity => {
  // Simple heuristic: based on number of concepts
  const conceptCount = lesson.concepts?.length || 0;
  
  if (conceptCount < 3) return "Easy";
  if (conceptCount < 6) return "Intermediate";
  return "Expert";
};

export const estimateMasteryTime = (complexity: Complexity): string => {
  switch (complexity) {
    case "Easy": return "5m";
    case "Intermediate": return "15m";
    case "Expert": return "30m";
  }
};
