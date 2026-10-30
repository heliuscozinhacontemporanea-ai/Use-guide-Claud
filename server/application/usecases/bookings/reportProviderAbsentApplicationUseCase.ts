import {
  type Booking,
  type BookingActor,
  getBookingForAbsenceReportUseCase,
  recordProviderAbsenceUseCase,
} from '../../../domain/bookings';
import { openSaleClaimUseCase } from '../../../domain/payment';
import { bookingServiceWindow } from './bookingServiceWindow';
import { sendBookingServiceNotice } from './bookingServiceNotices';

/**
 * "O prestador não veio" (D20): abre a reclamação, que retém o repasse, e dá 2 h ao prestador para
 * responder. Sem resposta, o job reembolsa o comprador e cobra a multa.
 */
export async function reportProviderAbsentApplicationUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<Booking> {
  const booking = await getBookingForAbsenceReportUseCase(actor, bookingId);
  const claim = await openSaleClaimUseCase({
    referenceType: 'booking',
    referenceId: booking.id,
    buyerUid: actor.uid,
    reason: 'did_not_happen',
    ...bookingServiceWindow(booking),
  });
  const recorded = await recordProviderAbsenceUseCase(actor, booking.id, claim.id);
  await sendBookingServiceNotice(recorded.sellerPartnerId, 'absenceReported');
  return recorded;
}
