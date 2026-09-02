export const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity
export const WARNING_TIMEOUT_MS = 25 * 60 * 1000; // 25 minutes warning threshold
export const LAST_ACTIVITY_KEY = 'ecorp_last_activity';
export const SESSION_EXPIRED_KEY = 'ecorp_session_expired';

/**
 * Checks if the user's session has expired due to inactivity.
 * Returns true if no activity is recorded or if elapsed time >= SESSION_TIMEOUT_MS.
 */
export function isSessionExpired(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
    if (!lastActivityStr) {
      // If there's no activity record at all, treat as expired
      return true;
    }
    const lastActivity = parseInt(lastActivityStr, 10);
    if (isNaN(lastActivity) || lastActivity <= 0) {
      return true;
    }
    const elapsed = Date.now() - lastActivity;
    return elapsed >= SESSION_TIMEOUT_MS;
  } catch {
    return false;
  }
}

/**
 * Updates the user's last activity timestamp in localStorage.
 */
export function recordUserActivity(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Clears the session activity record from localStorage.
 */
export function clearSessionActivity(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LAST_ACTIVITY_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Sets the session expired flag so the login screen can show a clear notice.
 */
export function markSessionExpired(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_EXPIRED_KEY, 'true');
    clearSessionActivity();
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
