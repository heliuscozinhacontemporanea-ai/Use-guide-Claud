import type { CancellationPolicy } from '../types/bookingTypes';

const HOUR_MS = 60 * 60 * 1000;

/**
 * Reembolso do cancelamento pelo comprador: 100% até o prazo gratuito, depois o percentual da política,
 * e nada após o início. Math.floor garante que nunca se devolve mais do que foi pago.
 */
export function calculateCancellationRefund(params: {
  policy: CancellationPolicy;
  startsAt: string;
  totalMinor: number;
  now: Date;
}): { refundPercent: 0 | 50 | 100; refundAmountMinor: number } {
  const startsAtMs = new Date(params.startsAt).getTime();
  const nowMs = params.now.getTime();
  let refundPercent: 0 | 50 | 100;
  if (nowMs >= startsAtMs) {
    refundPercent = 0;
  } else if (nowMs <= startsAtMs - params.policy.freeCancellationHoursBefore * HOUR_MS) {
    refundPercent = 100;
  } else {
    refundPercent = params.policy.refundPercentAfterDeadline;
  }
  return {
    refundPercent,
    refundAmountMinor: Math.floor((params.totalMinor * refundPercent) / 100),
  };
}
