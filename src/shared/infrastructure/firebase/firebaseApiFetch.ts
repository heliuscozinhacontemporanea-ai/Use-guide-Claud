import { auth } from './firebaseAuth';
import { getFirebaseAppCheckToken } from './firebaseAppCheck';

export interface FirebaseApiFetchOptions {
  requireAuth?: boolean;
  /** Anexa o token só quando há usuário logado; a rota aceita visitantes. */
  optionalAuth?: boolean;
  requireAppCheck?: boolean;
}

export async function firebaseApiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: FirebaseApiFetchOptions = {}
): Promise<Response> {
  const { requireAuth = false, optionalAuth = false, requireAppCheck = true } = options;

  const headers = new Headers(init.headers);

  if (requireAuth || optionalAuth) {
    const currentUser = auth.currentUser;

    if (!currentUser && requireAuth) {
      throw new Error('Usuário não autenticado');
    }

    if (currentUser) {
      const idToken = await currentUser.getIdToken();
      headers.set('Authorization', `Bearer ${idToken}`);
    }
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
