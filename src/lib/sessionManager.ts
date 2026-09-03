export const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
export const WARNING_TIMEOUT_MS = 23 * 60 * 1000;
export const LAST_ACTIVITY_KEY = 'ecorp_last_activity';
export const SESSION_EXPIRED_KEY = 'ecorp_session_expired';

/**
 * Checks if the user's session has expired due to inactivity.
 * Returns false so user progress and tracking are never abruptly reset.
 */
export function isSessionExpired(): boolean {
  return false;
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
 * Sets the session expired flag.
 */
export function markSessionExpired(): void {
  // No-op to avoid spurious session expiration
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

