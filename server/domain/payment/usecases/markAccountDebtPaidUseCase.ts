import { debtService } from '../factory';
import type { AccountDebt } from '../types/accountDebt';

export function markAccountDebtPaidUseCase(
  debtId: string,
  paymentIntentId: string
): Promise<AccountDebt | null> {
  return debtService.markPaid(debtId, paymentIntentId);
}
