import { bookingsApi } from '../../factory';
import type { PublicFleetDay } from '../../types/bookings';

/** O que o comprador pode reservar num dia de uma oferta por veículo (F3b). */
export async function getPublicFleetDayUseCase(
  offerId: string,
  date: string
): Promise<PublicFleetDay> {
  return bookingsApi.getPublicFleetDay(offerId, date);
}
