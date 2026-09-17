import { Lesson } from "../types";

export interface ProgressModel {
  completed: number;
  total: number;
  percentage: number;
  current: number;
  remaining: number;
}

/**
 * Calculates a canonical progress model for any list of lessons and completed IDs.
 */
export function calculateProgressModel(
  completedIds: string[] = [],
  allLessons: Lesson[] = []
): ProgressModel {
  const total = allLessons.length;
  const completedSet = new Set(completedIds);
  const completed = allLessons.filter((l) => completedSet.has(l.id)).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const current = Math.min(completed + 1, total);
  const remaining = Math.max(0, total - completed);

  return {
    completed,
    total,
    percentage,
    current,
    remaining,
  };
}

/**
 * Calculates truthful weekly activity count.
 * Checks how many lessons were completed within the last 7 days.
 */
export function getWeeklyCompletedCount(
  completedLessonsWithTimestamps: { lessonId: string; completedAt: string }[] = []
): number {
  if (!completedLessonsWithTimestamps.length) return 0;
  
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return completedLessonsWithTimestamps.filter((item) => {
    const time = new Date(item.completedAt).getTime();
    return !isNaN(time) && time >= sevenDaysAgo;
  }).length;
}
