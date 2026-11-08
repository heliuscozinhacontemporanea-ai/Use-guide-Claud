import { getBookingServiceProofService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/** Reservas com prazo vencido de resposta do prestador ou do comprador (D20). */
export async function listBookingsWithDueDeadlineUseCase(limit = 100): Promise<Booking[]> {
  return getBookingServiceProofService().listBookingsWithDueDeadline(limit);
}
