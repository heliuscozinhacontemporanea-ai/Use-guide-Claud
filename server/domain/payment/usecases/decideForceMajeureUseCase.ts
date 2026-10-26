import { debtService } from '../factory';
import type { AccountDebt } from '../types/accountDebt';

/** Quem chama garante o papel de admin. */
export function decideForceMajeureUseCase(
  debtId: string,
  adminUid: string,
  approve: boolean
): Promise<AccountDebt> {
  return debtService.decideForceMajeure(debtId, adminUid, approve);
}
