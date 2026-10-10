import type { AuthPort } from '../../types/authPort';

export function createLogoutUseCase(authPort: AuthPort) {
  return async (): Promise<void> => {
    return authPort.logout();
  };
}
