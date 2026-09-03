import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { UserProgress } from '../types';

export const saveProgress = async (progress: UserProgress) => {
  const user = auth.currentUser;
  if (!user) return;

  // Always cache locally first to guarantee no data loss even if connection dropped
  try {
    localStorage.setItem(`ecorp_user_progress_${user.uid}`, JSON.stringify(progress));
    localStorage.setItem('ecorp_user_progress', JSON.stringify(progress));
  } catch (e) {
    console.warn('[progressUtils] Failed local cache write', e);
  }

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      await updateDoc(userDocRef, { progress });
    } else {
      await setDoc(userDocRef, { progress }, { merge: true });
    }
  } catch (e) {
    console.warn('[progressUtils] Remote progress save failed, progress safely retained in localStorage:', e);
  }
};
