import { getApps, initializeApp, cert, applicationDefault, type App } from 'firebase-admin/app';
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

function resolveCredential() {
  const saKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  // Em produção (Cloud Run) a credencial é sempre a conta de serviço anexada (ADC);
  // a chave JSON só é aceita fora de produção (AGENTS.md §2.1).
  if (saKey && process.env.NODE_ENV !== 'production') {
    return cert(JSON.parse(saKey));
  }
  return applicationDefault();
}

let cachedApp: App | undefined;

function getFirebaseAdminApp(): App {
  if (cachedApp) return cachedApp;
  cachedApp =
    getApps()[0] ??
    initializeApp({
      credential: resolveCredential(),
      projectId:
        process.env.FIREBASE_PROJECT_ID?.trim() || process.env.VITE_FIREBASE_PROJECT_ID?.trim(),
      storageBucket: requiredEnv('FIREBASE_STORAGE_BUCKET'),
    });
  return cachedApp;
}

function lazyInstance<T extends object>(create: () => T): T {
  let instance: T | undefined;
  return new Proxy({} as T, {
    get(_target, property) {
      instance ??= create();
      const value = Reflect.get(instance, property, instance);
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  });
}

export const adminDb: Firestore = lazyInstance(() =>
  getFirestore(getFirebaseAdminApp(), requiredEnv('FIRESTORE_DATABASE_ID'))
);
export const adminAuth: Auth = lazyInstance(() => getAuth(getFirebaseAdminApp()));
export const adminStorage: Storage = lazyInstance(() => getStorage(getFirebaseAdminApp()));
