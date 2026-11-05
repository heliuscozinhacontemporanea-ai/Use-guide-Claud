import { getBookingCheckInService } from '../factory';
import type {
  EstablishmentCheckInInput,
  EstablishmentCheckInResult,
} from '../services/bookingCheckInService';
import type { BookingActor } from '../types/bookingTypes';

/** "Inserir código" do estabelecimento (D27): procura em todos os horários com check-in aberto. */
export async function checkInByEstablishmentCodeUseCase(
  actor: BookingActor,
  input: EstablishmentCheckInInput
): Promise<EstablishmentCheckInResult> {
  return getBookingCheckInService().checkInByEstablishmentCode(actor, input);
}
