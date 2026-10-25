import { payoutService } from '../factory';
import type { DisputeOutcome } from '../services/payoutService';
import type { PayoutEntry } from '../types/payoutEntry';

export function closePayoutDisputeUseCase(
  paymentIntentId: string,
  outcome: DisputeOutcome
): Promise<PayoutEntry | null> {
  return payoutService.closeDispute(paymentIntentId, outcome);
}
