import { getBookingServiceProofService } from '../factory';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** Confere se o comprador pode relatar "O prestador não veio" (D20); não grava nada. */
export async function getBookingForAbsenceReportUseCase(
  actor: BookingActor,
  bookingId: string
): Promise<Booking> {
  return getBookingServiceProofService().getBookingForAbsenceReport(actor, bookingId);
}
