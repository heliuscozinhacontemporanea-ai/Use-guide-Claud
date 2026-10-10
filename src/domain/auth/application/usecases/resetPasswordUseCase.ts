import type { AuthPort } from '../../types/authPort';

export function createResetPasswordUseCase(authPort: AuthPort) {
  return async (email: string): Promise<void> => {
    return authPort.resetPassword(email);
  };
}
