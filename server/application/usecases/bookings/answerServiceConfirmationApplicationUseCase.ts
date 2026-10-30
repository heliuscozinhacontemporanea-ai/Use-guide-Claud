import {
  type Booking,
  type BookingActor,
  getPendingServiceConfirmationUseCase,
  resolveServiceConfirmationUseCase,
  bookingServiceEndsAt,
} from '../../../domain/bookings';
import { decideSaleClaimUseCase, openSaleClaimUseCase } from '../../../domain/payment';
import { SYSTEM_ACTOR } from './answerProviderAbsenceApplicationUseCase';
import { sendBookingServiceNotice } from './bookingServiceNotices';

/**
 * Resposta do comprador a "O serviço aconteceu?" (D20). Sim vale como check-in confirmado. Não abre a
 * reclamação: sem nenhum registro do serviço, o reembolso é integral na hora; depois de "Cliente sem
 * código", o caso vai ao admin, que decide com o que o prestador registrou.
 */
export async function answerServiceConfirmationApplicationUseCase(
  actor: BookingActor,
  bookingId: string,
  answer: 'yes' | 'no'
): Promise<Booking> {
  const booking = await getPendingServiceConfirmationUseCase(actor, bookingId);
  if (answer === 'yes') {
    return resolveServiceConfirmationUseCase(
      booking.id,
      { answer, resolution: 'confirmed' },
      actor.uid
    );
  }
  const claim = await openSaleClaimUseCase({
    referenceType: 'booking',
    referenceId: booking.id,
    buyerUid: actor.uid,
    reason: 'did_not_happen',
    serviceStartsAt: booking.offerSnapshot.startsAt,
    serviceEndsAt: bookingServiceEndsAt(booking),
    // A pergunta dura 72 h e passa das 48 h da reclamação comum.
    allowAfterWindow: true,
  });
  if (booking.serviceConfirmation.reason === 'no_record') {
    await decideSaleClaimUseCase(claim.id, SYSTEM_ACTOR, { outcome: 'refund_full' });
    const refunded = await resolveServiceConfirmationUseCase(
      booking.id,
      { answer, claimId: claim.id, resolution: 'refunded' },
      actor.uid
    );
    await sendBookingServiceNotice(booking.buyerId, 'absenceRefundedBuyer');
    await sendBookingServiceNotice(booking.sellerPartnerId, 'confirmationRefundedPartner');
    return refunded;
  }
  const resolved = await resolveServiceConfirmationUseCase(
    booking.id,
    { answer, claimId: claim.id, resolution: 'admin' },
    actor.uid
  );
  await sendBookingServiceNotice(booking.sellerPartnerId, 'confirmationDenied');
  return resolved;
}
