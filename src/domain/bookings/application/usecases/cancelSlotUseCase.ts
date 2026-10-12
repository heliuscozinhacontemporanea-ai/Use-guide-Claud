import { bookingsApi } from '../../factory';

/** Cancela o horário; o backend reembolsa integralmente todas as reservas pagas dele. */
export async function cancelSlotUseCase(
  offerId: string,
  slotId: string
): Promise<{ canceledBookings: number }> {
  return bookingsApi.cancelSlot(offerId, slotId);
}
