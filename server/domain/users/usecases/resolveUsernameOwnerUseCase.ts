import { usernameService } from '../factory';
import type { UsernameOwner } from '../ports/usernamePort';

/** Conta dona do @, com e-mail e verificação, só para uso no servidor (transferência, D21). */
export function resolveUsernameOwnerUseCase(username: string): Promise<UsernameOwner> {
  return usernameService.findOwner(username);
}
