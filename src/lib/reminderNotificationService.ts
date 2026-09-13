/**
 * Learner Inactivity & Daily Reminder Notification Service
 * 
 * Handles detecting missed learning days, managing mobile & browser
 * notification permissions, scheduling local alerts, and triggering
 * engaging in-app reminder popups.
 */

export interface InactivityReminderState {
  hasMissedDays: boolean;
  missedDaysCount: number;
  lastActivityDateStr: string | null;
  shouldShowReminder: boolean;
  notificationsSupported: boolean;
  permissionStatus: NotificationPermission | 'unsupported';
}

const REMINDER_DISMISSED_KEY = "ecorp_learning_reminder_dismissed_date";
const REMINDER_SNOOZE_KEY = "ecorp_learning_reminder_snooze_until";
const NOTIFICATIONS_OPT_IN_KEY = "ecorp_notifications_enabled";

/**
 * Returns today's ISO date string (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Calculates how many days have elapsed since the user's last recorded learning activity.
 */
export function calculateDaysSinceLastActivity(lastActivityDateStr?: string | null): number {
  if (!lastActivityDateStr) return 0;
  
  const cleanDateStr = lastActivityDateStr.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDateStr)) return 0;

  const lastDate = new Date(cleanDateStr + "T00:00:00Z");
  const todayDate = new Date(getTodayDateString() + "T00:00:00Z");

  const diffMs = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

/**
 * Checks if the reminder is currently snoozed or already dismissed for today.
 */
export function isReminderMutedToday(): boolean {
  if (typeof window === "undefined" || !window.localStorage) return false;

  try {
    const today = getTodayDateString();
    const dismissedDate = localStorage.getItem(REMINDER_DISMISSED_KEY);
    if (dismissedDate === today) {
      return true;
    }

    const snoozeUntil = localStorage.getItem(REMINDER_SNOOZE_KEY);
    if (snoozeUntil) {
      const snoozeTime = parseInt(snoozeUntil, 10);
      if (Date.now() < snoozeTime) {
        return true;
      }
    }
  } catch (err) {
    console.warn("Error checking reminder mute state", err);
  }

  return false;
}

/**
 * Dismisses the reminder for the rest of today.
 */
export function dismissReminderForToday(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem(REMINDER_DISMISSED_KEY, getTodayDateString());
  } catch (err) {
    console.warn("Failed to save reminder dismissal", err);
  }
}

/**
 * Snoozes the reminder for a specified number of hours.
 */
export function snoozeReminder(hours: number = 2): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    const snoozeUntil = Date.now() + hours * 60 * 60 * 1000;
    localStorage.setItem(REMINDER_SNOOZE_KEY, snoozeUntil.toString());
  } catch (err) {
    console.warn("Failed to set reminder snooze", err);
  }
}

/**
 * Clears snooze/dismissal flags (useful for manual trigger or testing).
 */
export function resetReminderMuteState(): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.removeItem(REMINDER_DISMISSED_KEY);
    localStorage.removeItem(REMINDER_SNOOZE_KEY);
  } catch (err) {
    console.warn("Failed to reset reminder state", err);
  }
}

/**
 * Checks if Web Notifications are supported and permitted.
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Requests native browser/mobile push notification permission.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      localStorage.setItem(NOTIFICATIONS_OPT_IN_KEY, "true");
      return true;
    }
    return false;
  } catch (err) {
    console.warn("Notification permission request failed", err);
    return false;
  }
}

/**
 * Sends a native system notification if permitted.
 */
export function sendNativeSystemReminder(title: string, body: string, icon = "/favicon.ico"): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: "ecorp-learning-reminder",
    });
  } catch (err) {
    console.warn("Could not dispatch native notification", err);
  }
}

/**
 * Evaluates the full inactivity state for the learner.
 */
export function evaluateLearnerInactivity(
  lastActivityDateStr?: string | null,
  loginHistory?: string[]
): InactivityReminderState {
  const notificationsSupported = typeof window !== "undefined" && "Notification" in window;
  const permissionStatus = getNotificationPermissionStatus();

  // Find most recent learning date
  let effectiveDate = lastActivityDateStr;
  if (!effectiveDate && loginHistory && loginHistory.length > 0) {
    const sorted = [...loginHistory].sort().reverse();
    effectiveDate = sorted[0];
  }

  const missedDays = calculateDaysSinceLastActivity(effectiveDate);
  const hasMissedDays = missedDays >= 1;
  const isMuted = isReminderMutedToday();

  return {
    hasMissedDays,
    missedDaysCount: missedDays,
    lastActivityDateStr: effectiveDate || null,
    shouldShowReminder: hasMissedDays && !isMuted,
    notificationsSupported,
    permissionStatus,
  };
}
