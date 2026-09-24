import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";
import confetti from "canvas-confetti";
import {
  NavTab,
  ExecutionResult,
  UserProgress,
  MissionEvaluationResult,
  Mission,
  CurriculumModule,
  LessonFeedback,
  SavedCodeSnippet,
  ReviewScheduleItem,
  WorkplaceProject,
  ProgressModel
} from "../types";
import { missions } from "../data/missionsData";
import { FOUNDATION_LESSONS } from "../views/PromptEngineeringPath";
import { analyzePrompt } from "../lib/promptAnalyzer";
import { translations, Language, I18nTranslations } from "../i18n/translations";
import { amharicCurriculumModules } from "../i18n/amharicLessons";
import { curriculumModules } from "../data/lessonsData";
import type { User } from "firebase/auth";
import { CompetencyState } from "../types";
import { deriveCompetencyStates } from "../lib/competencyModel";
import {
  auth,
  db,
  useEmulatorsIfDev,
  subscribeToUserDoc,
  readUserDoc,
  signOut as fbSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from "../lib/firebaseClient";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  clearSessionActivity,
  isSessionExpired,
  recordUserActivity,
  markSessionExpired,
} from "../lib/sessionManager";
import { logger } from "../lib/logger";
import {
  evaluateUserDailyStreak,
  markStreakEvaluatedToday,
  isStreakAlreadyEvaluatedToday,
} from "../lib/userStreakService";
import {
  callGeminiGenerate,
  callGeminiEvaluate,
} from "../lib/geminiApi";
import { generateMockAiResponse } from "../lib/mockAiEngine";
import {
  robustApiFetch,
  isPageResumedAfterLongIdle,
} from "../lib/apiErrorHandler";
import { evaluateUserAchievements } from "../lib/achievementEngine";
import {
  loadUserPreferences,
  savePreference,
  saveUserPreferences,
  subscribeToPreferences,
  type UserPreferences,
} from "../lib/userPreferences";

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeLessonId: string | null;
  setActiveLessonId: (id: string | null) => void;
  activeMissionId: string | null;
  setActiveMissionId: (id: string | null) => void;
  playgroundSubTab: "sandbox" | "missions" | "comparison" | "history" | "saved" | "ctf" | "lab";
  setPlaygroundSubTab: (tab: "sandbox" | "missions" | "comparison" | "history" | "saved" | "ctf" | "lab") => void;
  openSandbox: (subTab?: "sandbox" | "missions" | "comparison" | "history" | "saved" | "ctf" | "lab") => void;

  // Language & Translation
  language: Language;
  setLanguage: (lang: Language) => void;
  t: I18nTranslations;
  currentCurriculum: CurriculumModule[];
  
  // Playground State
  prompt: string;
  setPrompt: (p: string) => void;
  systemInstruction: string;
  setSystemInstruction: (s: string) => void;
  temperature: number;
  setTemperature: (t: number) => void;
  topP: number;
  setTopP: (p: number) => void;
  aiMode: "mock" | "real";
  setAiMode: (m: "mock" | "real") => void;
  hasRealApiAvailable: boolean;
  
  // Execution
  isExecuting: boolean;
  lastResult: ExecutionResult | null;
  executionHistory: ExecutionResult[];
  executeCurrentPrompt: (customPrompt?: string, customSystemInstruction?: string, isolated?: boolean) => Promise<ExecutionResult>;
  clearOutput: () => void;
  
  // Comparison Mode
  isComparisonMode: boolean;
  setIsComparisonMode: (c: boolean) => void;
  comparisonPromptB: string;
  setComparisonPromptB: (p: string) => void;
  comparisonResultB: ExecutionResult | null;
  executeComparison: () => Promise<void>;
  
  // Mission Evaluation
  isEvaluatingMission: boolean;
  missionResult: MissionEvaluationResult | null;
  evaluateMission: (missionId: string, submittedPrompt: string) => Promise<MissionEvaluationResult>;
  
  // Theme
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
  isDarkMode: boolean;

  // User Progress
  userProgress: UserProgress;
  setUserProgress: React.Dispatch<React.SetStateAction<UserProgress>>;
  progressModel: ProgressModel;
  curriculumProgressPercent: number;
  resumeCurriculum: () => string | null;
  persistenceStatus: 'synced' | 'saving' | 'offline' | 'error';
  isOnline: boolean;
  retrySync: () => Promise<void>;
  markLessonComplete: (lessonId: string) => void;
  addXp: (amount: number) => void;
  completeAssessment: (assessmentId: string, submission: string) => void;
  saveCustomPrompt: (title: string, promptText: string) => void;
  deleteCustomPrompt: (id: string) => void;
  saveCodeSnippet: (snippet: Omit<SavedCodeSnippet, "id" | "createdAt">) => void;
  deleteCodeSnippet: (id: string) => void;
  toggleBookmarkPattern: (patternId: string) => void;
  toggleBookmarkLesson: (lessonId: string) => void;
  submitLessonFeedback: (feedback: LessonFeedback) => void;
  completeScheduledReview: (lessonId: string) => void;
  createWorkplaceProject: (project: Omit<WorkplaceProject, "id" | "createdAt" | "updatedAt">) => void;
  updateWorkplaceProject: (id: string, update: Partial<Pick<WorkplaceProject, "status" | "title" | "problem" | "successMetric" | "linkedMissionIds">>) => void;
  syncProgressToDb: (email?: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // Navigation & Search Deep-Linking
  selectedPatternId: string | null;
  setSelectedPatternId: (id: string | null) => void;
  selectedResourceFilter: string | null;
  setSelectedResourceFilter: (filter: string | null) => void;

  // LMS Focus / Distraction-free mode
  isDistractionFreeMode: boolean;
  setIsDistractionFreeMode: (v: boolean) => void;

  // Unified Learning & Competency Architecture (P2)
  user: User | null;
  competencyStates: CompetencyState[];

  // User Preferences Persistence
  userPreferences: UserPreferences;
  updateUserPreferences: (partial: Partial<UserPreferences>) => void;
  
  // Auth Modal
  isAuthModalOpen: boolean;
  authModalMessage: string;
  openAuthModal: (msg?: string) => void;
  closeAuthModal: () => void;

  // Helper to load into playground
  loadIntoPlayground: (options: {
    prompt: string;
    systemInstruction?: string;
    temperature?: number;
    missionId?: string;
    subTab?: "sandbox" | "missions" | "comparison" | "history" | "saved" | "ctf";
  }) => void;
}

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const WARNING_TIMEOUT_MS = 25 * 60 * 1000;

const STORAGE_KEY = "promptlab_user_progress_v1";
const USERS_COLLECTION = "users";

const initialProgress: UserProgress = {
  completedLessons: [],
  completedMissions: [],
  completedAssessments: [],
  missionEvidence: {},
  missionScores: {},
  bookmarkedPatterns: [],
  bookmarkedLessons: [],
  savedCustomPrompts: [],
  savedCodeSnippets: [],
  xp: 0,
  streakDays: 0,
  lastActivityDate: getUtcDateString(),
  loginHistory: [getUtcDateString()],
  achievements: [],
  promptsEngineeredCount: 0
};

const cleanGuestProgress: UserProgress = {
  completedLessons: [],
  completedMissions: [],
  completedAssessments: [],
  missionEvidence: {},
  missionScores: {},
  bookmarkedPatterns: [],
  bookmarkedLessons: [],
  savedCustomPrompts: [],
  savedCodeSnippets: [],
  xp: 0,
  streakDays: 0,
  lastActivityDate: undefined,
  loginHistory: [],
  achievements: [],
  promptsEngineeredCount: 0
};

function getProgressFingerprint(p: UserProgress): string {
  return JSON.stringify({
    xp: p.xp,
    streak: p.streakDays,
    lessons: [...p.completedLessons].sort(),
    missions: [...p.completedMissions].sort(),
    scores: p.missionScores,
    prompts: p.savedCustomPrompts.map(x => ({ id: x.id, title: x.title, prompt: x.prompt })),
    bookmarks: [...p.bookmarkedPatterns].sort(),
    bookmarkedLessons: [...(p.bookmarkedLessons || [])].sort(),
    achievements: p.achievements.map(x => x.id).sort(),
    promptsEngineeredCount: p.promptsEngineeredCount || 0,
    reviews: (p.reviewSchedule || []).map((review) => [review.lessonId, review.dueAt, review.intervalDays]),
    projects: (p.workplaceProjects || []).map((project) => [project.id, project.status, project.updatedAt]),
  });
}

function getUtcDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function computeDailyStreak(lastDateStr?: string, existingStreak = 1): { streak: number; date: string } {
  const todayStr = getUtcDateString();
  const streakBase = Math.max(1, existingStreak);
  if (!lastDateStr) {
    return { streak: streakBase, date: todayStr };
  }
  const cleanDateStr = lastDateStr.slice(0, 10);
  if (cleanDateStr === todayStr) {
    return { streak: streakBase, date: todayStr };
  }
  const lastDate = new Date(cleanDateStr + "T00:00:00Z");
  const todayDate = new Date(todayStr + "T00:00:00Z");
  const diffTime = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return { streak: streakBase + 1, date: todayStr };
  }
  return { streak: streakBase, date: todayStr };
}

function getStorageKeyForUid(uid?: string | null): string {
  return uid ? `promptlab_user_progress_${uid}` : STORAGE_KEY;
}

function loadCachedProgress(uid?: string | null): UserProgress {
  try {
    // If a specific UID is provided, load ONLY from that user's scoped key
    if (uid) {
      const saved = localStorage.getItem(getStorageKeyForUid(uid));
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return {
            ...initialProgress,
            ...parsed,
            completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
            completedMissions: Array.isArray(parsed.completedMissions) ? parsed.completedMissions : [],
            completedAssessments: Array.isArray(parsed.completedAssessments) ? parsed.completedAssessments : [],
            missionScores: parsed.missionScores && typeof parsed.missionScores === 'object' ? parsed.missionScores : {},
            missionEvidence: parsed.missionEvidence && typeof parsed.missionEvidence === 'object' ? parsed.missionEvidence : {},
            bookmarkedPatterns: Array.isArray(parsed.bookmarkedPatterns) ? parsed.bookmarkedPatterns : [],
            bookmarkedLessons: Array.isArray(parsed.bookmarkedLessons) ? parsed.bookmarkedLessons : [],
            savedCustomPrompts: Array.isArray(parsed.savedCustomPrompts) ? parsed.savedCustomPrompts : [],
            reviewSchedule: Array.isArray(parsed.reviewSchedule) ? parsed.reviewSchedule : [],
            workplaceProjects: Array.isArray(parsed.workplaceProjects) ? parsed.workplaceProjects : [],
            achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
            xp: typeof parsed.xp === 'number' ? parsed.xp : initialProgress.xp,
            streakDays: typeof parsed.streakDays === 'number' ? parsed.streakDays : 1,
            curriculumProgressPercent: typeof parsed.curriculumProgressPercent === 'number' ? parsed.curriculumProgressPercent : 0,
            promptsEngineeredCount: typeof parsed.promptsEngineeredCount === 'number' ? parsed.promptsEngineeredCount : 0,
          };
        } catch (e) {
          console.warn("Could not parse UID-scoped cached progress", e);
        }
      }
      return { ...initialProgress };
    }

    // Guest / unauthenticated fallback: return clean guest state
    return { ...cleanGuestProgress };
  } catch (e) {
    console.warn("Could not load cached progress from localStorage", e);
  }
  return { ...cleanGuestProgress };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [activeTab, setActiveTabState] = useState<NavTab>("home");
  
  const setActiveTab = (tab: NavTab) => {
    if (tab !== "home" && !user) {
      openAuthModal("Sign in to access this feature.", tab);
      return;
    }
    setActiveTabState(tab);
  };
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [playgroundSubTab, setPlaygroundSubTab] = useState<"sandbox" | "missions" | "comparison" | "history" | "saved" | "ctf" | "lab">("sandbox");
  
  // Guest Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMessage, setAuthModalMessage] = useState<string>("");
  const [redirectPath, setRedirectPath] = useState<NavTab | null>(null);

  const openAuthModal = (msg?: string, path?: NavTab) => {
    setAuthModalMessage(msg || "Sign in to save your progress and unlock learner features.");
    if (path) setRedirectPath(path);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setRedirectPath(null);
  };
  
  // Persistent user preferences layer (theme, distraction-free mode, language, AI mode, sampling)
  const initialPrefsRef = useRef<UserPreferences>(loadUserPreferences());
  const [userPreferences, setUserPreferencesState] = useState<UserPreferences>(() => initialPrefsRef.current);

  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>(() => {
    return initialPrefsRef.current.theme;
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      let isDark = false;
      if (theme === 'system') {
        isDark = mediaQuery.matches;
      } else {
        isDark = theme === 'dark';
      }
      
      setIsDarkMode(isDark);
      
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.classList.toggle('light', !isDark);
    };
    
    applyTheme(); // Initial application
    
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  const setTheme = (newTheme: 'dark' | 'light' | 'system') => {
    setThemeState(newTheme);
    const updated = savePreference('theme', newTheme);
    setUserPreferencesState(updated);
  };

  // Progress state & Persistence Lifecycle
  type PersistenceLifecycle = 'idle' | 'hydrating' | 'ready' | 'saving' | 'error' | 'loggingOut';
  type PersistenceStatus = 'synced' | 'saving' | 'offline' | 'error';

  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    return loadCachedProgress(null);
  });
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceStatus>('synced');
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  const persistenceLifecycle = useRef<PersistenceLifecycle>('idle');
  const firestoreUserId = useRef<string | null>(null);
  const latestUserProgressRef = useRef<UserProgress>(userProgress);
  const lastSyncedFingerprint = useRef<string>(getProgressFingerprint(userProgress));
  const syncTimerRef = useRef<number | null>(null);
  const activeUnsubscribeRef = useRef<(() => void) | null>(null);

  // Synchronize ref whenever userProgress changes
  useEffect(() => {
    latestUserProgressRef.current = userProgress;
  }, [userProgress]);

  // Monitor network online/offline state to prevent data loss and auto-sync when reconnected
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      logger.info('ECORP:CONNECTIVITY', 'Internet connectivity restored', 'Internet connectivity restored');
      setIsOnline(true);
      setPersistenceStatus('synced');
      const user = auth.currentUser;
      if (user && firestoreUserId.current === user.uid) {
        void persistUserProgress(user.uid, latestUserProgressRef.current, { force: true, reason: 'online_reconnect' });
      }
    };

    const handleOffline = () => {
      logger.info('ECORP:CONNECTIVITY', 'Internet connectivity lost: preserving all data locally', 'Internet connectivity lost: preserving all data locally');
      setIsOnline(false);
      setPersistenceStatus('offline');
      try {
        const uid = firestoreUserId.current;
        if (uid) {
          localStorage.setItem(getStorageKeyForUid(uid), JSON.stringify(latestUserProgressRef.current));
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(latestUserProgressRef.current));
        }
      } catch (cacheErr) {
        console.warn('Failed local offline cache write', cacheErr);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Single Authoritative Persistence Pipeline
  const persistUserProgress = async (
    uid: string,
    progressToPersist: UserProgress,
    options?: { force?: boolean; reason?: string }
  ): Promise<{ success: boolean; error?: string; code?: string }> => {
    const currentUser = auth.currentUser;
    const opId = `op-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const reason = options?.reason || 'auto_sync';

    // Offline check: Immediately safeguard data in local storage without failing destructively
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      logger.debug('ECORP:PERSISTENCE', `OFFLINE_SAFEGUARD: Progress stored locally uid=${uid}`);
      try {
        localStorage.setItem(getStorageKeyForUid(uid), JSON.stringify(progressToPersist));
      } catch (cacheErr) {
        console.warn("Could not cache user progress locally", cacheErr);
      }
      setIsOnline(false);
      setPersistenceStatus('offline');
      return { success: false, error: 'Offline: progress safely saved locally', code: 'offline' };
    }

    if (!currentUser || currentUser.uid !== uid) {
      logger.warn('ECORP:PERSISTENCE', `WRITE_ABORTED uid_mismatch opId=${opId} reason=${reason} authUid=${currentUser?.uid} targetUid=${uid}`, 'WRITE_ABORTED');
      return { success: false, error: 'User UID mismatch or unauthenticated' };
    }

    if (!options?.force && (persistenceLifecycle.current === 'hydrating' || persistenceLifecycle.current === 'loggingOut')) {
      logger.warn('ECORP:PERSISTENCE', `WRITE_BLOCKED_BY_LIFECYCLE opId=${opId} state=${persistenceLifecycle.current}`, 'WRITE_BLOCKED_BY_LIFECYCLE');
      return { success: false, error: `Blocked by lifecycle state: ${persistenceLifecycle.current}` };
    }

    const lessonsCount = progressToPersist.completedLessons.length;
    const missionsCount = progressToPersist.completedMissions.length;
    // Safety check: Prevent accidental empty writes over existing remote data
    if (lessonsCount === 0) {
      try {
        const existingSnap = await getDoc(doc(db, USERS_COLLECTION, uid));
        if (existingSnap.exists()) {
          const remoteData = existingSnap.data();
          const remoteLessons = Array.isArray(remoteData?.completedLessons) ? remoteData.completedLessons : [];
          if (remoteLessons.length > 0) {
            logger.warn('ECORP:PERSISTENCE', `ABORT_EMPTY_WRITE: Prevented overwriting ${remoteLessons.length} existing remote lessons with empty list`, 'ABORT_EMPTY_WRITE');
            return { success: false, error: 'Prevented destructive write of empty lessons over existing remote data' };
          }
        }
      } catch {}
    }

    const xp = progressToPersist.xp;
    const timestamp = new Date().toISOString();

    logger.info('ECORP:PERSISTENCE', `WRITE_STARTED uid=${uid} path=users/${uid} opId=${opId} reason=${reason} xp=${xp} lessons=${lessonsCount} missions=${missionsCount} time=${timestamp}`);
    setPersistenceStatus('saving');

    try {
      const lessonsMap = Object.fromEntries(progressToPersist.completedLessons.map(id => [id, true]));
      const totalCurriculumLessons = currentCurriculum
        .flatMap((module) => module.lessons)
        .length;
      const curriculumLessonIds = new Set(
        currentCurriculum.flatMap((module) => module.lessons.map((lesson) => lesson.id))
      );
      const curriculumCompletedCount = progressToPersist.completedLessons.filter((id) =>
        curriculumLessonIds.has(id)
      ).length;
      const progressPercent =
        totalCurriculumLessons > 0
          ? Math.min(
              100,
              Math.round((curriculumCompletedCount / totalCurriculumLessons) * 100)
            )
          : 0;
      const payload = {
        displayName: currentUser.displayName || "Ecorp Scholar",
        photoURL: currentUser.photoURL || null,
        curriculumProgress: curriculumCompletedCount,
        completedLessonCount: curriculumCompletedCount,
        curriculumProgressPercent: progressPercent,
        lastLessonId: progressToPersist.lastLessonId || null,
        lastModuleId: progressToPersist.lastModuleId || null,
        currentStreak: progressToPersist.streakDays,
        streakDays: progressToPersist.streakDays,
        lastActivityDate: progressToPersist.lastActivityDate,
        lastLoginDate: progressToPersist.lastActivityDate,
        loginHistory: progressToPersist.loginHistory || [progressToPersist.lastActivityDate.slice(0, 10)],
        xp: progressToPersist.xp,
        completedLessons: progressToPersist.completedLessons,
        lessons: lessonsMap,
        completedMissions: progressToPersist.completedMissions,
        missionScores: progressToPersist.missionScores,
        completedAssessments: progressToPersist.completedAssessments || [],
        missionEvidence: progressToPersist.missionEvidence || {},
        bookmarkedPatterns: progressToPersist.bookmarkedPatterns,
        savedCustomPrompts: progressToPersist.savedCustomPrompts,
        reviewSchedule: progressToPersist.reviewSchedule || [],
        workplaceProjects: progressToPersist.workplaceProjects || [],
        achievements: progressToPersist.achievements,
        promptsEngineeredCount: progressToPersist.promptsEngineeredCount || 0,
        // Also save progress object for backward-compatibility with progressUtils
        progress: {
          ...progressToPersist,
          curriculumProgressPercent: progressPercent,
        },
      };

      // Set last synced fingerprint BEFORE await to prevent local loop
      lastSyncedFingerprint.current = getProgressFingerprint(progressToPersist);

      await setDoc(doc(db, USERS_COLLECTION, uid), payload, { merge: true });

      try {
        localStorage.setItem(getStorageKeyForUid(uid), JSON.stringify(progressToPersist));
      } catch (cacheErr) {
        console.warn("Could not cache user progress locally", cacheErr);
      }

      logger.info('ECORP:PERSISTENCE', `WRITE_SUCCESS uid=${uid} path=users/${uid} opId=${opId} reason=${reason} xp=${xp} lessons=${lessonsCount} missions=${missionsCount} time=${new Date().toISOString()}`);
      setIsOnline(true);
      setPersistenceStatus('synced');
      return { success: true };
    } catch (err: any) {
      const code = err?.code || 'unknown_error';
      const message = err?.message || String(err);
      logger.error('ECORP:PERSISTENCE', err, `WRITE_FAILED opId=${opId}`);
      
      const isNetwork = !navigator.onLine ||
        code.includes('unavailable') ||
        code.includes('network') ||
        message.toLowerCase().includes('offline') ||
        message.toLowerCase().includes('network') ||
        message.toLowerCase().includes('failed to fetch');

      if (isNetwork) {
        setIsOnline(false);
        setPersistenceStatus('offline');
      } else {
        setPersistenceStatus('error');
      }
      return { success: false, error: message, code };
    }
  };

  const syncProgressToDb = async (_email?: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    await persistUserProgress(currentUser.uid, latestUserProgressRef.current, { reason: 'manual_sync' });
  };

  const retrySync = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    setPersistenceStatus('saving');
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setPersistenceStatus('offline');
      setIsOnline(false);
      return;
    }
    try {
      const res = await robustApiFetch('/api/health', { silent: true }).catch(() => null);
      if (res && res.ok) {
        setIsOnline(true);
      }
    } catch {}
    const result = await persistUserProgress(currentUser.uid, latestUserProgressRef.current, { force: true, reason: 'retry_sync' });
    if (result.success) {
      setIsOnline(true);
      setPersistenceStatus('synced');
    }
  };

  const logout = async () => {
    const user = auth.currentUser;
    const targetUid = user?.uid || firestoreUserId.current;
    const currentProgress = latestUserProgressRef.current;

    logger.info('ECORP:PERSISTENCE', `LOGOUT_STARTED uid=${targetUid || 'none'}`, 'LOGOUT_STARTED');
    persistenceLifecycle.current = 'loggingOut';

    // 1. Cancel pending debounce timer
    if (syncTimerRef.current !== null) {
      window.clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    // 2. Perform final awaited flush write only if user has lessons/progress to save
    if (user && targetUid && currentProgress && currentProgress.completedLessons.length > 0) {
      logger.info('ECORP:PERSISTENCE', `LOGOUT_FLUSH_STARTED uid=${targetUid}`, 'LOGOUT_FLUSH_STARTED');
      try {
        const flushResult = await persistUserProgress(targetUid, currentProgress, { force: true, reason: 'logout_flush' });
        if (flushResult.success) {
          logger.info('ECORP:PERSISTENCE', `LOGOUT_FLUSH_SUCCESS uid=${targetUid}`, 'LOGOUT_FLUSH_SUCCESS');
        } else {
          logger.error('ECORP:PERSISTENCE', { code: flushResult.code, error: flushResult.error }, 'LOGOUT_FLUSH_FAILED');
        }
      } catch (e) {
        console.warn('Logout flush error', e);
      }
    }

    // 3. Unsubscribe real-time listener
    if (activeUnsubscribeRef.current) {
      activeUnsubscribeRef.current();
      activeUnsubscribeRef.current = null;
      logger.info('ECORP:PERSISTENCE', `LISTENER_DETACHED uid=${targetUid || 'none'}`, 'LISTENER_DETACHED');
    }

    // 4. Call Firebase signOut
    try {
      await fbSignOut();
      logger.info('ECORP:PERSISTENCE', 'AUTH_SIGNOUT', 'AUTH_SIGNOUT');
    } catch (signOutErr) {
      logger.error('ECORP:PERSISTENCE', signOutErr, 'SIGNOUT_ERROR');
    }

    // 5. Clear session activity timestamp
    clearSessionActivity();

    // 6. Reset in-memory state cleanly to isolated guest/initial state
    firestoreUserId.current = null;
    persistenceLifecycle.current = 'idle';
    const cleanGuestState = { ...cleanGuestProgress };
    lastSyncedFingerprint.current = getProgressFingerprint(cleanGuestState);
    setUserProgress(cleanGuestState);
    setPersistenceStatus('synced');
    setActiveTab("home");
  };

  // Playground state
  const [prompt, setPrompt] = useState<string>(
    `Act as a Principal Software Engineer conducting a thorough code review.

Review the following TypeScript authentication function for race conditions and token security:

\`\`\`typescript
async function refreshAuthToken(user: User) {
  if (Date.now() > user.tokenExpiry) {
    const newToken = await fetch('/api/token/refresh');
    user.token = newToken;
  }
  return user.token;
}
\`\`\`

Provide:
1. Identified Security / Race Hazard
2. Production-grade surgical fix with concurrency mutex/promise-lock`
  );
  const [systemInstruction, setSystemInstruction] = useState<string>(
    "You are an expert prompt engineer and senior software mentor. Respond with high precision and structured clarity."
  );
  const [temperature, setTemperatureState] = useState<number>(() => initialPrefsRef.current.temperature);
  const [topP, setTopPState] = useState<number>(() => initialPrefsRef.current.topP);
  const [aiMode, setAiModeState] = useState<"mock" | "real">(() => initialPrefsRef.current.aiMode);
  const [hasRealApiAvailable, setHasRealApiAvailable] = useState<boolean>(true);

  const setTemperature = (tVal: number) => {
    setTemperatureState(tVal);
    const updated = savePreference('temperature', tVal);
    setUserPreferencesState(updated);
  };

  const setTopP = (pVal: number) => {
    setTopPState(pVal);
    const updated = savePreference('topP', pVal);
    setUserPreferencesState(updated);
  };

  const setAiMode = (m: "mock" | "real") => {
    setAiModeState(m);
    const updated = savePreference('aiMode', m);
    setUserPreferencesState(updated);
  };

  // Execution state & request lifecycle protection refs
  const activeExecutionIdRef = useRef<number>(0);
  const activeAbortControllerRef = useRef<AbortController | null>(null);
  const activeComparisonSeqARef = useRef<number>(0);
  const activeComparisonSeqBRef = useRef<number>(0);

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);

  // Comparison mode
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [comparisonPromptB, setComparisonPromptB] = useState<string>(
    "Look at this code and tell me if it works:\nfunction refreshAuthToken(user) { ... }"
  );
  const [comparisonResultB, setComparisonResultB] = useState<ExecutionResult | null>(null);

  // LMS Focus / Distraction-free mode persisted in localStorage
  const [isDistractionFreeMode, setIsDistractionFreeModeState] = useState<boolean>(() => {
    return initialPrefsRef.current.isDistractionFreeMode;
  });

  const setIsDistractionFreeMode = (v: boolean) => {
    setIsDistractionFreeModeState(v);
    const updated = savePreference('isDistractionFreeMode', v);
    setUserPreferencesState(updated);
  };

  // Language state defaults to saved preference or English
  const [language, setLanguageState] = useState<Language>(() => {
    return initialPrefsRef.current.language;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const updated = savePreference('language', lang);
    setUserPreferencesState(updated);
  };

  // Bulk preference updater
  const updateUserPreferences = (partial: Partial<UserPreferences>) => {
    if (partial.theme !== undefined) setThemeState(partial.theme);
    if (partial.isDistractionFreeMode !== undefined) setIsDistractionFreeModeState(partial.isDistractionFreeMode);
    if (partial.language !== undefined) setLanguageState(partial.language);
    if (partial.aiMode !== undefined) setAiModeState(partial.aiMode);
    if (partial.temperature !== undefined) setTemperatureState(partial.temperature);
    if (partial.topP !== undefined) setTopPState(partial.topP);
    const updated = saveUserPreferences(partial);
    setUserPreferencesState(updated);
  };

  // Cross-tab and window preference synchronization
  useEffect(() => {
    const unsubscribe = subscribeToPreferences((updated) => {
      setUserPreferencesState(updated);
      setThemeState(updated.theme);
      setIsDistractionFreeModeState(updated.isDistractionFreeMode);
      setLanguageState(updated.language);
      setAiModeState(updated.aiMode);
      setTemperatureState(updated.temperature);
      setTopPState(updated.topP);
    });
    return unsubscribe;
  }, []);

  const t = translations[language];
  const currentCurriculum = language === "am" ? amharicCurriculumModules : curriculumModules;

  // Helper to directly open the sandbox view
  const openSandbox = (subTab: "sandbox" | "missions" | "comparison" | "history" | "saved" | "ctf" | "lab" = "sandbox") => {
    setActiveTab("playground");
    setPlaygroundSubTab(subTab);
    if (subTab === "sandbox") {
      setIsComparisonMode(false);
    } else if (subTab === "comparison") {
      setIsComparisonMode(true);
    }
  };

  // Mission evaluation
  const [isEvaluatingMission, setIsEvaluatingMission] = useState<boolean>(false);
  const [missionResult, setMissionResult] = useState<MissionEvaluationResult | null>(null);

  // Search & Navigation Deep Linking
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [selectedResourceFilter, setSelectedResourceFilter] = useState<string | null>(null);

  // Hydrate each signed-in user from Firestore and update their daily streak.
  useEffect(() => {
    // Connect to emulators if explicitly requested via environment variable
    try { useEmulatorsIfDev(); } catch {}

    const unsubscribeAuth = firebaseOnAuthStateChanged(auth, async (user) => {
      setUser(user);
      // Detach existing listener if user changed
      if (activeUnsubscribeRef.current) {
        activeUnsubscribeRef.current();
        activeUnsubscribeRef.current = null;
        logger.info('ECORP:PERSISTENCE', `LISTENER_DETACHED uid=${firestoreUserId.current || 'none'}`, 'LISTENER_DETACHED');
      }

      if (!user) {
        logger.info('ECORP:PERSISTENCE', 'AUTH_UNAUTHENTICATED', 'AUTH_UNAUTHENTICATED');
        firestoreUserId.current = null;
        persistenceLifecycle.current = 'idle';
        const cached = loadCachedProgress(null);
        lastSyncedFingerprint.current = getProgressFingerprint(cached);
        setUserProgress(cached);
        setPersistenceStatus('synced');
        return;
      }

      logger.info('ECORP:PERSISTENCE', `AUTH_READY uid=${user.uid} email=${user.email || 'none'}`, 'AUTH_READY');
      firestoreUserId.current = user.uid;
      persistenceLifecycle.current = 'hydrating';

      // Load cached state to make UI responsive immediately
      const cached = loadCachedProgress(user.uid);
      if (cached) {
        lastSyncedFingerprint.current = getProgressFingerprint(cached);
        setUserProgress(cached);
      }

      logger.info('ECORP:PERSISTENCE', `HYDRATION_START uid=${user.uid}`, 'HYDRATION_START');
      try {
        const readResult = await readUserDoc(user.uid);

        if (readResult.error) {
          // PHASE 2 CASE C: READ_ERROR
          // Forbidden to initialize or overwrite on error
          logger.error('ECORP:PERSISTENCE', readResult.error, 'HYDRATION_ERROR');
          persistenceLifecycle.current = 'error';
          setPersistenceStatus('offline');
          return;
        }

        if (readResult.exists && readResult.data) {
          // PHASE 2 CASE A: SUCCESS_EXISTS
          const data = readResult.data;
          const progressNested = (data.progress && typeof data.progress === 'object') ? data.progress : {};

          const cachedState = loadCachedProgress(user.uid);

          const existingStreak = typeof data.currentStreak === 'number'
            ? data.currentStreak
            : (typeof data.streakDays === 'number'
                ? data.streakDays
                : (typeof progressNested.streakDays === 'number' ? progressNested.streakDays : 1));

          const maxExistingStreak = Math.max(
            existingStreak,
            cachedState.streakDays || 1,
            1
          );

          // Collect all recorded login and activity dates across Firestore doc, nested progress, and local caches
          const rawCandidateDates = [
            typeof data.lastLoginDate === 'string' ? data.lastLoginDate : null,
            typeof data.lastActivityDate === 'string' ? data.lastActivityDate : null,
            typeof progressNested.lastLoginDate === 'string' ? progressNested.lastLoginDate : null,
            typeof progressNested.lastActivityDate === 'string' ? progressNested.lastActivityDate : null,
            typeof cachedState.lastActivityDate === 'string' ? cachedState.lastActivityDate : null,
          ];

          const streakResult = evaluateUserDailyStreak({
            uid: user.uid,
            candidateDates: rawCandidateDates,
            currentStreak: maxExistingStreak,
          });

          const arrayFromDoc = Array.isArray(data.completedLessons) ? data.completedLessons : [];
          const arrayFromNested = Array.isArray(progressNested.completedLessons) ? progressNested.completedLessons : [];
          const mapKeys = data.lessons && typeof data.lessons === 'object'
            ? Object.keys(data.lessons).filter(k => data.lessons[k])
            : [];

          // Merge completed lessons from this user's cloud doc and isolated local cache
          const mergedLessons = Array.from(new Set([
            ...arrayFromDoc,
            ...arrayFromNested,
            ...mapKeys,
            ...(cachedState.completedLessons || []),
          ]));

          const mergedMissions = Array.from(new Set([
            ...(Array.isArray(data.completedMissions) ? data.completedMissions : []),
            ...(Array.isArray(progressNested.completedMissions) ? progressNested.completedMissions : []),
            ...(cachedState.completedMissions || []),
          ]));

          const mergedScores = {
            ...(cachedState.missionScores || {}),
            ...(progressNested.missionScores || {}),
            ...(data.missionScores && typeof data.missionScores === "object" ? data.missionScores : {}),
          };

          const mergedEvidence = {
            ...(cachedState.missionEvidence || {}),
            ...(progressNested.missionEvidence || {}),
            ...(data.missionEvidence && typeof data.missionEvidence === "object" ? data.missionEvidence : {}),
          };

          const mergedAssessments = Array.from(new Set([
            ...(Array.isArray(data.completedAssessments) ? data.completedAssessments : []),
            ...(Array.isArray(progressNested.completedAssessments) ? progressNested.completedAssessments : []),
            ...(cachedState.completedAssessments || []),
          ]));

          const mergedBookmarks = Array.from(new Set([
            ...(Array.isArray(data.bookmarkedPatterns) ? data.bookmarkedPatterns : []),
            ...(Array.isArray(progressNested.bookmarkedPatterns) ? progressNested.bookmarkedPatterns : []),
            ...(cachedState.bookmarkedPatterns || []),
          ]));

          const allPrompts = [
            ...(cachedState.savedCustomPrompts || []),
            ...(Array.isArray(progressNested.savedCustomPrompts) ? progressNested.savedCustomPrompts : []),
            ...(Array.isArray(data.savedCustomPrompts) ? data.savedCustomPrompts : []),
          ];
          const uniquePrompts = Array.from(new Map(allPrompts.map(p => [p.id, p])).values());
          const mergedReviews = Array.from(new Map([
            ...(cachedState.reviewSchedule || []),
            ...(Array.isArray(progressNested.reviewSchedule) ? progressNested.reviewSchedule : []),
            ...(Array.isArray(data.reviewSchedule) ? data.reviewSchedule : []),
          ].map((review: ReviewScheduleItem) => [review.lessonId, review])).values());
          const mergedProjects = Array.from(new Map([
            ...(cachedState.workplaceProjects || []),
            ...(Array.isArray(progressNested.workplaceProjects) ? progressNested.workplaceProjects : []),
            ...(Array.isArray(data.workplaceProjects) ? data.workplaceProjects : []),
          ].map((project: WorkplaceProject) => [project.id, project])).values());

          const maxXP = Math.max(
            typeof data.xp === "number" ? data.xp : 0,
            typeof progressNested.xp === "number" ? progressNested.xp : 0,
            cachedState.xp || 0,
            initialProgress.xp
          );

          const finalStreak = streakResult.streak;

          const promptsEngineeredCount = Math.max(
            typeof data.promptsEngineeredCount === "number" ? data.promptsEngineeredCount : 0,
            typeof progressNested?.promptsEngineeredCount === "number" ? progressNested.promptsEngineeredCount : 0,
            cachedState.promptsEngineeredCount || 0
          );

          const rawLoginHistory = Array.isArray(data.loginHistory)
            ? data.loginHistory
            : (Array.isArray(progressNested.loginHistory) ? progressNested.loginHistory : []);
          const mergedLoginHistory = Array.from(new Set([
            ...rawLoginHistory,
            streakResult.date,
            ...(cachedState.loginHistory || [])
          ])).sort();

          const baseCloudProgress: UserProgress = {
            ...initialProgress,
            completedLessons: mergedLessons,
            completedMissions: mergedMissions,
            missionScores: mergedScores,
            completedAssessments: mergedAssessments,
            missionEvidence: mergedEvidence,
            bookmarkedPatterns: mergedBookmarks,
            savedCustomPrompts: uniquePrompts,
            reviewSchedule: mergedReviews,
            workplaceProjects: mergedProjects,
            xp: maxXP,
            streakDays: finalStreak,
            lastActivityDate: streakResult.date,
            loginHistory: mergedLoginHistory,
            achievements: Array.isArray(data.achievements)
              ? data.achievements
              : (Array.isArray(progressNested.achievements) ? progressNested.achievements : (cachedState.achievements || [])),
            lastLessonId: data.lastLessonId || progressNested.lastLessonId || cachedState.lastLessonId || undefined,
            lastModuleId: data.lastModuleId || progressNested.lastModuleId || cachedState.lastModuleId || undefined,
            curriculumProgressPercent: (() => {
              const curriculumLessonIds = new Set(
                currentCurriculum.flatMap((module) => module.lessons.map((lesson) => lesson.id))
              );
              const totalLessonsCount = curriculumLessonIds.size;
              const completedCurriculumLessons = mergedLessons.filter((id) => curriculumLessonIds.has(id)).length;
              return totalLessonsCount > 0
                ? Math.min(
                    100,
                    Math.round((completedCurriculumLessons / totalLessonsCount) * 100)
                  )
                : 0;
            })(),
            promptsEngineeredCount,
          };

          // Check for any milestones that should be unlocked
          const { allAchievements } = evaluateUserAchievements(baseCloudProgress);
          const cloudProgress: UserProgress = {
            ...baseCloudProgress,
            achievements: allAchievements,
          };

          const cloudFingerprint = getProgressFingerprint(cloudProgress);
          lastSyncedFingerprint.current = cloudFingerprint;
          setUserProgress(cloudProgress);

          try {
            localStorage.setItem(getStorageKeyForUid(user.uid), JSON.stringify(cloudProgress));
          } catch (e) {
            console.warn("Could not cache user progress locally", e);
          }

          // Persist updated streak, lastLoginDate, and lastActivityDate to Firestore
          const storedLoginDate = typeof data.lastLoginDate === 'string' ? data.lastLoginDate.slice(0, 10) : '';
          const storedActivityDate = typeof data.lastActivityDate === 'string' ? data.lastActivityDate.slice(0, 10) : '';
          if (
            finalStreak !== existingStreak ||
            streakResult.date !== storedLoginDate ||
            streakResult.date !== storedActivityDate
          ) {
            try {
              await setDoc(doc(db, USERS_COLLECTION, user.uid), {
                displayName: user.displayName || data.displayName || "Ecorp Scholar",
                photoURL: user.photoURL || data.photoURL || null,
                currentStreak: finalStreak,
                streakDays: finalStreak,
                lastLoginDate: streakResult.date,
                lastActivityDate: streakResult.date,
                loginHistory: mergedLoginHistory,
              }, { merge: true });
            } catch (updateErr) {
              console.warn("Could not update login streak in Firestore", updateErr);
            }
          }

          logger.info('ECORP:PERSISTENCE', `HYDRATION_SUCCESS uid=${user.uid} xp=${cloudProgress.xp} lessons=${cloudProgress.completedLessons.length} missions=${cloudProgress.completedMissions.length}`, 'HYDRATION_SUCCESS');
          persistenceLifecycle.current = 'ready';
          setPersistenceStatus('synced');
        } else {
          // PHASE 2 CASE B: SUCCESS_MISSING
          logger.info('ECORP:PERSISTENCE', `HYDRATION_MISSING uid=${user.uid}`, 'HYDRATION_MISSING');
          const cachedState = loadCachedProgress(user.uid);
          const initialLessons = Array.isArray(cachedState.completedLessons) ? cachedState.completedLessons : [];
          const initialStreak = Math.max(cachedState.streakDays || 1, 1);
          const initialXP = Math.max(cachedState.xp || 0, initialProgress.xp);
          const todayUtc = getUtcDateString();
          markStreakEvaluatedToday(user.uid, todayUtc);

          const initialUserProgress: UserProgress = {
            ...initialProgress,
            ...cachedState,
            completedLessons: initialLessons,
            streakDays: initialStreak,
            xp: initialXP,
            lastActivityDate: todayUtc,
          };

          const lessonsMap = Object.fromEntries(initialLessons.map(id => [id, true]));
          const newUserData = {
            displayName: user.displayName || "Ecorp Scholar",
            photoURL: user.photoURL || null,
            curriculumProgress: initialLessons.length,
            completedLessonCount: initialLessons.length,
            curriculumProgressPercent: 0,
            currentStreak: initialStreak,
            streakDays: initialStreak,
            lastActivityDate: todayUtc,
            lastLoginDate: todayUtc,
            xp: initialXP,
            completedLessons: initialLessons,
            lessons: lessonsMap,
            completedMissions: initialUserProgress.completedMissions,
            missionScores: initialUserProgress.missionScores,
            completedAssessments: initialUserProgress.completedAssessments || [],
            missionEvidence: initialUserProgress.missionEvidence || {},
            bookmarkedPatterns: initialUserProgress.bookmarkedPatterns,
            savedCustomPrompts: initialUserProgress.savedCustomPrompts,
            reviewSchedule: initialUserProgress.reviewSchedule || [],
            workplaceProjects: initialUserProgress.workplaceProjects || [],
            achievements: initialUserProgress.achievements,
            promptsEngineeredCount: initialUserProgress.promptsEngineeredCount || 0,
            progress: initialUserProgress,
          };

          try {
            await setDoc(doc(db, USERS_COLLECTION, user.uid), newUserData, { merge: true });
            logger.info('ECORP:PERSISTENCE', `NEW_USER_INITIALIZED uid=${user.uid}`, 'NEW_USER_INITIALIZED');
          } catch (createErr) {
            console.warn("Could not create initial user document in Firestore", createErr);
          }

          lastSyncedFingerprint.current = getProgressFingerprint(initialUserProgress);
          setUserProgress(initialUserProgress);
          try {
            localStorage.setItem(getStorageKeyForUid(user.uid), JSON.stringify(initialUserProgress));
          } catch (e) {
            console.warn("Could not cache initial progress locally", e);
          }

          persistenceLifecycle.current = 'ready';
          setPersistenceStatus('synced');
        }

        // Attach real-time Firestore listener
        activeUnsubscribeRef.current = subscribeToUserDoc(
          user.uid,
          (docData) => {
            if (!docData || auth.currentUser?.uid !== user.uid) return;

            const progressNested = (docData.progress && typeof docData.progress === 'object') ? docData.progress : {};
            const arrayFromDoc2 = Array.isArray(docData.completedLessons) ? docData.completedLessons : [];
            const nestedFromDoc2 = Array.isArray(progressNested.completedLessons) ? progressNested.completedLessons : [];
            const mapKeys2 = docData.lessons && typeof docData.lessons === 'object'
              ? Object.keys(docData.lessons).filter(k => docData.lessons[k])
              : [];

            const currentProg = latestUserProgressRef.current;
            // Always union with current completed lessons to never lose progress
            const merged2 = Array.from(new Set([
              ...(currentProg.completedLessons || []),
              ...arrayFromDoc2,
              ...nestedFromDoc2,
              ...mapKeys2,
            ]));

            const nextProgress: UserProgress = {
              ...currentProg,
              completedLessons: merged2,
              completedMissions: Array.isArray(docData.completedMissions) ? docData.completedMissions : currentProg.completedMissions,
              missionScores: docData.missionScores && typeof docData.missionScores === "object" ? docData.missionScores : currentProg.missionScores,
              reviewSchedule: Array.isArray(docData.reviewSchedule) ? docData.reviewSchedule : currentProg.reviewSchedule,
              workplaceProjects: Array.isArray(docData.workplaceProjects) ? docData.workplaceProjects : currentProg.workplaceProjects,
              completedAssessments: Array.isArray(docData.completedAssessments) ? docData.completedAssessments : currentProg.completedAssessments,
              missionEvidence: docData.missionEvidence && typeof docData.missionEvidence === "object" ? docData.missionEvidence : currentProg.missionEvidence,
              bookmarkedPatterns: Array.isArray(docData.bookmarkedPatterns) ? docData.bookmarkedPatterns : currentProg.bookmarkedPatterns,
              savedCustomPrompts: Array.isArray(docData.savedCustomPrompts) ? docData.savedCustomPrompts : currentProg.savedCustomPrompts,
              xp: Math.max(
                currentProg.xp || 0,
                typeof docData.xp === "number" ? docData.xp : 0,
                typeof progressNested.xp === "number" ? progressNested.xp : 0
              ),
              streakDays: Math.max(
                currentProg.streakDays || 1,
                typeof docData.currentStreak === "number" ? docData.currentStreak : 1,
                typeof docData.streakDays === "number" ? docData.streakDays : 1,
                typeof progressNested.streakDays === "number" ? progressNested.streakDays : 1
              ),
              lastActivityDate: typeof docData.lastActivityDate === "string"
                ? docData.lastActivityDate
                : (typeof docData.lastLoginDate === "string" ? docData.lastLoginDate : currentProg.lastActivityDate),
              achievements: Array.isArray(docData.achievements) ? docData.achievements : currentProg.achievements,
            };

            const incomingFingerprint = getProgressFingerprint(nextProgress);
            if (incomingFingerprint === lastSyncedFingerprint.current) {
              // Echo snapshot of our own recent write -> ignore
              return;
            }

            logger.debug('ECORP:PERSISTENCE', `SNAPSHOT_RECEIVED uid=${user.uid} xp=${nextProgress.xp} lessons=${nextProgress.completedLessons.length} missions=${nextProgress.completedMissions.length}`);
            lastSyncedFingerprint.current = incomingFingerprint;
            setUserProgress(nextProgress);

            try {
              localStorage.setItem(getStorageKeyForUid(user.uid), JSON.stringify(nextProgress));
            } catch {}
          },
          (snapshotError) => {
            logger.error('ECORP:PERSISTENCE', snapshotError, 'SNAPSHOT_LISTENER_ERROR');
          }
        );

        logger.info('ECORP:PERSISTENCE', `LISTENER_ATTACHED uid=${user.uid}`, 'LISTENER_ATTACHED');
      } catch (error) {
        logger.error('ECORP:PERSISTENCE', error, 'HYDRATION_UNEXPECTED_ERROR');
        persistenceLifecycle.current = 'error';
        setPersistenceStatus('offline');
      }
    });

    return () => {
      unsubscribeAuth();
      if (activeUnsubscribeRef.current) {
        activeUnsubscribeRef.current();
        activeUnsubscribeRef.current = null;
      }
    };
  }, []);

  // Save progress changes to namespaced local cache
  useEffect(() => {
    try {
      const currentUid = firestoreUserId.current;
      if (currentUid && persistenceLifecycle.current === 'ready') {
        localStorage.setItem(getStorageKeyForUid(currentUid), JSON.stringify(userProgress));
      } else if (!currentUid && persistenceLifecycle.current === 'idle') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userProgress));
      }
    } catch (e) {
      console.warn("Could not save progress to localStorage", e);
    }
  }, [userProgress]);

  // Persist all user-initiated progress mutations to Firestore via 250ms debounce
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || persistenceLifecycle.current !== 'ready' || firestoreUserId.current !== user.uid) {
      return;
    }
    
    const currentFingerprint = getProgressFingerprint(userProgress);
    if (currentFingerprint === lastSyncedFingerprint.current) {
      return;
    }

    logger.debug('ECORP:PERSISTENCE', `WRITE_SCHEDULED uid=${user.uid} xp=${userProgress.xp}`);

    if (syncTimerRef.current !== null) {
      window.clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = window.setTimeout(() => {
      syncTimerRef.current = null;
      void persistUserProgress(user.uid, latestUserProgressRef.current, { reason: 'debounced_mutation' });
    }, 250);

    return () => {
      if (syncTimerRef.current !== null) {
        window.clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    };
  }, [userProgress]);

  // Inactivity & Session Timeout monitoring (authoritative 25m warning, 30m expiration)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkSession = async () => {
      const user = auth.currentUser;
      if (!user) return;

      if (isSessionExpired()) {
        logger.info('ECORP:PERSISTENCE', `SESSION_TIMEOUT: Inactivity logout triggered uid=${user.uid}`, 'SESSION_TIMEOUT');
        markSessionExpired();
        await logout();
      }
    };

    const handleActivity = () => {
      if (auth.currentUser) {
        recordUserActivity();
      }
    };

    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleActivity, { passive: true });
    });

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkSession();
        // Warm up and verify backend health when user resumes page after idle/hours
        if (isPageResumedAfterLongIdle()) {
          robustApiFetch("/api/health", { silent: true, autoRetryOnce: true })
            .then((r) => r.json())
            .then((data) => {
              if (data && data.hasGeminiKey) {
                setHasRealApiAvailable(true);
              }
            })
            .catch(() => {});
        }
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkSession);
    window.addEventListener('pageshow', checkSession);

    const sessionCheckInterval = window.setInterval(checkSession, 10000);

    return () => {
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleActivity);
      });
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkSession);
      window.removeEventListener('pageshow', checkSession);
      window.clearInterval(sessionCheckInterval);
    };
  }, []);

  // Check health endpoint for backend / real Gemini API availability
  useEffect(() => {
    robustApiFetch("/api/health", { silent: true })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.hasGeminiKey) {
          setHasRealApiAvailable(true);
          setAiMode("real");
        }
      })
      .catch(() => {
        setHasRealApiAvailable(false);
      });
  }, []);

  const executeCurrentPrompt = async (
    customPrompt?: string,
    customSystemInstruction?: string,
    isolated?: boolean
  ): Promise<ExecutionResult> => {
    const textToExecute = customPrompt !== undefined ? customPrompt : prompt;
    const sysToExecute = customSystemInstruction !== undefined ? customSystemInstruction : systemInstruction;

    // Stale protection & request lifecycle
    let controller: AbortController;
    let currentSeq = 0;
    if (!isolated) {
      activeAbortControllerRef.current?.abort();
      controller = new AbortController();
      activeAbortControllerRef.current = controller;
      currentSeq = ++activeExecutionIdRef.current;
      setLastResult(null); // Clear stale output immediately so user doesn't see old response
    } else {
      controller = new AbortController();
    }

    setIsExecuting(true);
    const startTime = Date.now();
    const analysis = analyzePrompt(textToExecute);

    // Guest execution route: use Mock AI Engine and do NOT award XP or mutate learner state
    if (!auth.currentUser) {
      const mockData = generateMockAiResponse(textToExecute, sysToExecute);
      const duration = Date.now() - startTime;
      const execResult: ExecutionResult = {
        id: "exec-mock-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
        prompt: textToExecute,
        systemInstruction: sysToExecute,
        output: mockData.text,
        timestamp: Date.now(),
        durationMs: Math.max(10, duration),
        tokenCount: analysis.tokenEstimate + 45,
        isMock: true,
        model: "Ecorp Mock AI Engine (Guest Sandbox)",
        status: "success",
        detectedTechniques: analysis.techniqueBadges,
        executionMode: "mock",
        provider: "Mock AI Gateway",
      };

      if (isolated || currentSeq === activeExecutionIdRef.current) {
        setIsExecuting(false);
        if (!isolated) {
          setLastResult(execResult);
          setExecutionHistory((prev) => [execResult, ...prev.slice(0, 19)]);
        }
      }
      return execResult;
    }

    let resultText = "";
    let modelName = "Google Gemini";
    let duration = 0;
    let tokenCount = analysis.tokenEstimate;
    let status: "success" | "error" = "success";
    let errorMessage: string | undefined = undefined;
    let executionMode: "real" | "mock" | "error" = "real";
    let provider = "Google Gemini";
    let requestId: string | undefined = undefined;

    try {
      const data = await callGeminiGenerate({
        prompt: textToExecute,
        systemInstruction: sysToExecute ? sysToExecute.trim() : undefined,
        temperature,
        topP,
        signal: controller.signal,
      });

      // Check if another execution was started while this was in-flight (for non-isolated)
      if (!isolated && currentSeq !== activeExecutionIdRef.current) {
        return {} as ExecutionResult;
      }

      resultText = data.text || "";
      modelName = data.model || "Google Gemini";
      duration = data.latencyMs ?? (Date.now() - startTime);
      tokenCount =
        data.usage?.candidatesTokenCount ||
        (data.usage?.totalTokens ? Math.max(1, data.usage.totalTokens - (data.usage.promptTokens || 0)) : analysis.tokenEstimate + 100);
      status = "success";
      executionMode = "real";
      provider = data.provider || "Google Gemini";
      requestId = data.requestId;
    } catch (err: any) {
      // If aborted because a newer prompt was submitted, do nothing
      if (err?.name === "AbortError" || controller.signal.aborted || (!isolated && currentSeq !== activeExecutionIdRef.current)) {
        return {} as ExecutionResult;
      }
      console.error("Real Gemini execution error:", err);
      duration = Date.now() - startTime;
      status = "error";
      executionMode = "error";
      errorMessage = err?.message || "Gemini execution failed. Your prompt was not evaluated.";
      resultText = "";
      modelName = "Google Gemini";
      provider = "Google Gemini";
    }

    const execResult: ExecutionResult = {
      id: "exec-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      prompt: textToExecute,
      systemInstruction: sysToExecute,
      output: resultText,
      timestamp: Date.now(),
      durationMs: Math.max(10, duration),
      tokenCount,
      isMock: false,
      model: modelName,
      status,
      errorMessage,
      detectedTechniques: analysis.techniqueBadges,
      executionMode,
      provider,
      requestId,
    };

    if (isolated || currentSeq === activeExecutionIdRef.current) {
      setIsExecuting(false);
      if (!isolated) {
        setLastResult(execResult);
        if (status === "success") {
          setExecutionHistory((prev) => [execResult, ...prev.slice(0, 19)]);
        }
      }

      // Award XP and increment promptsEngineeredCount on successful real execution
      if (status === "success" && !isolated) {
        setUserProgress((prev) => processUserActivity({
          ...prev,
          xp: prev.xp + 5,
          promptsEngineeredCount: (prev.promptsEngineeredCount || 0) + 1,
        }));
      }
    }

    return execResult;
  };

  const executeComparison = async () => {
    if (!auth.currentUser) {
      openAuthModal("Sign in to compare prompt models with real Gemini AI.");
      return;
    }
    // Clear outputs immediately
    setLastResult(null);
    setComparisonResultB(null);
    setIsExecuting(true);

    const seqA = ++activeComparisonSeqARef.current;
    const seqB = ++activeComparisonSeqBRef.current;

    const analysisA = analyzePrompt(prompt);
    const analysisB = analyzePrompt(comparisonPromptB);

    const startTimeA = Date.now();
    const startTimeB = Date.now();

    const fetchA = async () => {
      try {
        const dataA = await callGeminiGenerate({
          prompt,
          systemInstruction: systemInstruction ? systemInstruction.trim() : undefined,
          temperature,
          topP,
        });
        if (seqA !== activeComparisonSeqARef.current) return;

        const durationA = dataA.latencyMs ?? (Date.now() - startTimeA);
        const execResultA: ExecutionResult = {
          id: "exec-comp-a-" + Date.now(),
          prompt,
          systemInstruction,
          output: dataA.text || "",
          timestamp: Date.now(),
          durationMs: Math.max(10, durationA),
          tokenCount: dataA.usage?.candidatesTokenCount || (analysisA.tokenEstimate + 80),
          isMock: false,
          model: dataA.model || "Google Gemini",
          status: "success",
          detectedTechniques: analysisA.techniqueBadges,
          executionMode: "real",
          provider: dataA.provider || "Google Gemini",
          requestId: dataA.requestId,
        };
        setLastResult(execResultA);
      } catch (err: any) {
        if (seqA !== activeComparisonSeqARef.current) return;
        const execResultA: ExecutionResult = {
          id: "exec-comp-a-" + Date.now(),
          prompt,
          systemInstruction,
          output: "",
          timestamp: Date.now(),
          durationMs: Date.now() - startTimeA,
          tokenCount: 0,
          isMock: false,
          model: "Google Gemini",
          status: "error",
          errorMessage: err?.message || "Gemini execution failed. Your prompt was not evaluated.",
          detectedTechniques: analysisA.techniqueBadges,
          executionMode: "error",
          provider: "Google Gemini",
        };
        setLastResult(execResultA);
      }
    };

    const fetchB = async () => {
      try {
        const dataB = await callGeminiGenerate({
          prompt: comparisonPromptB,
          systemInstruction: systemInstruction ? systemInstruction.trim() : undefined,
          temperature,
          topP,
        });
        if (seqB !== activeComparisonSeqBRef.current) return;

        const durationB = dataB.latencyMs ?? (Date.now() - startTimeB);
        const execResultB: ExecutionResult = {
          id: "exec-comp-b-" + Date.now(),
          prompt: comparisonPromptB,
          systemInstruction,
          output: dataB.text || "",
          timestamp: Date.now(),
          durationMs: Math.max(10, durationB),
          tokenCount: dataB.usage?.candidatesTokenCount || (analysisB.tokenEstimate + 80),
          isMock: false,
          model: dataB.model || "Google Gemini",
          status: "success",
          detectedTechniques: analysisB.techniqueBadges,
          executionMode: "real",
          provider: dataB.provider || "Google Gemini",
          requestId: dataB.requestId,
        };
        setComparisonResultB(execResultB);
      } catch (err: any) {
        if (seqB !== activeComparisonSeqBRef.current) return;
        const execResultB: ExecutionResult = {
          id: "exec-comp-b-" + Date.now(),
          prompt: comparisonPromptB,
          systemInstruction,
          output: "",
          timestamp: Date.now(),
          durationMs: Date.now() - startTimeB,
          tokenCount: 0,
          isMock: false,
          model: "Google Gemini",
          status: "error",
          errorMessage: err?.message || "Gemini execution failed. Your prompt was not evaluated.",
          detectedTechniques: analysisB.techniqueBadges,
          executionMode: "error",
          provider: "Google Gemini",
        };
        setComparisonResultB(execResultB);
      }
    };

    await Promise.all([fetchA(), fetchB()]);
    setIsExecuting(false);

    // Increment promptsEngineeredCount when comparison completes
    setUserProgress((prev) => processUserActivity({
      ...prev,
      xp: prev.xp + 10,
      promptsEngineeredCount: (prev.promptsEngineeredCount || 0) + 2,
    }));
  };

  const clearOutput = () => {
    setLastResult(null);
    setComparisonResultB(null);
  };

  const evaluateMission = async (missionId: string, submittedPrompt: string): Promise<MissionEvaluationResult> => {
    if (!auth.currentUser) {
      openAuthModal("Sign in to evaluate missions and earn XP.");
      throw new Error("Authentication required to evaluate missions.");
    }
    setIsEvaluatingMission(true);
    const mission = missions.find((m) => m.id === missionId);

    if (!mission) {
      setIsEvaluatingMission(false);
      throw new Error("Mission not found");
    }

    try {
      const data = await callGeminiEvaluate({
        type: "mission",
        missionId,
        prompt: submittedPrompt,
        rubric: {
          title: mission.title,
          objective: mission.objective,
          targetCriteria: mission.targetCriteria,
          minPassingScore: 70,
          difficulty: mission.difficulty,
        },
      });

      // Application-side boundary validation
      const score = Math.max(0, Math.min(100, Math.round(Number(data.score) || 0)));
      const passed = typeof data.passed === "boolean" ? data.passed : score >= 70;
      const validGrade: MissionEvaluationResult["grade"] = ["S", "A", "B", "C", "D"].includes(data.grade as any)
        ? (data.grade as any)
        : score >= 90 ? "S" : score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D";

      const criteriaChecks = Array.isArray(data.criteria) && data.criteria.length > 0
        ? data.criteria.map((c: any) => ({
            criteria: String(c.criteria || "Criterion evaluation"),
            passed: Boolean(c.passed),
            feedback: String(c.feedback || ""),
          }))
        : mission.targetCriteria.map((c) => ({
            criteria: c,
            passed,
            feedback: passed ? "Target criterion satisfied." : "Criterion not met.",
          }));

      const xpEarned = passed ? 100 : 25;
      const generalFeedback = data.feedback || (passed ? "Strong prompt craftsmanship! Meets enterprise standards." : "Needs refinement against rubric criteria.");

      const evaluationResult: MissionEvaluationResult = {
        missionId,
        score,
        grade: validGrade,
        passed,
        criteriaChecks,
        generalFeedback,
        xpEarned,
      };

      if (passed) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
        setUserProgress((prev) => {
          const isAlreadyCompleted = prev.completedMissions.includes(missionId);
          const completed = isAlreadyCompleted
            ? prev.completedMissions
            : [...prev.completedMissions, missionId];
          return processUserActivity({
            ...prev,
            completedMissions: completed,
            missionScores: { ...prev.missionScores, [missionId]: Math.max(prev.missionScores[missionId] || 0, score) },
            missionEvidence: { ...(prev.missionEvidence || {}), [missionId]: submittedPrompt },
            xp: isAlreadyCompleted ? prev.xp : prev.xp + xpEarned,
            promptsEngineeredCount: (prev.promptsEngineeredCount || 0) + 1,
          });
        });
      } else {
        setUserProgress((prev) => processUserActivity({
          ...prev,
          xp: prev.xp + xpEarned,
          promptsEngineeredCount: (prev.promptsEngineeredCount || 0) + 1,
        }));
      }

      setIsEvaluatingMission(false);
      setMissionResult(evaluationResult);
      return evaluationResult;
    } catch (err: any) {
      setIsEvaluatingMission(false);
      console.error("Mission evaluation error with Gemini:", err);
      throw new Error(err?.message || "Gemini evaluation unavailable. Your prompt was not evaluated.");
    }
  };

  const processUserActivity = (prev: UserProgress): UserProgress => {
    const todayStr = getUtcDateString();
    const streakResult = evaluateUserDailyStreak({
      uid: firestoreUserId.current || "guest",
      candidateDates: [prev.lastActivityDate],
      currentStreak: prev.streakDays,
      todayStr,
    });
    const currentHistory = Array.isArray(prev.loginHistory) ? prev.loginHistory : [];
    const updatedHistory = Array.from(new Set([...currentHistory, todayStr])).sort();

    const updatedProgress: UserProgress = {
      ...prev,
      streakDays: streakResult.streak,
      lastActivityDate: streakResult.date,
      loginHistory: updatedHistory,
    };

    const { allAchievements, newAchievements } = evaluateUserAchievements(updatedProgress);

    return {
      ...updatedProgress,
      achievements: allAchievements,
      xp: updatedProgress.xp + (newAchievements.length * 100),
    };
  };

  const progressModel: ProgressModel = useMemo(() => {
    const allCurriculumLessons = currentCurriculum.flatMap((m) => m.lessons);
    const completedIds = userProgress.completedLessons || [];

    // Module 00 lessons (Core Prompt Foundations)
    const foundationModuleLessons = currentCurriculum[0]?.lessons || [];
    const foundationsTotal = foundationModuleLessons.length;
    const foundationsCompleted = foundationModuleLessons.filter((l) => completedIds.includes(l.id)).length;
    const foundationsPercentage = foundationsTotal > 0 ? Math.round((foundationsCompleted / foundationsTotal) * 100) : 0;

    // Authoritative Unified Curriculum
    const curriculumTotal = allCurriculumLessons.length;
    const curriculumCompleted = allCurriculumLessons.filter((l) => completedIds.includes(l.id)).length;
    const curriculumPercentage = curriculumTotal > 0 ? Math.round((curriculumCompleted / curriculumTotal) * 100) : 0;

    const missionsTotal = missions.length;
    const missionsCompleted = (userProgress.completedMissions || []).length;
    const missionsPercentage = missionsTotal > 0 ? Math.round((missionsCompleted / missionsTotal) * 100) : 0;

    const total = curriculumTotal;
    const completed = curriculumCompleted;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Truthful weekly active day count
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const startOfWeek = new Date(now);
    startOfWeek.setUTCDate(now.getUTCDate() - dayOfWeek);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const history = Array.isArray(userProgress.loginHistory) ? userProgress.loginHistory : [];
    const activeDaysThisWeek = history.filter((d) => {
      try {
        const dateObj = new Date(d + "T00:00:00Z");
        return dateObj >= startOfWeek && dateObj <= now;
      } catch {
        return false;
      }
    }).length;

    const weeklyCompleted = Math.min(5, Math.max(0, activeDaysThisWeek));

    return {
      completed,
      total,
      percentage,
      current: Math.min(total, completed + 1),
      remaining: Math.max(0, total - completed),
      weeklyCompleted,
      weeklyGoal: 5,
      foundations: {
        completed: foundationsCompleted,
        total: foundationsTotal,
        percentage: foundationsPercentage,
      },
      curriculum: {
        completed: curriculumCompleted,
        total: curriculumTotal,
        percentage: curriculumPercentage,
      },
      missions: {
        completed: missionsCompleted,
        total: missionsTotal,
        percentage: missionsPercentage,
      },
    };
  }, [currentCurriculum, userProgress.completedLessons, userProgress.completedMissions, userProgress.loginHistory]);

  const curriculumProgressPercent = progressModel.curriculum.percentage;

  const resumeCurriculum = (): string | null => {
    const allLessons = currentCurriculum.flatMap((m) => m.lessons);
    const allLessonIds = allLessons.map((l) => l.id);
    let targetLessonId: string | null = null;

    if (
      userProgress.lastLessonId &&
      allLessonIds.includes(userProgress.lastLessonId) &&
      !userProgress.completedLessons.includes(userProgress.lastLessonId)
    ) {
      targetLessonId = userProgress.lastLessonId;
    } else {
      const firstIncomplete = allLessonIds.find(
        (id) => !userProgress.completedLessons.includes(id)
      );

      targetLessonId = firstIncomplete || null;
    }

    if (targetLessonId) {
      setActiveLessonId(targetLessonId);
      setActiveTab("curriculum");
    }
    return targetLessonId;
  };

  const markLessonComplete = (lessonId: string) => {
    if (!auth.currentUser) {
      openAuthModal("Sign in to save your lesson progress and earn XP.");
      return;
    }
    // Optimistic local update with duplicate completion protection
    setUserProgress((prev) => {
      const isAlreadyDone = prev.completedLessons.includes(lessonId);
      if (!isAlreadyDone) {
        confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      }
      const updatedLessons = isAlreadyDone
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId];
      const curriculumLessonIds = new Set(
        currentCurriculum.flatMap((module) => module.lessons.map((lesson) => lesson.id))
      );
      const allTotal = curriculumLessonIds.size || 1;
      const completedCurriculumLessons = updatedLessons.filter((id) => curriculumLessonIds.has(id)).length;
      const percent = Math.min(100, Math.round((completedCurriculumLessons / allTotal) * 100));
      const next = {
        ...prev,
        completedLessons: updatedLessons,
        xp: isAlreadyDone ? prev.xp : prev.xp + 40,
        lastLessonId: lessonId,
        curriculumProgressPercent: percent,
        reviewSchedule: isAlreadyDone
          ? (prev.reviewSchedule || [])
          : [{ lessonId, dueAt: Date.now() + 24 * 60 * 60 * 1000, intervalDays: 1 } as ReviewScheduleItem, ...(prev.reviewSchedule || []).filter((review) => review.lessonId !== lessonId)],
      };
      return processUserActivity(next);
    });
  };

  const addXp = (amount: number) => {
    if (!auth.currentUser) {
      openAuthModal("Sign in to earn XP and save your achievements.");
      return;
    }
    setUserProgress((prev) => processUserActivity({
      ...prev,
      xp: prev.xp + amount
    }));
  };

  const completeAssessment = (assessmentId: string, submission: string) => {
    if (!auth.currentUser) {
      openAuthModal("Sign in to submit assessments and unlock certification credentials.");
      return;
    }
    setUserProgress((prev) => {
      const isAlreadyCompleted = (prev.completedAssessments || []).includes(assessmentId);
      const nextAssessments = isAlreadyCompleted ? (prev.completedAssessments || []) : [...(prev.completedAssessments || []), assessmentId];
      return processUserActivity({
        ...prev,
        completedAssessments: nextAssessments,
        missionEvidence: { ...(prev.missionEvidence || {}), [assessmentId]: submission },
        xp: isAlreadyCompleted ? prev.xp : prev.xp + 150
      });
    });
  };

  const saveCustomPrompt = (title: string, promptText: string) => {
    if (!auth.currentUser) {
      openAuthModal("Sign in to save custom prompts to your library.");
      return;
    }
    setUserProgress((prev) => processUserActivity({
      ...prev,
      savedCustomPrompts: [
        { id: "p-" + Date.now(), title, prompt: promptText, createdAt: Date.now() },
        ...prev.savedCustomPrompts
      ],
      xp: prev.xp + 15
    }));
  };

  const deleteCustomPrompt = (id: string) => {
    if (!auth.currentUser) {
      openAuthModal("Sign in to manage your saved custom prompts.");
      return;
    }
    setUserProgress((prev) => ({
      ...prev,
      savedCustomPrompts: prev.savedCustomPrompts.filter((p) => p.id !== id)
    }));
  };

  const saveCodeSnippet = (snippet: Omit<SavedCodeSnippet, "id" | "createdAt">) => {
    if (!auth.currentUser) {
      openAuthModal("Sign in to save code snippets to your library.");
      return;
    }
    const newSnippet: SavedCodeSnippet = {
      ...snippet,
      id: "snip-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now()
    };
    setUserProgress((prev) => processUserActivity({
      ...prev,
      savedCodeSnippets: [
        newSnippet,
        ...(prev.savedCodeSnippets || [])
      ],
      xp: prev.xp + 20
    }));
  };

  const deleteCodeSnippet = (id: string) => {
    if (!auth.currentUser) {
      openAuthModal("Sign in to manage your saved code snippets.");
      return;
    }
    setUserProgress((prev) => ({
      ...prev,
      savedCodeSnippets: (prev.savedCodeSnippets || []).filter((s) => s.id !== id)
    }));
  };

  const toggleBookmarkPattern = (patternId: string) => {
    if (!auth.currentUser) {
      openAuthModal("Sign in to bookmark patterns to your library.");
      return;
    }
    setUserProgress((prev) => {
      const isBookmarked = prev.bookmarkedPatterns.includes(patternId);
      return {
        ...prev,
        bookmarkedPatterns: isBookmarked
          ? prev.bookmarkedPatterns.filter((id) => id !== patternId)
          : [...prev.bookmarkedPatterns, patternId]
      };
    });
  };

  const toggleBookmarkLesson = (lessonId: string) => {
    if (!auth.currentUser) {
      openAuthModal("Sign in to bookmark lessons to your library.");
      return;
    }
    setUserProgress((prev) => {
      const current = prev.bookmarkedLessons || [];
      const isBookmarked = current.includes(lessonId);
      return {
        ...prev,
        bookmarkedLessons: isBookmarked
          ? current.filter((id) => id !== lessonId)
          : [...current, lessonId]
      };
    });
  };

  const submitLessonFeedback = (feedback: LessonFeedback) => {
    if (!auth.currentUser) {
      openAuthModal("Sign in to submit lesson feedback and earn XP.");
      return;
    }
    setUserProgress((prev) => {
      const currentFeedbacks = prev.lessonFeedbacks || {};
      const isFirstTime = !currentFeedbacks[feedback.lessonId];
      const updatedFeedbacks = {
        ...currentFeedbacks,
        [feedback.lessonId]: feedback,
      };
      return processUserActivity({
        ...prev,
        lessonFeedbacks: updatedFeedbacks,
        xp: isFirstTime ? prev.xp + 20 : prev.xp,
      });
    });
  };

  const completeScheduledReview = (lessonId: string) => {
    setUserProgress((prev) => processUserActivity({
      ...prev,
      reviewSchedule: (prev.reviewSchedule || []).map((review) => review.lessonId !== lessonId ? review : {
        ...review,
        completedAt: Date.now(),
        intervalDays: Math.min(review.intervalDays * 2, 30),
        dueAt: Date.now() + Math.min(review.intervalDays * 2, 30) * 24 * 60 * 60 * 1000,
      }),
    }));
  };

  const createWorkplaceProject = (project: Omit<WorkplaceProject, "id" | "createdAt" | "updatedAt">) => {
    const now = Date.now();
    setUserProgress((prev) => processUserActivity({
      ...prev,
      workplaceProjects: [{ ...project, id: `project-${now}`, createdAt: now, updatedAt: now }, ...(prev.workplaceProjects || [])],
    }));
  };

  const updateWorkplaceProject = (id: string, update: Partial<Pick<WorkplaceProject, "status" | "title" | "problem" | "successMetric" | "linkedMissionIds">>) => {
    setUserProgress((prev) => processUserActivity({
      ...prev,
      workplaceProjects: (prev.workplaceProjects || []).map((project) => project.id === id ? { ...project, ...update, updatedAt: Date.now() } : project),
    }));
  };

  const loadIntoPlayground = (options: {
    prompt: string;
    systemInstruction?: string;
    temperature?: number;
    missionId?: string;
    subTab?: "sandbox" | "missions" | "comparison" | "history" | "saved";
  }) => {
    setPrompt(options.prompt);
    if (options.systemInstruction) setSystemInstruction(options.systemInstruction);
    if (typeof options.temperature === "number") setTemperature(options.temperature);
    if (options.missionId) {
      setActiveMissionId(options.missionId);
      setPlaygroundSubTab("missions");
      setIsComparisonMode(false);
    } else {
      setPlaygroundSubTab(options.subTab || "sandbox");
      setIsComparisonMode(options.subTab === "comparison");
    }
    setActiveTab("playground");
  };

  // Read CTF solved challenges for current user to inform adversarial-defense competency
  const ctfSolvedState = useMemo(() => {
    try {
      const storageKey = user?.uid ? `ecorp_ctf_solved_${user.uid}` : "ecorp_ctf_solved_guest";
      const legacyKey = "ecorp_ctf_solved";
      const saved = localStorage.getItem(storageKey) || localStorage.getItem(legacyKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }, [user?.uid, userProgress.xp]);

  // Pure deterministic derivation of Unified Competency Architecture states
  const competencyStates = useMemo(() => {
    return deriveCompetencyStates(userProgress, ctfSolvedState);
  }, [userProgress, ctfSolvedState]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeLessonId,
        setActiveLessonId,
        activeMissionId,
        setActiveMissionId,
        playgroundSubTab,
        setPlaygroundSubTab,
        openSandbox,
        prompt,
        setPrompt,
        systemInstruction,
        setSystemInstruction,
        temperature,
        setTemperature,
        topP,
        setTopP,
        aiMode,
        setAiMode,
        hasRealApiAvailable,
        isExecuting,
        lastResult,
        executionHistory,
        executeCurrentPrompt,
        clearOutput,
        isComparisonMode,
        setIsComparisonMode,
        comparisonPromptB,
        setComparisonPromptB,
        comparisonResultB,
        executeComparison,
        isEvaluatingMission,
        missionResult,
        evaluateMission,
        theme,
        setTheme,
        isDarkMode,
        userProgress,
        setUserProgress,
        progressModel,
        curriculumProgressPercent,
        resumeCurriculum,
        persistenceStatus,
        isOnline,
        retrySync,
        markLessonComplete,
        addXp,
        completeAssessment,
        saveCustomPrompt,
        deleteCustomPrompt,
        saveCodeSnippet,
        deleteCodeSnippet,
        toggleBookmarkPattern,
        toggleBookmarkLesson,
        submitLessonFeedback,
        completeScheduledReview,
        createWorkplaceProject,
        updateWorkplaceProject,
        syncProgressToDb,
        logout,
        selectedPatternId,
        setSelectedPatternId,
        selectedResourceFilter,
        setSelectedResourceFilter,
        isDistractionFreeMode,
        setIsDistractionFreeMode,
        userPreferences,
        updateUserPreferences,
        language,
        setLanguage,
        t,
        currentCurriculum,
        loadIntoPlayground,
        user,
        competencyStates,
        isAuthModalOpen,
        authModalMessage,
        redirectPath,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
