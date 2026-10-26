import { payoutService } from '../factory';
import type { PayoutEntryView } from '../types/payoutEntry';

/** `accountKeys` são os CNPJs do parceiro logado; quem chama garante isso. */
export function listPayoutEntriesUseCase(
  accountKeys: string[],
  limit: number,
  cursor?: string
): Promise<{ data: PayoutEntryView[]; nextCursor: string | null }> {
  return payoutService.listForAccounts(accountKeys, limit, cursor);
}
