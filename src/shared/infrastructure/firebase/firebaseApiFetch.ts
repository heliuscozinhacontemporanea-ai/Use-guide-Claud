import { auth } from './firebaseAuth';
import { getFirebaseAppCheckToken } from './firebaseAppCheck';

export interface FirebaseApiFetchOptions {
  requireAuth?: boolean;
  requireAppCheck?: boolean;
}

export async function firebaseApiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: FirebaseApiFetchOptions = {}
): Promise<Response> {
  const { requireAuth = false, requireAppCheck = true } = options;

  const headers = new Headers(init.headers);

  if (requireAuth) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    const idToken = await currentUser.getIdToken();

    headers.set('Authorization', `Bearer ${idToken}`);
  }

  if (requireAppCheck) {
    try {
      const appCheckToken = await getFirebaseAppCheckToken();
      headers.set('X-Firebase-AppCheck', appCheckToken);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[firebaseApiFetch] App Check ignorado em desenvolvimento:', error);
      } else {
        throw error;
      }
    }
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
