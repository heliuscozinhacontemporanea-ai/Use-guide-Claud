import {
  type Booking,
  type BookingActor,
  getOpenProviderAbsenceUseCase,
  resolveProviderAbsenceUseCase,
} from '../../../domain/bookings';
import { decideSaleClaimApplicationUseCase } from '../payouts/decideSaleClaimApplicationUseCase';
import { sendBookingServiceNotice } from './bookingServiceNotices';

export const SYSTEM_ACTOR = 'system';

/**
 * Reembolso integral e multa de 20% quando o prestador admite a falta ou não responde em 2 h (D20).
 * Reembolsa antes de gravar o desfecho: se o Stripe falhar, o relato continua aberto e o job tenta de novo.
 */
export async function refundProviderAbsence(
  booking: Booking,
  claimId: string,
  actorUid: string,
  answer?: 'admitted'
): Promise<Booking> {
  await decideSaleClaimApplicationUseCase(SYSTEM_ACTOR, claimId, {
    outcome: 'refund_full',
    chargePenalty: true,
  });
  const resolved = await resolveProviderAbsenceUseCase(
    booking.id,
    { resolution: 'refunded', ...(answer ? { answer } : {}) },
    actorUid
  );
  await sendBookingServiceNotice(booking.buyerId, 'absenceRefundedBuyer');
  await sendBookingServiceNotice(booking.sellerPartnerId, 'absenceRefundedPartner');
  return resolved;
}

/** Resposta do prestador ao "O prestador não veio": admite a falta ou diz que esteve lá (D20). */
export async function answerProviderAbsenceApplicationUseCase(
  actor: BookingActor,
  offerId: string,
  bookingId: string,
  answer: 'was_there' | 'admitted'
): Promise<Booking> {
  const booking = await getOpenProviderAbsenceUseCase(actor, offerId, bookingId);
  if (answer === 'admitted') {
    return refundProviderAbsence(booking, booking.providerAbsence.claimId, actor.uid, 'admitted');
  }
  // A reclamação continua aberta na fila do admin, que decide com o "Cheguei" e a conversa.
  const resolved = await resolveProviderAbsenceUseCase(
    booking.id,
    { answer, resolution: 'admin' },
    actor.uid
  );
  await sendBookingServiceNotice(
    booking.buyerId,
    'absenceToAdmin',
    booking.offerSnapshot.businessName
  );
  return resolved;
}
