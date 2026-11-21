import { bookingsApi } from '../../factory';
import type { PartnerFleetDay } from '../../types/bookings';

/** Dias com veículos de uma oferta do parceiro, com a ocupação (F3b). */
export async function listFleetDaysUseCase(
  offerId: string,
  fromDate: string,
  toDate: string
): Promise<PartnerFleetDay[]> {
  return bookingsApi.listFleetDays(offerId, fromDate, toDate);
}
