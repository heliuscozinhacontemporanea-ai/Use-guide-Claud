import type { AuthPort } from '../../types/authPort';

export function createHasPasswordSignInUseCase(authPort: AuthPort) {
  return (): boolean => authPort.hasPasswordSignIn();
}
