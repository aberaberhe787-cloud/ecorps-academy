import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { UserProgress } from '../types';

export const saveProgress = async (progress: UserProgress) => {
  const user = auth.currentUser;
  if (!user) return;

  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    await updateDoc(userDocRef, { progress });
  } else {
    await setDoc(userDocRef, { progress });
  }
};
