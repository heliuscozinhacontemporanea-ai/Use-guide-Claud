import type { AuthPort } from '../../types/authPort';

export function createRefreshEmailVerifiedUseCase(authPort: AuthPort) {
  return (): Promise<boolean> => authPort.refreshEmailVerified();
}
