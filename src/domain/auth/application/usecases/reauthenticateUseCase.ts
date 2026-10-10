import type { AuthPort } from '../../types/authPort';

export function createReauthenticateUseCase(authPort: AuthPort) {
  return async (email: string, currentPassword: string): Promise<void> => {
    return authPort.reauthenticate(email, currentPassword);
  };
}
