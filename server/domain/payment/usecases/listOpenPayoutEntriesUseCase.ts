import { payoutService } from '../factory';
import type { PayoutEntryView } from '../types/payoutEntry';

/** Vendas ainda não pagas, pela data de liberação. `accountKeys` são os CNPJs do parceiro logado. */
export function listOpenPayoutEntriesUseCase(
  accountKeys: string[],
  limit: number
): Promise<PayoutEntryView[]> {
  return payoutService.listOpenForAccounts(accountKeys, limit);
}
