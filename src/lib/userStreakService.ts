/**
 * Central User Service for Daily Streak Management
 * 
 * Guarantees that daily streak incrementation logic triggers strictly once per calendar day
 * per user, and prevents duplicate increments on page refreshes, tab reloads, or redundant
 * authentication state transitions.
 */

export function getUtcDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

// In-memory cache of evaluated user streaks for the current session lifecycle
const sessionProcessedDates = new Map<string, string>();

/**
 * Normalizes any timestamp or date representation into a clean YYYY-MM-DD string.
 */
export function normalizeDateString(rawDate?: unknown): string | null {
  if (!rawDate || typeof rawDate !== "string") return null;
  const trimmed = rawDate.trim();
  const candidate = trimmed.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    return candidate;
  }
  return null;
}

/**
 * Storage key for persisting the last calendar day on which a user's streak was processed.
 */
function getStreakStorageKey(uid: string): string {
  return `ecorp_streak_evaluated_${uid}`;
}

/**
 * Checks if the daily streak calculation has already been executed for this user today.
 */
export function isStreakAlreadyEvaluatedToday(uid: string, todayStr: string = getUtcDateString()): boolean {
  if (sessionProcessedDates.get(uid) === todayStr) {
    return true;
  }
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = localStorage.getItem(getStreakStorageKey(uid));
      if (stored === todayStr) {
        sessionProcessedDates.set(uid, todayStr);
        return true;
      }
    } catch {
      // Ignore storage access errors
    }
  }
  return false;
}

/**
 * Records that the daily streak has been evaluated/processed for the user today.
 */
export function markStreakEvaluatedToday(uid: string, todayStr: string = getUtcDateString()): void {
  sessionProcessedDates.set(uid, todayStr);
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(getStreakStorageKey(uid), todayStr);
    } catch {
      // Ignore storage access errors
    }
  }
}

export interface StreakEvaluationResult {
  streak: number;
  date: string;
  hasIncremented: boolean;
}

/**
 * Pure evaluation function for calculating the user's daily streak given candidate dates and existing streak.
 * 
 * Invariants:
 * - Triggers increment logic strictly ONCE per calendar day (UTC).
 * - If already evaluated or active on the same calendar day: preserves streak without incrementing.
 * - If last active yesterday (diffDays === 1): increments streak by 1.
 * - If last active > 1 day ago (diffDays > 1): resets streak to 1.
 * - If no prior record: initializes streak to existingStreak (minimum 1).
 */
export function evaluateUserDailyStreak(params: {
  uid: string;
  candidateDates: unknown[];
  currentStreak: number;
  todayStr?: string;
}): StreakEvaluationResult {
  const { uid, candidateDates, currentStreak } = params;
  const todayStr = params.todayStr || getUtcDateString();
  const safeCurrentStreak = Math.max(1, currentStreak || 1);

  // 1. If this user was already evaluated today in this session or browser, never increment again
  if (isStreakAlreadyEvaluatedToday(uid, todayStr)) {
    return {
      streak: safeCurrentStreak,
      date: todayStr,
      hasIncremented: false,
    };
  }

  // 2. Normalize and sort all recorded activity and login dates
  const validDates = candidateDates
    .map(normalizeDateString)
    .filter((d): d is string => d !== null)
    .sort()
    .reverse();

  // If ANY candidate date matches today, the user is already recorded as active today
  if (validDates.includes(todayStr)) {
    markStreakEvaluatedToday(uid, todayStr);
    return {
      streak: safeCurrentStreak,
      date: todayStr,
      hasIncremented: false,
    };
  }

  // If no prior dates exist, initialize without incrementing
  const mostRecentDate = validDates[0];
  if (!mostRecentDate) {
    markStreakEvaluatedToday(uid, todayStr);
    return {
      streak: safeCurrentStreak,
      date: todayStr,
      hasIncremented: false,
    };
  }

  // 3. Compute calendar day difference
  const lastDateObj = new Date(mostRecentDate + "T00:00:00Z");
  const todayDateObj = new Date(todayStr + "T00:00:00Z");
  const diffMs = todayDateObj.getTime() - lastDateObj.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  markStreakEvaluatedToday(uid, todayStr);

  if (diffDays === 1) {
    // Exactly yesterday: consecutive daily login increment
    return {
      streak: safeCurrentStreak + 1,
      date: todayStr,
      hasIncremented: true,
    };
  } else if (diffDays > 1) {
    // More than 1 day elapsed: streak broken, reset to 1
    return {
      streak: 1,
      date: todayStr,
      hasIncremented: false,
    };
  }

  // Same day or clock skew: retain streak
  return {
    streak: safeCurrentStreak,
    date: todayStr,
    hasIncremented: false,
  };
}
