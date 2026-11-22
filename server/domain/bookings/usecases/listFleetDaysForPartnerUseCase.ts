import { getFleetService } from '../factory';
import type { PartnerFleetDay } from '../services/fleetService';
import type { BookingActor } from '../types/bookingTypes';

/** Dias abertos de uma oferta por veículo, com a ocupação, para o dono (F3b). */
export async function listFleetDaysForPartnerUseCase(
  actor: BookingActor,
  offerId: string,
  fromDate: string,
  toDate: string
): Promise<PartnerFleetDay[]> {
  return getFleetService().listDays(actor, offerId, fromDate, toDate);
}
