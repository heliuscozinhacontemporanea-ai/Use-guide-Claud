import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/** Conclui as reservas cujo horário terminou e devolve as que ficaram sem prova do serviço (D20). */
export async function completeFinishedBookingsUseCase(
  limit = 200
): Promise<{ completed: number; askedToConfirm: Booking[] }> {
  return getBookingService().completeFinishedBookings(limit);
}
