import {
  type Booking,
  type BookingActor,
  type BookingArrival,
  recordProviderArrivalUseCase,
} from '../../../domain/bookings';
import { sendBookingServiceNotice } from './bookingServiceNotices';

/**
 * "Cheguei" do prestador e aviso ao comprador (D20). Tocar de novo não muda a hora gravada, mas avisa o
 * comprador outra vez: serve de "ainda estou esperando".
 */
export async function recordProviderArrivalApplicationUseCase(
  actor: BookingActor,
  offerId: string,
  bookingId: string,
  location?: BookingArrival['location']
): Promise<Booking> {
  const booking = await recordProviderArrivalUseCase(actor, offerId, bookingId, location);
  await sendBookingServiceNotice(booking.buyerId, 'providerArrived');
  return booking;
}
