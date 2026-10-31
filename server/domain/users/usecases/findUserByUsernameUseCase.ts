import { usernameService } from '../factory';
import type { UsernameProfile } from '../services/usernameService';

/** Perfil público do @ (foto, nome e @), para confirmar quem recebe uma transferência. */
export function findUserByUsernameUseCase(username: string): Promise<UsernameProfile> {
  return usernameService.findProfile(username);
}
