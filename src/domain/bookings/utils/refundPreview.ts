import { calculateBuyerRefund } from '../../../shared/utils/cancellationPolicy';
import type { BookingSummary } from '../types/bookings';

/**
 * Mesma regra do backend (arrependimento, reagendamento e política gravada na compra), só para mostrar o valor antes de
 * cancelar. Quem decide o reembolso é o backend.
 */
export function previewRefund(
  booking: Pick<BookingSummary, 'kind' | 'offer' | 'totalMinor' | 'createdAt' | 'rescheduledAt'>,
  now: Date
): { refundPercent: number; refundAmountMinor: number } {
  const refund = calculateBuyerRefund({
    family: (booking.kind as string) === 'transfer' ? 'transfer' : 'booking',
    policy: booking.offer.cancellationPolicy,
    purchasedAt: booking.createdAt,
    startsAt: booking.offer.startsAt,
    now,
    paidMinor: booking.totalMinor,
    serviceFeeMinor: 0,
    rescheduledAt: booking.rescheduledAt ?? undefined,
  });
  return { refundPercent: refund.percent, refundAmountMinor: refund.refundMinor };
}
