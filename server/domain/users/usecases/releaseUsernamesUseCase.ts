import { usernameService } from '../factory';

/** Exclusão de conta: o @ fica reservado por 14 dias e depois é liberado (D21). */
export function releaseUsernamesUseCase(uid: string): Promise<void> {
  return usernameService.releaseAll(uid);
}
