import type { AuthPort } from '../../types/authPort';

export function createReauthenticateWithGoogleUseCase(authPort: AuthPort) {
  return async (): Promise<void> => {
    return authPort.reauthenticateWithGoogle();
  };
}
