import { UserPort } from '../ports/userPort';
import { UserProfile, UserData } from '../types/user';
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
        const error = new Error('REAUTHENTICATION_REQUIRED');
        (error as any).code = 'REAUTHENTICATION_REQUIRED';
        throw error;
      }
      throw new Error(errorData.error || 'Falha ao excluir conta via API');
    }
  }
}
