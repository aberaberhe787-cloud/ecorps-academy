import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  NavTab,
  ExecutionResult,
  UserProgress,
  MissionEvaluationResult,
  Mission,
  CurriculumModule
} from "../types";
import { generateMockAiResponse } from "../lib/mockAiEngine";
import { missions } from "../data/missionsData";
import { analyzePrompt } from "../lib/promptAnalyzer";
import { translations, Language, I18nTranslations } from "../i18n/translations";
import { amharicCurriculumModules } from "../i18n/amharicLessons";
import { curriculumModules } from "../data/lessonsData";
import {
  auth,
  db,
  useEmulatorsIfDev,
  subscribeToUserDoc,
  readUserDoc,
  signOut as fbSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged
} from "../lib/firebaseClient";
import { doc, setDoc } from "firebase/firestore";

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeLessonId: string | null;
  setActiveLessonId: (id: string | null) => void;
  activeMissionId: string | null;
  setActiveMissionId: (id: string | null) => void;
  playgroundSubTab: "sandbox" | "missions" | "comparison" | "history" | "saved" | "ctf";
  setPlaygroundSubTab: (tab: "sandbox" | "missions" | "comparison" | "history" | "saved" | "ctf") => void;
  openSandbox: (subTab?: "sandbox" | "missions" | "comparison" | "history" | "saved" | "ctf") => void;

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
  executeCurrentPrompt: (customPrompt?: string) => Promise<ExecutionResult>;
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
  markLessonComplete: (lessonId: string) => void;
  addXp: (amount: number) => void;
  saveCustomPrompt: (title: string, promptText: string) => void;
  deleteCustomPrompt: (id: string) => void;
  toggleBookmarkPattern: (patternId: string) => void;
  syncProgressToDb: (email?: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // LMS Focus / Distraction-free mode
  isDistractionFreeMode: boolean;
  setIsDistractionFreeMode: (v: boolean) => void;
  
  // Helper to load into playground
  loadIntoPlayground: (options: {
    prompt: string;
    systemInstruction?: string;
    temperature?: number;
    missionId?: string;
    subTab?: "sandbox" | "missions" | "comparison" | "history" | "saved" | "ctf";
  }) => void;
}

const STORAGE_KEY = "promptlab_user_progress_v1";
const USERS_COLLECTION = "users";

const initialProgress: UserProgress = {
  completedLessons: [],
  completedMissions: [],
  missionScores: {},
  bookmarkedPatterns: [],
  savedCustomPrompts: [],
  xp: 120, // Initial welcome XP
  streakDays: 1,
  achievements: []
};

function getUtcDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function computeDailyStreak(lastDateStr?: string, existingStreak = 1): { streak: number; date: string } {
  const todayStr = getUtcDateString();
  if (!lastDateStr) {
    return { streak: Math.max(1, existingStreak), date: todayStr };
  }
  if (lastDateStr === todayStr) {
    return { streak: Math.max(1, existingStreak), date: todayStr };
  }
  const lastDate = new Date(lastDateStr + "T00:00:00Z");
  const todayDate = new Date(todayStr + "T00:00:00Z");
  const diffTime = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return { streak: Math.max(1, existingStreak) + 1, date: todayStr };
  } else if (diffDays > 1) {
    return { streak: 1, date: todayStr };
  }
  return { streak: Math.max(1, existingStreak), date: todayStr };
}

function getStorageKeyForUid(uid?: string | null): string {
  return uid ? `promptlab_user_progress_${uid}` : STORAGE_KEY;
}

function loadCachedProgress(uid?: string | null): UserProgress {
  try {
    const key = getStorageKeyForUid(uid);
    const saved = localStorage.getItem(key);
    if (saved) {
      return { ...initialProgress, ...JSON.parse(saved) };
    }
    // Backward-compatibility fallback to legacy global key for guests
    if (!uid) {
      const legacy = localStorage.getItem(STORAGE_KEY);
      if (legacy) {
        return { ...initialProgress, ...JSON.parse(legacy) };
      }
    }
  } catch (e) {
    console.warn("Could not load cached progress from localStorage", e);
  }
  return initialProgress;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);
  const [playgroundSubTab, setPlaygroundSubTab] = useState<"sandbox" | "missions" | "comparison" | "history" | "saved" | "ctf">("sandbox");
  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('ecorp_theme') as 'dark' | 'light' | 'system') || 'system';
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
    localStorage.setItem('ecorp_theme', newTheme);
  };

  // Progress state
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    return loadCachedProgress(null);
  });
  const firestoreUserId = useRef<string | null>(null);
  const firestoreReady = useRef(false);
  const isRemoteUpdate = useRef(false);
  const latestUserProgressRef = useRef<UserProgress>(userProgress);
  const syncTimerRef = useRef<number | null>(null);
  const activeUnsubscribeRef = useRef<(() => void) | null>(null);

  // Synchronize ref whenever userProgress changes
  useEffect(() => {
    latestUserProgressRef.current = userProgress;
  }, [userProgress]);

  // Canonical Direct Sync to Firestore
  const syncProgressToDbDirect = async (uid: string, progressToSync: UserProgress, userObj?: any) => {
    const currentUser = auth.currentUser;
    if (!currentUser || currentUser.uid !== uid) {
      if (import.meta.env.DEV) {
        console.warn(`[ECORP:PERSISTENCE] WRITE_ABORTED auth uid mismatch currentUser=${currentUser?.uid} target=${uid}`);
      }
      return;
    }
    
    try {
      const lessonsMap = Object.fromEntries(progressToSync.completedLessons.map(id => [id, true]));
      await setDoc(doc(db, USERS_COLLECTION, uid), {
        displayName: userObj?.displayName || currentUser.displayName || "Ecorp Scholar",
        photoURL: userObj?.photoURL || currentUser.photoURL || null,
        curriculumProgress: progressToSync.completedLessons.length,
        completedLessonCount: progressToSync.completedLessons.length,
        curriculumProgressPercent: 0,
        currentStreak: progressToSync.streakDays,
        streakDays: progressToSync.streakDays,
        lastLoginDate: getUtcDateString(),
        xp: progressToSync.xp,
        completedLessons: progressToSync.completedLessons,
        lessons: lessonsMap,
        completedMissions: progressToSync.completedMissions,
        missionScores: progressToSync.missionScores,
        bookmarkedPatterns: progressToSync.bookmarkedPatterns,
        savedCustomPrompts: progressToSync.savedCustomPrompts,
        achievements: progressToSync.achievements,
      }, { merge: true });

      if (import.meta.env.DEV) {
        console.log(`[ECORP:PERSISTENCE] FIRESTORE_WRITE path=users/${uid} success=true xp=${progressToSync.xp}`);
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error(`[ECORP:PERSISTENCE] FIRESTORE_WRITE_ERROR path=users/${uid}`, err);
      }
    }
  };

  const syncProgressToDb = async (_email?: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    await syncProgressToDbDirect(currentUser.uid, latestUserProgressRef.current, currentUser);
  };

  const logout = async () => {
    if (import.meta.env.DEV) {
      console.log('[ECORP:PERSISTENCE] LOGOUT_INITIATED');
    }
    const user = auth.currentUser;
    const targetUid = user?.uid;
    const currentProgress = latestUserProgressRef.current;

    // 1. Cancel pending debounce timer
    if (syncTimerRef.current !== null) {
      window.clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    // 2. Perform final awaited write if user is authenticated and firestore was ready
    if (user && targetUid && firestoreReady.current) {
      try {
        await syncProgressToDbDirect(targetUid, currentProgress, user);
        if (import.meta.env.DEV) {
          console.log(`[ECORP:PERSISTENCE] LOGOUT_FLUSH success=true uid=${targetUid}`);
        }
      } catch (err) {
        console.error('[ECORP:PERSISTENCE] LOGOUT_FLUSH failed:', err);
      }
    }

    // 3. Unsubscribe real-time listener if active
    if (activeUnsubscribeRef.current) {
      activeUnsubscribeRef.current();
      activeUnsubscribeRef.current = null;
      if (import.meta.env.DEV) {
        console.log(`[ECORP:PERSISTENCE] LISTENER_DETACHED uid=${targetUid}`);
      }
    }

    // 4. Call Firebase signOut
    try {
      await fbSignOut();
      if (import.meta.env.DEV) {
        console.log('[ECORP:PERSISTENCE] AUTH_SIGNOUT success=true');
      }
    } catch (err) {
      console.error('Firebase signOut failed:', err);
    }

    // 5. Reset local authenticated state to clean initial guest state
    firestoreReady.current = false;
    firestoreUserId.current = null;
    setUserProgress(initialProgress);
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
  const [temperature, setTemperature] = useState<number>(0.3);
  const [topP, setTopP] = useState<number>(0.95);
  const [aiMode, setAiMode] = useState<"mock" | "real">("mock");
  const [hasRealApiAvailable, setHasRealApiAvailable] = useState<boolean>(false);

  // Execution state
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);

  // Comparison mode
  const [isComparisonMode, setIsComparisonMode] = useState<boolean>(false);
  const [comparisonPromptB, setComparisonPromptB] = useState<string>(
    "Look at this code and tell me if it works:\nfunction refreshAuthToken(user) { ... }"
  );
  const [comparisonResultB, setComparisonResultB] = useState<ExecutionResult | null>(null);

  // LMS Focus / Distraction-free mode
  const [isDistractionFreeMode, setIsDistractionFreeMode] = useState<boolean>(false);

  // Language state defaults to English until the user selects another language.
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem("ecorp_academy_lang");
      if (savedLang === "en" || savedLang === "am") {
        return savedLang;
      }
    } catch {
      // fallback
    }
    return "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("ecorp_academy_lang", lang);
    } catch {
      // ignore
    }
  };

  const t = translations[language];
  const currentCurriculum = language === "am" ? amharicCurriculumModules : curriculumModules;

  // Helper to directly open the sandbox view
  const openSandbox = (subTab: "sandbox" | "missions" | "comparison" | "history" | "saved" | "ctf" = "sandbox") => {
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

  // Hydrate each signed-in user from Firestore and update their daily streak.
  useEffect(() => {
    // Connect to emulators if explicitly requested via environment variable
    try { useEmulatorsIfDev(); } catch {}

    const unsubscribeAuth = firebaseOnAuthStateChanged(auth, async (user) => {
      firestoreReady.current = false;
      if (activeUnsubscribeRef.current) {
        activeUnsubscribeRef.current();
        activeUnsubscribeRef.current = null;
      }

      if (!user) {
        if (import.meta.env.DEV) {
          console.log('[ECORP:PERSISTENCE] AUTH_UNAUTHENTICATED');
        }
        firestoreUserId.current = null;
        setUserProgress(initialProgress);
        return;
      }

      if (import.meta.env.DEV) {
        console.log(`[ECORP:PERSISTENCE] AUTH_READY uid=${user.uid} email=${user.email || 'none'}`);
      }
      firestoreUserId.current = user.uid;

      try {
        const readResult = await readUserDoc(user.uid);
        const todayUtc = getUtcDateString();

        if (readResult.error) {
          // Firestore read failed (network/permission issue) -> PRESERVE local cache, DO NOT overwrite Firestore
          if (import.meta.env.DEV) {
            console.warn(`[ECORP:PERSISTENCE] READ_FAILURE path=users/${user.uid} - preserving cached state`);
          }
          const cached = loadCachedProgress(user.uid);
          setUserProgress(cached);
          firestoreReady.current = true;
          return;
        }

        if (readResult.exists && readResult.data) {
          // Existing user profile found in Firestore
          if (import.meta.env.DEV) {
            console.log(`[ECORP:PERSISTENCE] FIRESTORE_READ path=users/${user.uid} exists=true`);
          }
          const data = readResult.data;
          const existingStreak = typeof data.currentStreak === 'number'
            ? data.currentStreak
            : (typeof data.streakDays === 'number' ? data.streakDays : 1);
          const streakResult = computeDailyStreak(data.lastLoginDate, existingStreak);

          const arrayFromDoc = Array.isArray(data.completedLessons) ? data.completedLessons : [];
          const mapKeys = data.lessons && typeof data.lessons === 'object'
            ? Object.keys(data.lessons).filter(k => data.lessons[k])
            : [];
          const mergedLessons = Array.from(new Set([...arrayFromDoc, ...mapKeys]));

          const cloudProgress: UserProgress = {
            ...initialProgress,
            completedLessons: mergedLessons,
            completedMissions: Array.isArray(data.completedMissions) ? data.completedMissions : [],
            missionScores: data.missionScores && typeof data.missionScores === "object" ? data.missionScores : {},
            bookmarkedPatterns: Array.isArray(data.bookmarkedPatterns) ? data.bookmarkedPatterns : [],
            savedCustomPrompts: Array.isArray(data.savedCustomPrompts) ? data.savedCustomPrompts : [],
            xp: typeof data.xp === "number" ? data.xp : initialProgress.xp,
            streakDays: streakResult.streak,
            achievements: Array.isArray(data.achievements) ? data.achievements : [],
          };

          isRemoteUpdate.current = true;
          setUserProgress(cloudProgress);

          if (import.meta.env.DEV) {
            console.log(`[ECORP:PERSISTENCE] HYDRATION source=firestore xp=${cloudProgress.xp} lessons=${cloudProgress.completedLessons.length}`);
          }

          // Update user-namespaced local cache
          try {
            localStorage.setItem(getStorageKeyForUid(user.uid), JSON.stringify(cloudProgress));
          } catch (e) {
            console.warn("Could not cache user progress locally", e);
          }

          // Persist updated streak and lastLoginDate to Firestore
          try {
            await setDoc(doc(db, USERS_COLLECTION, user.uid), {
              displayName: user.displayName || data.displayName || "Ecorp Scholar",
              photoURL: user.photoURL || data.photoURL || null,
              currentStreak: streakResult.streak,
              streakDays: streakResult.streak,
              lastLoginDate: streakResult.date,
            }, { merge: true });
          } catch (updateErr) {
            console.warn("Could not update login streak in Firestore", updateErr);
          }
        } else {
          // Genuinely a new user: snapshot.exists() === false AND read succeeded without error
          if (import.meta.env.DEV) {
            console.log(`[ECORP:PERSISTENCE] NEW_USER_INITIALIZATION path=users/${user.uid}`);
          }
          const newUserData = {
            displayName: user.displayName || "Ecorp Scholar",
            photoURL: user.photoURL || null,
            curriculumProgress: 0,
            completedLessonCount: 0,
            curriculumProgressPercent: 0,
            currentStreak: 1,
            streakDays: 1,
            lastLoginDate: todayUtc,
            xp: initialProgress.xp,
            completedLessons: [],
            lessons: {},
            completedMissions: [],
            missionScores: {},
            bookmarkedPatterns: [],
            savedCustomPrompts: [],
            achievements: [],
          };

          try {
            await setDoc(doc(db, USERS_COLLECTION, user.uid), newUserData, { merge: true });
            if (import.meta.env.DEV) {
              console.log(`[ECORP:PERSISTENCE] FIRESTORE_WRITE path=users/${user.uid} type=new_user success=true`);
            }
          } catch (createErr) {
            console.warn("Could not create initial user document in Firestore", createErr);
          }

          isRemoteUpdate.current = true;
          setUserProgress(initialProgress);

          try {
            localStorage.setItem(getStorageKeyForUid(user.uid), JSON.stringify(initialProgress));
          } catch (e) {
            console.warn("Could not cache initial progress locally", e);
          }
        }

        firestoreReady.current = true;

        // Subscribe to real-time updates so multi-tab / multi-device changes reflect immediately
        activeUnsubscribeRef.current = subscribeToUserDoc(user.uid, (docData) => {
          if (!firestoreReady.current || !docData || auth.currentUser?.uid !== user.uid) return;
          const arrayFromDoc2 = Array.isArray(docData.completedLessons) ? docData.completedLessons : [];
          const mapKeys2 = docData.lessons && typeof docData.lessons === 'object'
            ? Object.keys(docData.lessons).filter(k => docData.lessons[k])
            : [];
          const merged2 = Array.from(new Set([...arrayFromDoc2, ...mapKeys2]));

          isRemoteUpdate.current = true;
          setUserProgress((previous) => {
            const nextProgress: UserProgress = {
              ...previous,
              completedLessons: merged2,
              completedMissions: Array.isArray(docData.completedMissions) ? docData.completedMissions : previous.completedMissions,
              missionScores: docData.missionScores && typeof docData.missionScores === "object" ? docData.missionScores : previous.missionScores,
              bookmarkedPatterns: Array.isArray(docData.bookmarkedPatterns) ? docData.bookmarkedPatterns : previous.bookmarkedPatterns,
              savedCustomPrompts: Array.isArray(docData.savedCustomPrompts) ? docData.savedCustomPrompts : previous.savedCustomPrompts,
              xp: typeof docData.xp === "number" ? docData.xp : previous.xp,
              streakDays: typeof docData.currentStreak === "number" ? docData.currentStreak : previous.streakDays,
              achievements: Array.isArray(docData.achievements) ? docData.achievements : previous.achievements,
            };
            try {
              localStorage.setItem(getStorageKeyForUid(user.uid), JSON.stringify(nextProgress));
            } catch {}
            return nextProgress;
          });
        });

        if (import.meta.env.DEV) {
          console.log(`[ECORP:PERSISTENCE] LISTENER_ATTACHED uid=${user.uid}`);
        }
      } catch (error) {
        console.warn("[ECORP:PERSISTENCE] Unexpected error during hydration, preserving cached state", error);
        const cached = loadCachedProgress(user.uid);
        setUserProgress(cached);
        firestoreReady.current = true;
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
      localStorage.setItem(getStorageKeyForUid(currentUid), JSON.stringify(userProgress));
    } catch (e) {
      console.warn("Could not save progress to localStorage", e);
    }
  }, [userProgress]);

  // Persist all user-initiated progress mutations to Firestore via 250ms debounce
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !firestoreReady.current || firestoreUserId.current !== user.uid) return;
    
    // If this state update originated from remote snapshot, skip redundant write-back
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    if (syncTimerRef.current !== null) {
      window.clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = window.setTimeout(() => {
      syncTimerRef.current = null;
      void syncProgressToDbDirect(user.uid, userProgress, user);
    }, 250);

    return () => {
      if (syncTimerRef.current !== null) {
        window.clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    };
  }, [userProgress]);

  // Check health endpoint for backend / real Gemini API availability
  useEffect(() => {
    fetch("/api/health")
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

  const executeCurrentPrompt = async (customPrompt?: string): Promise<ExecutionResult> => {
    const textToExecute = customPrompt !== undefined ? customPrompt : prompt;
    setIsExecuting(true);
    const startTime = Date.now();

    const analysis = analyzePrompt(textToExecute);

    let resultText = "";
    let isMock = true;
    let modelName = "Mock AI Engine (Keywords & Heuristics)";
    let duration = 300;
    let tokenCount = analysis.tokenEstimate + 120;

    if (aiMode === "real" && hasRealApiAvailable) {
      try {
        const response = await fetch("/api/gemini/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: textToExecute,
            systemInstruction,
            temperature,
            topP
          })
        });
        const data = await response.json();
        if (data.text) {
          resultText = data.text;
          isMock = false;
          modelName = data.model || "gemini-3.7-flash";
          duration = Date.now() - startTime;
          tokenCount = (data.usage?.candidatesTokenCount || 100) + analysis.tokenEstimate;
        } else {
          throw new Error(data.error || "Failed real AI execution");
        }
      } catch (err: any) {
        console.warn("Falling back to Mock AI Engine due to error:", err);
        const mock = generateMockAiResponse(textToExecute, systemInstruction, temperature);
        resultText = mock.text;
        duration = Date.now() - startTime;
      }
    } else {
      // Simulate brief network delay for realism
      await new Promise((r) => setTimeout(r, 400));
      const mock = generateMockAiResponse(textToExecute, systemInstruction, temperature);
      resultText = mock.text;
      duration = Date.now() - startTime;
      tokenCount = analysis.tokenEstimate + mock.simulatedTokens;
    }

    const execResult: ExecutionResult = {
      id: "exec-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7),
      prompt: textToExecute,
      systemInstruction,
      output: resultText,
      timestamp: Date.now(),
      durationMs: Math.max(120, duration),
      tokenCount,
      isMock,
      model: modelName,
      status: "success",
      detectedTechniques: analysis.techniqueBadges
    };

    setIsExecuting(false);
    setLastResult(execResult);
    setExecutionHistory((prev) => [execResult, ...prev.slice(0, 19)]);

    // Award small XP for practicing
    setUserProgress((prev) => ({
      ...prev,
      xp: prev.xp + 5
    }));

    return execResult;
  };

  const executeComparison = async () => {
    setIsExecuting(true);
    // Execute Variant A
    await executeCurrentPrompt(prompt);
    
    // Execute Variant B
    const startTimeB = Date.now();
    const analysisB = analyzePrompt(comparisonPromptB);
    let resultTextB = "";
    let isMockB = true;
    let modelNameB = "Mock AI Engine (Baseline)";
    let durationB = 300;
    let tokenCountB = analysisB.tokenEstimate + 100;

    if (aiMode === "real" && hasRealApiAvailable) {
      try {
        const response = await fetch("/api/gemini/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: comparisonPromptB,
            systemInstruction,
            temperature,
            topP
          })
        });
        const data = await response.json();
        if (data.text) {
          resultTextB = data.text;
          isMockB = false;
          modelNameB = data.model || "gemini-3.7-flash";
          durationB = Date.now() - startTimeB;
          tokenCountB = (data.usage?.candidatesTokenCount || 100) + analysisB.tokenEstimate;
        } else {
          throw new Error(data.error || "Failed real AI execution");
        }
      } catch (err: any) {
        console.warn("Falling back to Mock AI Engine for Variant B:", err);
        const mockB = generateMockAiResponse(comparisonPromptB, systemInstruction, temperature);
        resultTextB = mockB.text;
        durationB = Date.now() - startTimeB;
      }
    } else {
      await new Promise((r) => setTimeout(r, 350));
      const mockB = generateMockAiResponse(comparisonPromptB, systemInstruction, temperature);
      resultTextB = mockB.text;
      durationB = Date.now() - startTimeB;
      tokenCountB = analysisB.tokenEstimate + mockB.simulatedTokens;
    }

    const execResultB: ExecutionResult = {
      id: "exec-comp-b-" + Date.now(),
      prompt: comparisonPromptB,
      systemInstruction,
      output: resultTextB,
      timestamp: Date.now(),
      durationMs: Math.max(100, durationB),
      tokenCount: tokenCountB,
      isMock: isMockB,
      model: modelNameB,
      status: "success",
      detectedTechniques: analysisB.techniqueBadges
    };

    setComparisonResultB(execResultB);
    setIsExecuting(false);
  };

  const clearOutput = () => {
    setLastResult(null);
    setComparisonResultB(null);
  };

  const evaluateMission = async (missionId: string, submittedPrompt: string): Promise<MissionEvaluationResult> => {
    setIsEvaluatingMission(true);
    const mission = missions.find((m) => m.id === missionId);
    
    if (!mission) {
      setIsEvaluatingMission(false);
      throw new Error("Mission not found");
    }

    const analysis = analyzePrompt(submittedPrompt);
    const lower = submittedPrompt.toLowerCase();

    // Check criteria
    const criteriaChecks = mission.targetCriteria.map((crit, idx) => {
      let passed = false;
      let feedback = "";

      if (idx === 0) {
        if (mission.validator.requiresRole) {
          passed = analysis.detectedFeatures.hasRole;
          feedback = passed
            ? "Strong persona definition detected."
            : "Missing persona formulation (e.g. 'Act as a Senior Copywriter...').";
        } else {
          passed = analysis.wordCount >= 20;
          feedback = passed ? "Clear objective formulated." : "Prompt needs more detail.";
        }
      } else if (idx === 1) {
        if (mission.validator.requiresDelimiters) {
          passed = analysis.detectedFeatures.hasDelimiters;
          feedback = passed
            ? "Clean delimiter boundaries used (XML or triple quotes)."
            : "Wrap input text in tags like <customer_review> or triple quotes.";
        } else {
          passed = lower.includes("audience") || lower.includes("for") || lower.includes("team") || analysis.wordCount >= 25;
          feedback = passed ? "Audience parameters defined." : "Specify who the target audience is.";
        }
      } else if (idx === 2) {
        if (mission.validator.requiresOutputFormat) {
          passed = analysis.detectedFeatures.hasFormattingConstraints;
          feedback = passed
            ? "Explicit output structure specified."
            : "Specify clear output format (e.g. JSON schema or bulleted structure).";
        } else {
          passed = analysis.wordCount >= 35;
          feedback = passed ? "Structural detail achieved." : "Provide structural section requirements.";
        }
      } else if (idx === 3) {
        if (mission.validator.requiresFewShot) {
          passed = analysis.detectedFeatures.hasFewShot;
          feedback = passed
            ? "Few-shot input/output demonstration pairs verified."
            : "Include 2-3 input/output demonstration pairs before the query.";
        } else if (mission.validator.requiresCoT) {
          passed = analysis.detectedFeatures.hasChainOfThought;
          feedback = passed
            ? "Chain-of-Thought deduction steps mandated."
            : "Force step-by-step reasoning or a scratchpad deduction block.";
        } else {
          passed = submittedPrompt.length >= mission.validator.minCharLength;
          feedback = passed ? "Length and boundary constraints met." : "Prompt is too brief to constrain output.";
        }
      } else {
        passed = analysis.score >= 60;
        feedback = passed ? "High overall prompt engineering fidelity." : "Add further precision to eliminate ambiguity.";
      }

      return {
        criteria: crit,
        passed,
        feedback
      };
    });

    const passedCount = criteriaChecks.filter((c) => c.passed).length;
    const totalCount = criteriaChecks.length;
    let score = Math.round((passedCount / totalCount) * 70 + (analysis.score * 0.3));
    score = Math.min(100, Math.max(25, score));

    let grade: MissionEvaluationResult["grade"] = "D";
    if (score >= 90) grade = "S";
    else if (score >= 80) grade = "A";
    else if (score >= 65) grade = "B";
    else if (score >= 50) grade = "C";

    const passed = score >= 70;
    const xpEarned = passed ? 100 : 25;

    let generalFeedback = "";
    if (grade === "S") {
      generalFeedback = "Exceptional prompt craftsmanship! Your prompt meets enterprise production standards with zero ambiguity.";
    } else if (grade === "A") {
      generalFeedback = "Great job! Strong structural framing with clear constraints. Ready for mission completion.";
    } else if (grade === "B") {
      generalFeedback = "Solid attempt! A few constraints or formatting specifications could be tightened up.";
    } else {
      generalFeedback = "Needs refinement. Review the hints and target criteria to add required techniques.";
    }

    const evaluationResult: MissionEvaluationResult = {
      missionId,
      score,
      grade,
      passed,
      criteriaChecks,
      generalFeedback,
      xpEarned
    };

    if (passed) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      setUserProgress((prev) => {
        const isAlreadyCompleted = prev.completedMissions.includes(missionId);
        const completed = isAlreadyCompleted
          ? prev.completedMissions
          : [...prev.completedMissions, missionId];
        return {
          ...prev,
          completedMissions: completed,
          missionScores: { ...prev.missionScores, [missionId]: Math.max(prev.missionScores[missionId] || 0, score) },
          xp: isAlreadyCompleted ? prev.xp : prev.xp + xpEarned
        };
      });
    }

    setIsEvaluatingMission(false);
    setMissionResult(evaluationResult);
    return evaluationResult;
  };

  const markLessonComplete = (lessonId: string) => {
    // Optimistic local update with duplicate completion protection
    setUserProgress((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
      return { ...prev, completedLessons: [...prev.completedLessons, lessonId], xp: prev.xp + 40 };
    });
  };

  const addXp = (amount: number) => {
    setUserProgress((prev) => ({
      ...prev,
      xp: prev.xp + amount
    }));
  };

  const saveCustomPrompt = (title: string, promptText: string) => {
    setUserProgress((prev) => ({
      ...prev,
      savedCustomPrompts: [
        { id: "p-" + Date.now(), title, prompt: promptText, createdAt: Date.now() },
        ...prev.savedCustomPrompts
      ],
      xp: prev.xp + 15
    }));
  };

  const deleteCustomPrompt = (id: string) => {
    setUserProgress((prev) => ({
      ...prev,
      savedCustomPrompts: prev.savedCustomPrompts.filter((p) => p.id !== id)
    }));
  };

  const toggleBookmarkPattern = (patternId: string) => {
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
        markLessonComplete,
        addXp,
        saveCustomPrompt,
        deleteCustomPrompt,
        toggleBookmarkPattern,
        syncProgressToDb,
        logout,
        isDistractionFreeMode,
        setIsDistractionFreeMode,
        language,
        setLanguage,
        t,
        currentCurriculum,
        loadIntoPlayground
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
