import { getFleetService } from '../factory';
import type { PublicFleetDay } from '../services/fleetService';

/** O que dá para reservar num dia de uma oferta por veículo publicada (F3b). */
export async function getPublicFleetDayUseCase(
  offerId: string,
  date: string
): Promise<PublicFleetDay> {
  return getFleetService().publicDay(offerId, date);
}
