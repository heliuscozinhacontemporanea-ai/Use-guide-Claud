import { getBookingService } from '../factory';

/** Marca como concluídas as reservas confirmadas cujo horário já terminou. */
export async function completeFinishedBookingsUseCase(limit = 200): Promise<number> {
  return getBookingService().completeFinishedBookings(limit);
}
