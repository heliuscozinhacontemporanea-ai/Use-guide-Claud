import type { PlaceTime } from '../../../shared/kernel/timeZones';
import { eventsService } from '../factory';

/** Fuso e cidade novos do estabelecimento passam para todos os eventos dele (D28). */
export async function updateEstablishmentEventsPlaceUseCase(
  establishmentId: string,
  place: PlaceTime
): Promise<void> {
  return eventsService.updateEstablishmentPlace(establishmentId, place);
}
