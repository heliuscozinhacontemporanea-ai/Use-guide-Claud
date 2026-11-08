import { payoutService } from '../factory';
import type { PayoutEntry, PayoutHoldReason } from '../types/payoutEntry';

/** Solta uma retenção do repasse da venda; as outras continuam valendo. */
export function releasePayoutHoldUseCase(
  referenceType: string,
  referenceId: string,
  reason: PayoutHoldReason
): Promise<PayoutEntry | null> {
  return payoutService.releaseHold(referenceType, referenceId, reason);
}
