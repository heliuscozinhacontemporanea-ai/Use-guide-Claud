import {
  type Booking,
  type BookingActor,
  type BookingArrival,
  recordSlotArrivalUseCase,
} from '../../../domain/bookings';
import { sendBookingServiceNotice } from './bookingServiceNotices';

/**
 * "Cheguei" do cartão "Agora" (D27, p42): a chegada vale para todas as reservas do horário que
 * ainda esperam o cliente, e cada cliente recebe "{{business}} chegou", que abre o código.
 */
export async function recordSlotArrivalApplicationUseCase(
  actor: BookingActor,
  offerId: string,
  slotId: string,
  location?: BookingArrival['location']
): Promise<Booking[]> {
  const bookings = await recordSlotArrivalUseCase(actor, offerId, slotId, location);
  await Promise.all(
    bookings.map((booking) =>
      sendBookingServiceNotice(
        booking.buyerId,
        'providerArrived',
        booking.offerSnapshot.businessName,
        booking.id
      )
    )
  );
  return bookings;
}
