import { getFleetService } from '../factory';
import type { OpenFleetDaysInput, PartnerFleetDay } from '../services/fleetService';
import type { BookingActor } from '../types/bookingTypes';

/** Abre ou muda dias de uma oferta por veículo com o número de veículos (F3b). */
export async function openFleetDaysUseCase(
  actor: BookingActor,
  offerId: string,
  input: OpenFleetDaysInput
): Promise<PartnerFleetDay[]> {
  return getFleetService().openDays(actor, offerId, input);
}
