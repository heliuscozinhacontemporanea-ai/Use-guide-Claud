import type { AuthPort } from '../../types/authPort';

export function createConfirmPasswordResetUseCase(authPort: AuthPort) {
  return async (code: string, newPass: string): Promise<void> => {
    return authPort.confirmReset(code, newPass);
  };
}
