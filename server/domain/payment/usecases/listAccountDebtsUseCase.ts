import { debtService } from '../factory';
import type { AccountDebtView } from '../types/accountDebt';

export function listAccountDebtsUseCase(accountKeys: string[]): Promise<AccountDebtView[]> {
  return debtService.listForAccounts(accountKeys);
}
