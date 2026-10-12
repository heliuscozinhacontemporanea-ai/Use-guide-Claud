import { bookingsApi } from '../../factory';
import type { CancelBookingResponse } from '../../types/bookings';

export async function cancelBookingUseCase(bookingId: string): Promise<CancelBookingResponse> {
  return bookingsApi.cancelBooking(bookingId);
}
