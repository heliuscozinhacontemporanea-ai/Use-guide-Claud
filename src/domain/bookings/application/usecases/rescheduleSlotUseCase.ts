import { bookingsApi } from '../../factory';

/** Remarca o horário; as reservas valem na nova data e o comprador tem 7 dias para desistir (D16). */
export async function rescheduleSlotUseCase(
  offerId: string,
  slotId: string,
  change: { startsAt: string; reason: string }
): Promise<{ rescheduledBookings: number }> {
  return bookingsApi.rescheduleSlot(offerId, slotId, change);
}
