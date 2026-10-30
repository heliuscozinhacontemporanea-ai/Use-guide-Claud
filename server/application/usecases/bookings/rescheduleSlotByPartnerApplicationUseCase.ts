import {
  type BookingActor,
  bookingServiceEndsAt,
  rescheduleSlotByPartnerUseCase,
} from '../../../domain/bookings';
import { reschedulePayoutUseCase } from '../../../domain/payment';

/**
 * Horário remarcado pelo parceiro (D16, 4A): as reservas valem na nova data e o repasse acompanha a nova
 * data. Sem multa; o comprador tem 7 dias depois do aviso para cancelar com reembolso integral.
 */
export async function rescheduleSlotByPartnerApplicationUseCase(
  actor: BookingActor,
  offerId: string,
  slotId: string,
  change: { startsAt: string; endsAt?: string; reason: string }
): Promise<{ rescheduledBookings: number }> {
  const moved = await rescheduleSlotByPartnerUseCase(actor, offerId, slotId, change);
  for (const booking of moved) {
    if (booking.status !== 'confirmed') continue;
    await reschedulePayoutUseCase('booking', booking.id, bookingServiceEndsAt(booking));
  }
  // TODO: avisar os compradores quando notifications aceitar destinatário usuário (débito B13).
  return { rescheduledBookings: moved.length };
}
