import { getBookingEntryService } from '../factory';
import type { EntryCheckInInput } from '../services/bookingEntryService';
import type { Booking, BookingActor } from '../types/bookingTypes';

/** Entrada na portaria pelo QR ou pelo código de 8 caracteres (D20). */
export async function checkInEntryUseCase(
  actor: BookingActor,
  input: EntryCheckInInput
): Promise<Booking> {
  return getBookingEntryService().checkIn(actor, input);
}
