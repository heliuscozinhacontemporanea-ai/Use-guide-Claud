import { getBookingEntryService } from '../factory';
import type { EntryCheckInInput } from '../services/bookingEntryService';
import type { UnitCheckInResult } from '../services/bookingCheckInService';
import type { BookingActor } from '../types/bookingTypes';

/** Entrada de uma pessoa na portaria, pelo QR ou pelo código de 8 caracteres (D20). */
export async function checkInEntryUseCase(
  actor: BookingActor,
  input: EntryCheckInInput
): Promise<UnitCheckInResult> {
  return getBookingEntryService().checkIn(actor, input);
}
