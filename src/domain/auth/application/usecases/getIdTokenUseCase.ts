import type { AuthPort } from '../../types/authPort';

export function createGetIdTokenUseCase(authPort: AuthPort) {
  return async (forceRefresh?: boolean): Promise<string | null> => {
    return authPort.getIdToken(forceRefresh);
  };
}
