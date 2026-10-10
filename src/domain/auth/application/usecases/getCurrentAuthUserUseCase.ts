import type { AuthPort } from '../../types/authPort';
import type { AuthIdentity } from '../../types/auth';

export function createGetCurrentAuthUserUseCase(authPort: AuthPort) {
  return (): AuthIdentity | null => {
    return authPort.getCurrentUser();
  };
}
