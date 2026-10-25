import { payoutService } from '../factory';
import type { PayoutEntry } from '../types/payoutEntry';

/** Desconta do repasse um reembolso concluído; a mesma `refundKey` só conta uma vez. */
export function applyPayoutRefundUseCase(params: {
  referenceType: string;
  referenceId: string;
  refundKey: string;
  amountMinor: number;
  serviceFeeMinor: number;
}): Promise<PayoutEntry | null> {
  return payoutService.applyRefund(params);
}
