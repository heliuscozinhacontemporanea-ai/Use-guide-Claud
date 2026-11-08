import { type App, applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { type Auth, getAuth } from 'firebase-admin/auth';
import { type Firestore, getFirestore } from 'firebase-admin/firestore';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';
import { getStorage, type Storage } from 'firebase-admin/storage';

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[Firebase Admin] Variável obrigatória ausente: ${name}`);
  }
  return value;
}

let cachedApp: App | undefined;

function getFirebaseAdminApp(): App {
  if (cachedApp) return cachedApp;
  cachedApp =
    getApps()[0] ??
    initializeApp({
      // Sempre ADC, sem chave JSON (D23): no Cloud Run, a conta de serviço anexada; no desenvolvimento
      // local, `gcloud auth application-default login` ou os emuladores.
      credential: applicationDefault(),
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
export const adminMessaging: Messaging = lazyInstance(() => getMessaging(getFirebaseAdminApp()));
