import { payoutService } from '../factory';
import type { PayoutEntry } from '../types/payoutEntry';

export function holdPayoutForDisputeUseCase(paymentIntentId: string): Promise<PayoutEntry | null> {
  return payoutService.holdForDispute(paymentIntentId);
}
