import { bookingsApi } from '../../factory';
import type { BookingDetails } from '../../types/bookings';

export async function getBookingUseCase(bookingId: string): Promise<BookingDetails> {
  return bookingsApi.getBooking(bookingId);
}
