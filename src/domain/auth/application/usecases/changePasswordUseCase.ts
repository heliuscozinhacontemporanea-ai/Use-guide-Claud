import type { AuthPort } from '../../types/authPort';

export function createChangePasswordUseCase(authPort: AuthPort) {
  return async (newPassword: string): Promise<void> => {
    return authPort.changePassword(newPassword);
  };
}
