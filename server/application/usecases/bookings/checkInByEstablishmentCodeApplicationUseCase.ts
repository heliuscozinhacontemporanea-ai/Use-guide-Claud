import {
  type BookingActor,
  checkInByEstablishmentCodeUseCase,
  type EstablishmentCheckInInput,
  type EstablishmentCheckInResult,
} from '../../../domain/bookings';
import { getUserPublicProfileUseCase } from '../../../domain/users';
import { afterCodeCheckIn } from './checkInBookingApplicationUseCase';

/**
 * Código do cartão "Inserir código" (D27, p41): faz o check-in onde o código couber, solta o repasse
 * e devolve o nome público do cliente ("Ana Souza · confirmado às 09:24").
 */
export async function checkInByEstablishmentCodeApplicationUseCase(
  actor: BookingActor,
  input: EstablishmentCheckInInput
): Promise<EstablishmentCheckInResult & { buyerName: string | null }> {
  const result = await afterCodeCheckIn(
    actor,
    await checkInByEstablishmentCodeUseCase(actor, input)
  );
  const profile = await getUserPublicProfileUseCase(result.booking.buyerId).catch(() => null);
  return { ...result, buyerName: profile?.displayName ?? null };
}
