import {
  type BookingActor,
  cancelBookingForCanceledSlotUseCase,
  cancelSlotByPartnerUseCase,
} from '../../../domain/bookings';
import { processProviderRefundUseCase } from '../../../domain/payment';

/**
 * Horário cancelado pelo parceiro: toda reserva paga é reembolsada por inteiro, com a taxa e o repasse
 * devolvidos (AGENTS.md §8.7). Repetir a chamada só refaz o que falhou (chaves idempotentes).
 */
export async function cancelSlotByPartnerApplicationUseCase(
  actor: BookingActor,
  offerId: string,
  slotId: string
): Promise<{ canceledBookings: number; refundsRequested: number; failedRefunds: number }> {
  const affected = await cancelSlotByPartnerUseCase(actor, offerId, slotId);
  let refundsRequested = 0;
  let failedRefunds = 0;
  for (const booking of affected) {
    const canceled = await cancelBookingForCanceledSlotUseCase(booking.id, actor.uid);
    const refundAmountMinor = canceled.cancellation?.refundAmountMinor ?? 0;
    if (refundAmountMinor <= 0 || !canceled.paymentIntentId) continue;
    try {
      await processProviderRefundUseCase({
        paymentIntentId: canceled.paymentIntentId,
        amountMinor: refundAmountMinor,
        idempotencyKey: `refund_slot_${canceled.id}`,
        metadata: { referenceType: 'booking_refund', bookingId: canceled.id },
      });
      refundsRequested += 1;
    } catch (error) {
      failedRefunds += 1;
      console.error('[cancelSlotByPartnerApplicationUseCase] refund failed', {
        bookingId: canceled.id,
        message: error instanceof Error ? error.message : 'unknown',
      });
    }
  }
  // TODO: avisar os compradores quando notifications aceitar destinatário usuário (débito B13).
  return { canceledBookings: affected.length, refundsRequested, failedRefunds };
}
