import { bookingsApi } from '../../factory';
import type { OpenFleetDaysPayload, PartnerFleetDay } from '../../types/bookings';

/** Abre ou muda dias com o número de veículos (F3b). */
export async function openFleetDaysUseCase(
  offerId: string,
  payload: OpenFleetDaysPayload
): Promise<PartnerFleetDay[]> {
  return bookingsApi.openFleetDays(offerId, payload);
}
