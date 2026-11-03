import { getBookingService } from '../factory';
import type { Booking } from '../types/bookingTypes';

/**
 * Conclui as reservas cujo horário terminou. Devolve as que ficaram sem prova do serviço (D20) e as
 * que podem receber o convite para avaliar (D25).
 */
export async function completeFinishedBookingsUseCase(
  limit = 200
): Promise<{ completed: number; askedToConfirm: Booking[]; reviewInvites: Booking[] }> {
  return getBookingService().completeFinishedBookings(limit);
}
