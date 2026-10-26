import { payoutService } from '../factory';
import type { PayoutEntry } from '../types/payoutEntry';

/** Venda reagendada: o prazo do repasse acompanha a nova data (D16, 4A). */
export function reschedulePayoutUseCase(
  referenceType: string,
  referenceId: string,
  serviceEndsAt: string
): Promise<PayoutEntry | null> {
  return payoutService.reschedule(referenceType, referenceId, serviceEndsAt);
}
