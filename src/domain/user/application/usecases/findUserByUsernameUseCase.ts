import { userAdapter } from '../../factory';
import type { UsernameProfile } from '../../types/user';

/** Perfil público do @ (D21); outros domínios usam para confirmar uma transferência. */
export function findUserByUsernameUseCase(username: string): Promise<UsernameProfile> {
  return userAdapter.findByUsername(username);
}
