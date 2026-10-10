import type { AuthPort } from '../../types/authPort';

export function createVerifyPasswordResetCodeUseCase(authPort: AuthPort) {
  return async (code: string): Promise<string> => {
    return authPort.verifyResetCode(code);
  };
}
