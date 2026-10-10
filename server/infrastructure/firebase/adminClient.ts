import { getApps, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getStorage, type Storage } from 'firebase-admin/storage';

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[Firebase Admin] Variável obrigatória ausente: ${name}`);
  }
  return value;
}

const databaseId = requiredEnv('FIRESTORE_DATABASE_ID');

const storageBucket = requiredEnv('FIREBASE_STORAGE_BUCKET');

function resolveCredential() {
  const saKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (saKey) {
    try {
      return cert(JSON.parse(saKey));
    } catch (error) {
      console.warn(
        '[Firebase Admin] Falha ao processar FIREBASE_SERVICE_ACCOUNT_KEY, utilizando ADC:',
        error
      );
    }
  }
  return applicationDefault();
}

const firebaseAdminApp =
  getApps()[0] ??
  initializeApp({
    credential: resolveCredential(),
    projectId:
      process.env.FIREBASE_PROJECT_ID?.trim() || process.env.VITE_FIREBASE_PROJECT_ID?.trim(),
    storageBucket,
  });

export const adminDb: Firestore = getFirestore(firebaseAdminApp, databaseId);

export const adminAuth: Auth = getAuth(firebaseAdminApp);

export const adminStorage: Storage = getStorage(firebaseAdminApp);
