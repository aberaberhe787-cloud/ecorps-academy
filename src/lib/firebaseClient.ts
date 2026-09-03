import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  connectFirestoreEmulator,
} from "firebase/firestore";
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App (Canonical Safe Singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig as any);

// Provide test hook for e2e tests
let _auth: any;
if (typeof window !== 'undefined' && (window as any).__E2E_MOCK_AUTH) {
  const mockUser = (window as any).__E2E_MOCK_AUTH;
  _auth = {
    currentUser: mockUser,
    onAuthStateChanged: (cb: any) => {
      try { cb(mockUser); } catch (e) { /* ignore */ }
      return () => {};
    },
    signOut: () => {
      (window as any).__E2E_MOCK_AUTH = null;
      return Promise.resolve();
    }
  };
} else {
  _auth = getAuth(app);
}

export const auth = _auth as any;

// Canonical Firestore database instance
const databaseId = (firebaseConfig as any).firestoreDatabaseId;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);

// Safe emulator hook: ONLY connect when VITE_USE_FIREBASE_EMULATORS === 'true'
let emulatorsConnected = false;
export function useEmulatorsIfDev() {
  if (typeof window === 'undefined') return;
  const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
  if (!useEmulators) return;
  if (emulatorsConnected) return;

  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    if (import.meta.env.DEV) {
      console.log('[ECORP:PERSISTENCE] Auth emulator connected on port 9099');
    }
  } catch (e) {
    console.warn("Auth emulator connection failed", e);
  }
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    if (import.meta.env.DEV) {
      console.log('[ECORP:PERSISTENCE] Firestore emulator connected on port 8080');
    }
  } catch (e) {
    console.warn("Firestore emulator connection failed", e);
  }
  emulatorsConnected = true;
}

// Hydration helper: subscribe to user's Firestore document
export function subscribeToUserDoc(
  uid: string,
  onChange: (data: any) => void,
  onError?: (error: any) => void
) {
  const ref = doc(db, 'users', uid);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        onChange(null);
        return;
      }
      onChange(snap.data());
    },
    (error) => {
      if (import.meta.env.DEV) {
        console.error(`[ECORP:PERSISTENCE] SNAPSHOT_ERROR path=users/${uid}`, error);
      } else {
        const code = (error as any)?.code || 'snapshot_error';
        console.error(`[ECORP:PERSISTENCE] SNAPSHOT_ERROR code=${code}`);
      }
      if (onError) {
        onError(error);
      }
    }
  );
}

// Safe document read returning existence, data, and any captured error
export async function readUserDoc(uid: string): Promise<{ exists: boolean; data: any | null; error?: any; code?: string }> {
  try {
    const ref = doc(db, 'users', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { exists: true, data: snap.data() };
    }
    return { exists: false, data: null };
  } catch (error: any) {
    const code = error?.code || 'unknown_error';
    if (import.meta.env.DEV) {
      console.error(`[ECORP:PERSISTENCE] FIRESTORE_READ_ERROR path=users/${uid} code=${code}`, error);
    } else {
      console.error(`[ECORP:PERSISTENCE] FIRESTORE_READ_ERROR code=${code}`);
    }
    return { exists: false, data: null, error, code };
  }
}

// Convenience auth helpers
export const signIn = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
export const signOut = () => firebaseSignOut(auth);
export const sendPasswordReset = (email: string) => sendPasswordResetEmail(auth, email);

export { onAuthStateChanged };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  if (import.meta.env.DEV) {
    console.error('[ECORP:PERSISTENCE] Firestore Error:', JSON.stringify(errInfo));
  }
  throw new Error(JSON.stringify(errInfo));
}
