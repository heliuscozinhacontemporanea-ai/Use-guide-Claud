import { getBookingService, getOfferService } from '../factory';
import type { PageRequest } from '../ports/bookingsPort';
import type { Booking, BookingActor, Page } from '../types/bookingTypes';

export async function listOfferBookingsForPartnerUseCase(
  actor: BookingActor,
  offerId: string,
  page: PageRequest
): Promise<Page<Booking>> {
  await getOfferService().getOwnedOffer(actor, offerId);
  return getBookingService().listOfferBookings(offerId, page);
}
