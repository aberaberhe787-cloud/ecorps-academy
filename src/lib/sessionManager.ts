export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
export const WARNING_TIMEOUT_MS = 25 * 60 * 1000; // 25 minutes
export const LAST_ACTIVITY_KEY = 'ecorp_last_activity';
export const SESSION_EXPIRED_KEY = 'ecorp_session_expired';

let lastRecordThrottle = 0;

/**
 * Returns the authoritative last user activity epoch timestamp from storage.
 */
export function getLastActivity(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!raw) return null;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

/**
 * Checks if the user's session has expired due to inactivity (>= 30 minutes).
 */
export function isSessionExpired(): boolean {
  const last = getLastActivity();
  if (!last) return false;
  return (Date.now() - last) >= SESSION_TIMEOUT_MS;
}

/**
 * Checks if the user is in the inactivity warning window (between 25 and 30 minutes).
 */
export function isSessionInWarning(): boolean {
  const last = getLastActivity();
  if (!last) return false;
  const elapsed = Date.now() - last;
  return elapsed >= WARNING_TIMEOUT_MS && elapsed < SESSION_TIMEOUT_MS;
}

/**
 * Returns remaining milliseconds before session timeout.
 */
export function getRemainingSessionMs(): number {
  const last = getLastActivity();
  if (!last) return SESSION_TIMEOUT_MS;
  const elapsed = Date.now() - last;
  return Math.max(0, SESSION_TIMEOUT_MS - elapsed);
}

/**
 * Updates the user's last activity timestamp in localStorage.
 * Throttles writes to at most once per 2 seconds to avoid excessive storage I/O.
 */
export function recordUserActivity(force = false): void {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  if (!force && (now - lastRecordThrottle < 2000)) {
    return;
  }
  lastRecordThrottle = now;
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Clears the session activity record from localStorage.
 */
export function clearSessionActivity(): void {
  if (typeof window === 'undefined') return;
  lastRecordThrottle = 0;
  try {
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Sets the session expired flag so LoginPage can inform the learner.
 */
export function markSessionExpired(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_EXPIRED_KEY, 'true');
  } catch {
    // Ignore
  }
}

/**
 * Consumes and clears the session expired notice flag.
 */
export function consumeSessionExpiredNotice(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const expired = localStorage.getItem(SESSION_EXPIRED_KEY);
    if (expired === 'true') {
      localStorage.removeItem(SESSION_EXPIRED_KEY);
      return true;
    }
  } catch {
    // Ignore
  }
  return false;
}


