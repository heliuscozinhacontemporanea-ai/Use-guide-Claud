import type { AuthPort } from '../../types/authPort';

export function createSendEmailVerificationUseCase(authPort: AuthPort) {
  return (locale: string): Promise<void> => authPort.sendEmailVerification(locale);
}
