import type { AuthPort } from '../../types/authPort';
import type { UserSession } from '../../types/auth';

export function createRegisterWithEmailUseCase(authPort: AuthPort) {
  return async (email: string, password: string): Promise<UserSession> => {
    return authPort.registerWithEmail(email, password);
  };
}
