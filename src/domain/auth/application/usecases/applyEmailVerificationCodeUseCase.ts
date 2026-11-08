import type { AuthPort } from '../../types/authPort';

export function createApplyEmailVerificationCodeUseCase(authPort: AuthPort) {
  return (code: string): Promise<void> => authPort.applyEmailVerificationCode(code);
}
