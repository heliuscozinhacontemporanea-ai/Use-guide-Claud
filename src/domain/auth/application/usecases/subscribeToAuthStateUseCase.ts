import type { AuthPort } from '../../types/authPort';
import type { UserSession } from '../../types/auth';

export function createSubscribeToAuthStateUseCase(authPort: AuthPort) {
  return (callback: (session: UserSession | null) => void): (() => void) => {
    return authPort.subscribeToAuthState(callback);
  };
}
