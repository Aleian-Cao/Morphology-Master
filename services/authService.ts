import { User, UserProgress } from '../types';
import { INITIAL_USER_PROGRESS } from '../constants';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const loginWithGoogle = async (): Promise<User | null> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user exists in Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    let progress = { ...INITIAL_USER_PROGRESS };
    
    if (userDoc.exists()) {
      progress = userDoc.data().progress;
    } else {
      // Create new user in Firestore
      await setDoc(userDocRef, {
        username: user.displayName || user.email || 'Learner',
        progress,
        uid: user.uid
      });
    }
    
    return { username: user.displayName || user.email || 'Learner', progress, uid: user.uid };
  } catch (error) {
    console.error("Google Login Error:", error);
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

export const saveUserProgress = async (uid: string, progress: UserProgress) => {
  if (!uid) return;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, { progress }, { merge: true });
  } catch (error) {
    console.error("Error saving progress:", error);
  }
};