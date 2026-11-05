import { type Booking, type BookingActor, respondToArrivalUseCase } from '../../../domain/bookings';
import { releaseServiceProofHold } from './releaseServiceProofHold';

/**
 * "Estou chegando" ou "Não vou mais" (D27, p45). "Não vou mais" é ausência, sem reembolso: o
 * repasse é solto como na ausência marcada pelo parceiro, que vê a resposta no cartão.
 */
export async function respondToArrivalApplicationUseCase(
  actor: BookingActor,
  bookingId: string,
  response: 'coming' | 'not_going'
): Promise<Booking> {
  const booking = await respondToArrivalUseCase(actor, bookingId, response);
  if (response === 'not_going') await releaseServiceProofHold(booking.id);
  return booking;
}
