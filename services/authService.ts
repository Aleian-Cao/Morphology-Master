import { User, UserProgress } from '../types';
import { INITIAL_USER_PROGRESS } from '../constants';

const DB_KEY = 'morphology_users_db';
const SESSION_KEY = 'morphology_current_user';

interface UserDatabase {
  [username: string]: UserProgress;
}

// Helper to get DB
const getDB = (): UserDatabase => {
  const db = localStorage.getItem(DB_KEY);
  return db ? JSON.parse(db) : {};
};

// Helper to save DB
const saveDB = (db: UserDatabase) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const loginUser = (username: string): User => {
  const db = getDB();
  let progress = db[username];

  if (!progress) {
    // New user, create entry
    progress = { ...INITIAL_USER_PROGRESS };
    db[username] = progress;
    saveDB(db);
  }

  const user = { username, progress };
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};

export const saveUserProgress = (username: string, progress: UserProgress) => {
  const db = getDB();
  db[username] = progress;
  saveDB(db);
  
  // Also update session
  localStorage.setItem(SESSION_KEY, JSON.stringify({ username, progress }));
};