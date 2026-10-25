import { payoutService } from '../factory';
import type { PayoutEntry } from '../types/payoutEntry';

export function closePayoutDisputeUseCase(
  paymentIntentId: string,
  won: boolean
): Promise<PayoutEntry | null> {
  return payoutService.closeDispute(paymentIntentId, won);
}
