import { usernameService } from '../factory';
import type { UsernameProfile } from '../services/usernameService';

/** Contas pelo começo do @ (Convidar, D27): @, nome e foto públicos. */
export function searchUsernamesUseCase(prefix: string): Promise<UsernameProfile[]> {
  return usernameService.searchProfiles(prefix);
}
