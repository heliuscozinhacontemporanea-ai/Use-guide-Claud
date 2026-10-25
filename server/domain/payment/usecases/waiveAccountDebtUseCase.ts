import { debtService } from '../factory';
import type { AccountDebt } from '../types/accountDebt';

export function waiveAccountDebtUseCase(debtId: string, adminUid: string): Promise<AccountDebt> {
  return debtService.waive(debtId, adminUid);
}
