import {
  type Booking,
  type BookingActor,
  markBookingNoShowUseCase,
} from '../../../domain/bookings';
import { sendBookingServiceNotice } from './bookingServiceNotices';
import { releaseServiceProofHold } from './releaseServiceProofHold';

/** "Cliente não apareceu" e aviso ao comprador, que pode contestar pela reclamação (D16, D20). */
export async function markBookingNoShowApplicationUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<Booking> {
  const booking = await markBookingNoShowUseCase(actor, bookingId);
  // A ausência é a prova (D20); se o comprador contestar, a reclamação retém o repasse.
  await releaseServiceProofHold(booking.id);
  await sendBookingServiceNotice(
    booking.buyerId,
    'noShowMarked',
    booking.offerSnapshot.businessName
  );
  return booking;
}
