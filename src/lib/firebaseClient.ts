import { initializeApp } from "firebase/app";
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

// Initialize Firebase App (singleton)
const app = initializeApp(firebaseConfig as any);

// Testing hook: if the browser sets window.__E2E_MOCK_AUTH, provide a minimal mock auth
// This lets e2e scripts run without contacting Firebase (useful in CI or restricted envs).
let _auth: any;
if (typeof window !== 'undefined' && (window as any).__E2E_MOCK_AUTH) {
  const mockUser = (window as any).__E2E_MOCK_AUTH;
  _auth = {
    currentUser: mockUser,
    onAuthStateChanged: (cb: any) => {
      // Immediately notify with the mock user
      try { cb(mockUser); } catch (e) { /* ignore */ }
      return () => {};
    },
    // minimal signOut implementation
    signOut: () => {
      (window as any).__E2E_MOCK_AUTH = null;
      return Promise.resolve();
    }
  };
} else {
  _auth = getAuth(app);
}

// Exports for Auth and Firestore
export const auth = _auth as any;
export const db = getFirestore(app);

// Optional: connect to local emulators during development
export function useEmulatorsIfDev() {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    try {
      // Adjust ports if your emulators use different ports
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    } catch (e) {
      /* ignore if emulator connector not available in environment */
    }
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
    } catch (e) {
      /* ignore */
    }
  }
}

// Hydration helper: load and subscribe to user's Firestore doc
export function subscribeToUserDoc(uid: string, onChange: (data: any) => void) {
  const ref = doc(db, 'users', uid);
  return onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      onChange(null);
      return;
    }
    onChange(snap.data());
  });
}

// Utility to read user doc once
export async function readUserDoc(uid: string) {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// Convenience auth helpers
export const signIn = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
export const signOut = () => firebaseSignOut(auth);
export const sendPasswordReset = (email: string) => sendPasswordResetEmail(auth, email);

export { onAuthStateChanged };
