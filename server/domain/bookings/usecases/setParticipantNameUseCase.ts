import { getBookingParticipantService } from '../factory';
import type { BookingActor, BookingParticipant } from '../types/bookingTypes';

/** Nome da pessoa de uma unidade na entrada nominal: informar ou trocar uma vez (D20). */
export async function setParticipantNameUseCase(
  actor: BookingActor,
  bookingId: string,
  unit: number,
  name: string
): Promise<BookingParticipant> {
  return getBookingParticipantService().setName(actor, bookingId, unit, name);
}
