import { payoutService } from '../factory';
import type { PayoutEntryView } from '../types/payoutEntry';

/** Repasses pagos desde `sinceIso`. `accountKeys` são os CNPJs do parceiro logado. */
export function listReleasedPayoutEntriesUseCase(
  accountKeys: string[],
  sinceIso: string,
  limit: number
): Promise<PayoutEntryView[]> {
  return payoutService.listReleasedForAccounts(accountKeys, sinceIso, limit);
}
