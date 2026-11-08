import { bookingsApi } from '../../factory';
import type { CheckInCodeView } from '../../types/bookings';

export async function getCheckInCodeUseCase(bookingId: string): Promise<CheckInCodeView> {
  return bookingsApi.getCheckInCode(bookingId);
}
