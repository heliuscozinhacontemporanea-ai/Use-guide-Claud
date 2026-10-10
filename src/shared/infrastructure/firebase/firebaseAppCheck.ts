import {
  getToken,
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  type AppCheck,
} from 'firebase/app-check';
import { firebaseApp } from './firebaseApp';

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (
    globalThis as typeof globalThis & {
      FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean;
    }
  ).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

const siteKey = import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY?.trim();

export const appCheck: AppCheck | null = siteKey
  ? initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaEnterpriseProvider(siteKey),
      isTokenAutoRefreshEnabled: true,
    })
  : null;

export async function getFirebaseAppCheckToken(): Promise<string> {
  if (!appCheck) {
    if (import.meta.env.MODE === 'test') {
      return 'test-app-check-token';
    }
    throw new Error('Firebase App Check não inicializado');
  }
  const result = await getToken(appCheck, false);
  return result.token;
}
