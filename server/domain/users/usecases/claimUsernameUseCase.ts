import { usernameService } from '../factory';

/**
 * Escolhe ou troca o @ da conta (troca uma vez a cada 30 dias, D21). `previous` é o @ anterior
 * (nulo na primeira escolha), para avisar a conta de uma troca que ela não fez (D25).
 */
export async function claimUsernameUseCase(
  uid: string,
  username: string
): Promise<{ username: string; previous: string | null }> {
  const previous = await usernameService.currentUsername(uid);
  return { username: await usernameService.claim(uid, username), previous };
}
