import { usernameService } from '../factory';

/** Escolhe ou troca o @ da conta (troca uma vez a cada 30 dias, D21). */
export function claimUsernameUseCase(uid: string, username: string): Promise<string> {
  return usernameService.claim(uid, username);
}
