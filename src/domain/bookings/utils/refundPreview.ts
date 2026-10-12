import type { CancellationPolicy, RefundPercent } from '../types/bookings';

const HOUR_MS = 60 * 60 * 1000;

/**
 * Mesma regra de server/domain/bookings/utils/cancellationRefund.ts, só para mostrar o valor antes de
 * cancelar. Quem decide o reembolso é o backend.
 */
export function previewRefund(params: {
  policy: CancellationPolicy;
  startsAt: string;
  totalMinor: number;
  now: Date;
}): { refundPercent: RefundPercent; refundAmountMinor: number } {
  const startsAtMs = new Date(params.startsAt).getTime();
  const nowMs = params.now.getTime();
  let refundPercent: RefundPercent;
  if (nowMs >= startsAtMs) refundPercent = 0;
  else if (nowMs <= startsAtMs - params.policy.freeCancellationHoursBefore * HOUR_MS)
    refundPercent = 100;
  else refundPercent = params.policy.refundPercentAfterDeadline;
  return {
    refundPercent,
    refundAmountMinor: Math.floor((params.totalMinor * refundPercent) / 100),
  };
}
