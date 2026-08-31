// Canonical re-export to eliminate duplicate Firebase initialization instances
export {
  auth,
  db,
  useEmulatorsIfDev,
  subscribeToUserDoc,
  readUserDoc,
  signIn,
  signOut,
  sendPasswordReset,
  onAuthStateChanged,
  OperationType,
  handleFirestoreError,
} from './firebaseClient';
