import {
  type Booking,
  type BookingActor,
  type CheckInByCodeInput,
  checkInBookingByCodeUseCase,
  resolveProviderAbsenceUseCase,
} from '../../../domain/bookings';
import { decideSaleClaimUseCase } from '../../../domain/payment';
import { SYSTEM_ACTOR } from './answerProviderAbsenceApplicationUseCase';

/**
 * Check-in com o código (D20). Se o comprador já tinha relatado "O prestador não veio", o check-in
 * prova que o prestador chegou: a reclamação é encerrada sem reembolso e o serviço segue normal.
 */
export async function checkInBookingApplicationUseCase(
  actor: BookingActor,
  input: CheckInByCodeInput
): Promise<Booking> {
  const booking = await checkInBookingByCodeUseCase(actor, input);
  const absence = booking.providerAbsence;
  if (absence && !absence.resolution) {
    await decideSaleClaimUseCase(absence.claimId, SYSTEM_ACTOR, { outcome: 'release' });
    return resolveProviderAbsenceUseCase(booking.id, { resolution: 'withdrawn' }, actor.uid);
  }
  return booking;
}
