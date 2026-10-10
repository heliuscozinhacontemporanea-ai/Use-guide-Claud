import type { AuthPort } from '../../types/authPort';
import type { UserSession } from '../../types/auth';

export function createLoginWithEmailUseCase(authPort: AuthPort) {
  return async (email: string, password: string): Promise<UserSession> => {
    return authPort.loginWithEmail(email, password);
  };
}
