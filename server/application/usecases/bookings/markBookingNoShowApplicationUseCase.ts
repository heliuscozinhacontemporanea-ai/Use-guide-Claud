import {
  type Booking,
  type BookingActor,
  markBookingNoShowUseCase,
} from '../../../domain/bookings';
import { sendBookingServiceNotice } from './bookingServiceNotices';

/** "Cliente não apareceu" e aviso ao comprador, que pode contestar pela reclamação (D16, D20). */
export async function markBookingNoShowApplicationUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<Booking> {
  const booking = await markBookingNoShowUseCase(actor, bookingId);
  await sendBookingServiceNotice(booking.buyerId, 'noShowMarked');
  return booking;
}
