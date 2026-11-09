import {
  connectFirestoreEmulator,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { EMULATOR_HOST, EMULATOR_PORTS, useEmulators } from './emulators';
import { firebaseApp } from './firebaseApp';

function requiredEnv(name: string): string {
  const value = import.meta.env[name]?.trim();
  if (!value) {
    throw new Error(`[Firebase Firestore] Variável obrigatória ausente: ${name}`);
  }
  return value;
}

const localCache =
  typeof indexedDB !== 'undefined'
    ? persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    : memoryLocalCache();

export const db = initializeFirestore(
  firebaseApp,
  {
    localCache,
  },
  requiredEnv('VITE_FIREBASE_FIRESTORE_DATABASE_ID')
);
if (useEmulators) connectFirestoreEmulator(db, EMULATOR_HOST, EMULATOR_PORTS.firestore);
