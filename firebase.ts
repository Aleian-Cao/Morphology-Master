import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, memoryLocalCache } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

let cacheConfig;
try {
  cacheConfig = persistentLocalCache({ tabManager: persistentMultipleTabManager() });
} catch (e) {
  console.warn("IndexedDB persistent cache unavailable, using memory cache:", e);
  cacheConfig = memoryLocalCache();
}

// Initialize with long-polling transport enabled to prevent 10s WebChannel timeout behind Cloud Run proxies & browser iframes
export const db = initializeFirestore(app, {
  localCache: cacheConfig,
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
