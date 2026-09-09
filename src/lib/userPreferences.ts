/**
 * User Preferences Persistence Layer
 * 
 * Manages persistent user configuration in localStorage including:
 * - Theme mode ('dark' | 'light' | 'system')
 * - Distraction-free / Focus mode toggle
 * - Preferred language ('en' | 'am')
 * - Playground AI execution mode ('real' | 'mock')
 * - Sampling parameters (temperature, topP)
 * 
 * Supports schema validation, safe migration from legacy keys,
 * cross-tab synchronization, and resilient fallback handling.
 */

export type ThemeMode = 'dark' | 'light' | 'system';
export type AppLanguage = 'en' | 'am';
export type AiExecutionMode = 'mock' | 'real';

export interface UserPreferences {
  theme: ThemeMode;
  isDistractionFreeMode: boolean;
  language: AppLanguage;
  aiMode: AiExecutionMode;
  temperature: number;
  topP: number;
}

export const PREFERENCES_STORAGE_KEY = "ecorp_user_preferences_v1";
export const LEGACY_THEME_KEY = "ecorp_theme";
export const LEGACY_LANG_KEY = "ecorp_academy_lang";
export const PREFERENCES_CHANGED_EVENT = "ecorp:preferences-changed";

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  isDistractionFreeMode: false,
  language: 'en',
  aiMode: 'real',
  temperature: 0.3,
  topP: 0.95,
};

/**
 * Validates and normalizes user preferences object
 */
export function sanitizePreferences(input: any): UserPreferences {
  if (!input || typeof input !== 'object') {
    return { ...DEFAULT_USER_PREFERENCES };
  }

  const validTheme: ThemeMode = ['dark', 'light', 'system'].includes(input.theme)
    ? input.theme
    : DEFAULT_USER_PREFERENCES.theme;

  const validDistractionFree = typeof input.isDistractionFreeMode === 'boolean'
    ? input.isDistractionFreeMode
    : DEFAULT_USER_PREFERENCES.isDistractionFreeMode;

  const validLanguage: AppLanguage = ['en', 'am'].includes(input.language)
    ? input.language
    : DEFAULT_USER_PREFERENCES.language;

  const validAiMode: AiExecutionMode = ['mock', 'real'].includes(input.aiMode)
    ? input.aiMode
    : DEFAULT_USER_PREFERENCES.aiMode;

  const validTemperature = typeof input.temperature === 'number' && !isNaN(input.temperature)
    ? Math.max(0, Math.min(2, input.temperature))
    : DEFAULT_USER_PREFERENCES.temperature;

  const validTopP = typeof input.topP === 'number' && !isNaN(input.topP)
    ? Math.max(0, Math.min(1, input.topP))
    : DEFAULT_USER_PREFERENCES.topP;

  return {
    theme: validTheme,
    isDistractionFreeMode: validDistractionFree,
    language: validLanguage,
    aiMode: validAiMode,
    temperature: validTemperature,
    topP: validTopP,
  };
}

/**
 * Loads user preferences from localStorage with fallback to legacy keys and defaults
 */
export function loadUserPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_USER_PREFERENCES };
  }

  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    let loaded: Partial<UserPreferences> = {};

    if (raw) {
      try {
        loaded = JSON.parse(raw);
      } catch (err) {
        console.warn("Failed to parse stored user preferences, resetting to defaults", err);
      }
    }

    // Check legacy theme key if not set in primary preferences
    if (!loaded.theme) {
      const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY) as ThemeMode | null;
      if (legacyTheme && ['dark', 'light', 'system'].includes(legacyTheme)) {
        loaded.theme = legacyTheme;
      }
    }

    // Check legacy language key if not set in primary preferences
    if (!loaded.language) {
      const legacyLang = localStorage.getItem(LEGACY_LANG_KEY) as AppLanguage | null;
      if (legacyLang && ['en', 'am'].includes(legacyLang)) {
        loaded.language = legacyLang;
      }
    }

    const sanitized = sanitizePreferences({ ...DEFAULT_USER_PREFERENCES, ...loaded });
    return sanitized;
  } catch (err) {
    console.warn("Could not access localStorage for user preferences", err);
    return { ...DEFAULT_USER_PREFERENCES };
  }
}

/**
 * Saves partial or complete user preferences to localStorage
 */
export function saveUserPreferences(partial: Partial<UserPreferences>): UserPreferences {
  if (typeof window === 'undefined') {
    return sanitizePreferences(partial);
  }

  try {
    const current = loadUserPreferences();
    const updated = sanitizePreferences({ ...current, ...partial });

    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));

    // Mirror legacy keys for external components that might inspect them directly
    if (partial.theme) {
      localStorage.setItem(LEGACY_THEME_KEY, updated.theme);
    }
    if (partial.language) {
      localStorage.setItem(LEGACY_LANG_KEY, updated.language);
    }

    // Notify listeners in same window
    window.dispatchEvent(
      new CustomEvent(PREFERENCES_CHANGED_EVENT, { detail: updated })
    );

    return updated;
  } catch (err) {
    console.warn("Failed to save user preferences to localStorage", err);
    return sanitizePreferences(partial);
  }
}

/**
 * Saves an individual preference key
 */
export function savePreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
): UserPreferences {
  return saveUserPreferences({ [key]: value } as Partial<UserPreferences>);
}

/**
 * Subscribes to preference changes across tabs or in-window updates
 */
export function subscribeToPreferences(
  callback: (prefs: UserPreferences) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const ce = e as CustomEvent<UserPreferences>;
    if (ce.detail) {
      callback(ce.detail);
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (
      e.key === PREFERENCES_STORAGE_KEY ||
      e.key === LEGACY_THEME_KEY ||
      e.key === LEGACY_LANG_KEY
    ) {
      callback(loadUserPreferences());
    }
  };

  window.addEventListener(PREFERENCES_CHANGED_EVENT, handleCustomEvent);
  window.addEventListener("storage", handleStorageEvent);

  return () => {
    window.removeEventListener(PREFERENCES_CHANGED_EVENT, handleCustomEvent);
    window.removeEventListener("storage", handleStorageEvent);
  };
}
