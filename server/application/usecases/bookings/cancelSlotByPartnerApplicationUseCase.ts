import {
  type BookingActor,
  cancelBookingForCanceledSlotUseCase,
  cancelSlotByPartnerUseCase,
} from '../../../domain/bookings';
import { processProviderRefundUseCase } from '../../../domain/payment';
import { chargeCancellationPenaltyApplicationUseCase } from '../payouts/chargeCancellationPenaltyApplicationUseCase';

/**
 * Horário cancelado pelo parceiro: toda reserva paga é reembolsada por inteiro (AGENTS.md §8.7) e o CNPJ
 * paga a multa de 20% do valor vendido (D14). Repetir a chamada só refaz o que falhou (chaves idempotentes).
 */
export async function cancelSlotByPartnerApplicationUseCase(
  actor: BookingActor,
  offerId: string,
  slotId: string
): Promise<{ canceledBookings: number; refundsRequested: number; failedRefunds: number }> {
  const affected = await cancelSlotByPartnerUseCase(actor, offerId, slotId);
  // As já canceladas entram numa repetição; a multa é idempotente e ignora repasse já cancelado.
  const paid = affected.filter((booking) => booking.status !== 'pending_payment');
  // Antes dos reembolsos, que reduzem o valor vendido; admin cancelando não gera multa automática.
  if (!actor.admin && paid.length > 0) {
    await chargeCancellationPenaltyApplicationUseCase({
      referenceType: 'booking_slot',
      referenceId: slotId,
      sales: paid.map((booking) => ({ referenceType: 'booking', referenceId: booking.id })),
    });
  }
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
