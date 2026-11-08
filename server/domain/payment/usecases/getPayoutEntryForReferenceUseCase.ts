import { payoutService } from '../factory';
import type { PayoutEntry } from '../types/payoutEntry';

export function getPayoutEntryForReferenceUseCase(
  referenceType: string,
  referenceId: string
): Promise<PayoutEntry | null> {
  return payoutService.getForReference(referenceType, referenceId);
}
