import { UserPort } from '../ports/userPort';
import type { Locale } from '../../../shared/i18n';
import { UserProfile, UserData, UsernameProfile } from '../types/user';
import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';

export class ApiUserAdapter implements UserPort {
  async getCurrentUser(): Promise<UserProfile | null> {
    const response = await firebaseApiFetch('/api/users/me', {}, { requireAuth: true });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Falha ao obter perfil do usuário');
    }

    const data = await response.json();
    if (!data || (!data.uid && !data.email)) {
      return null;
    }
    return data as UserProfile;
  }

  async updateCurrentUser(data: UserData): Promise<UserProfile> {
    const response = await firebaseApiFetch(
      '/api/users/me',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
      { requireAuth: true }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Falha ao atualizar perfil do usuário');
    }

    return await response.json();
  }

  async updatePreferredLocale(locale: Locale): Promise<void> {
    const response = await firebaseApiFetch(
      '/api/users/me/preferences',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferredLocale: locale }),
      },
      { requireAuth: true }
    );
    if (!response.ok) {
      throw new Error(`USER_PREFERENCES_${response.status}`);
    }
  }

  async deleteCurrentUser(): Promise<void> {
    const response = await firebaseApiFetch(
      '/api/users/me',
      {
        method: 'DELETE',
      },
      { requireAuth: true }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401 && errorData.error === 'REAUTHENTICATION_REQUIRED') {
        throw Object.assign(new Error('REAUTHENTICATION_REQUIRED'), {
          code: 'REAUTHENTICATION_REQUIRED',
        });
      }
      throw new Error(errorData.error || 'Falha ao excluir conta via API');
    }
  }

  async suggestUsername(name: string): Promise<string> {
    const response = await firebaseApiFetch(
      `/api/users/me/username-suggestion?name=${encodeURIComponent(name)}`,
      {},
      { requireAuth: true }
    );
    return (await readJson<{ username: string }>(response)).username;
  }

  async claimUsername(username: string): Promise<string> {
    const response = await firebaseApiFetch(
      '/api/users/me/username',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      },
      { requireAuth: true }
    );
    return (await readJson<{ username: string }>(response)).username;
  }

  async findByUsername(username: string): Promise<UsernameProfile> {
    const response = await firebaseApiFetch(
      `/api/users/by-username/${encodeURIComponent(username.replace(/^@/, '').toLowerCase())}`,
      {},
      { requireAuth: true }
    );
    return readJson<UsernameProfile>(response);
  }
}

/** Erro vira `Error(code)` para a tela traduzir (§12.5). */
async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.code || 'INTERNAL_ERROR');
  return body as T;
}
