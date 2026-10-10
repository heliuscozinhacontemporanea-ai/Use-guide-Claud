import type { AuthPort } from '../../types/authPort';
import type { UserSession } from '../../types/auth';

export function createLoginWithGoogleUseCase(authPort: AuthPort) {
  return async (): Promise<UserSession> => {
    return authPort.loginWithSocialGoogle();
  };
}
