import { payoutService } from '../factory';
import type { PayoutEntryView } from '../types/payoutEntry';

/** Repasses das vendas dadas; quem chama já conferiu que as vendas são do parceiro logado. */
export function listPayoutEntriesForReferencesUseCase(
  referenceType: string,
  referenceIds: string[]
): Promise<PayoutEntryView[]> {
  return payoutService.listForReferences(referenceType, referenceIds);
}
