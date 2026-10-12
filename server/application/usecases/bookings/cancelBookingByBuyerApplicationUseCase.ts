import { type BookingActor, requestCancellationByBuyerUseCase } from '../../../domain/bookings';
import { processProviderRefundUseCase } from '../../../domain/payment';

/**
 * Cancela pela política exibida antes da compra. O reembolso usa chave idempotente, então repetir a
 * chamada depois de uma falha no Stripe não devolve duas vezes. A reserva vira `refunded` no webhook.
 */
export async function cancelBookingByBuyerApplicationUseCase(
  actor: BookingActor,
  bookingId: string,
  reason: string
): Promise<{ status: string; refundPercent: number; refundAmountMinor: number }> {
  const result = await requestCancellationByBuyerUseCase(actor, bookingId, reason);
  if (result.refundAmountMinor > 0 && result.booking.paymentIntentId) {
    await processProviderRefundUseCase({
      paymentIntentId: result.booking.paymentIntentId,
      amountMinor: result.refundAmountMinor,
      reverseTransfer: true,
      // Taxa da plataforma só volta no reembolso integral (cancelamento dentro do prazo gratuito).
      refundApplicationFee: result.refundPercent === 100,
      idempotencyKey: `refund_booking_${bookingId}`,
      metadata: { referenceType: 'booking_refund', bookingId },
    });
  }
  return {
    status: result.booking.status,
    refundPercent: result.refundPercent,
    refundAmountMinor: result.refundAmountMinor,
  };
}
