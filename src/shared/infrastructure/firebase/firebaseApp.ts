import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';

function requiredEnv(name: string): string {
  const value = import.meta.env[name]?.trim();
  if (!value) {
    throw new Error(`[Firebase Client] Variável obrigatória ausente: ${name}`);
  }
  return value;
}

const configuredAuthDomain = requiredEnv('VITE_FIREBASE_AUTH_DOMAIN');

const isUseGuideHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'useguide.com.br' ||
    window.location.hostname.endsWith('.useguide.com.br'));

const firebaseConfig = {
  apiKey: requiredEnv('VITE_FIREBASE_API_KEY'),
  authDomain: isUseGuideHost ? 'useguide.com.br' : configuredAuthDomain,
  projectId: requiredEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: requiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requiredEnv('VITE_FIREBASE_APP_ID'),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID?.trim() || undefined,
};

export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
