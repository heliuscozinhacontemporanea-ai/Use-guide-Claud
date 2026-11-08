import {
  type BookingActor,
  type CheckInByCodeInput,
  checkInBookingByCodeUseCase,
  resolveProviderAbsenceUseCase,
  type UnitCheckInResult,
} from '../../../domain/bookings';
import { decideSaleClaimUseCase } from '../../../domain/payment';
import { SYSTEM_ACTOR } from './answerProviderAbsenceApplicationUseCase';
import { releaseServiceProofHold } from './releaseServiceProofHold';

/**
 * Check-in com o código (D20). Se o cliente já tinha relatado que ninguém veio, o check-in prova que o
 * parceiro chegou: a reclamação é encerrada sem reembolso e o serviço segue normal. O check-in é a
 * prova do serviço: o repasse deixa de esperar por ela.
 */
export async function checkInBookingApplicationUseCase(
  actor: BookingActor,
  input: CheckInByCodeInput
): Promise<UnitCheckInResult> {
  const result = await checkInBookingByCodeUseCase(actor, input);
  await releaseServiceProofHold(result.booking.id);
  const absence = result.booking.providerAbsence;
  if (absence && !absence.resolution) {
    await decideSaleClaimUseCase(absence.claimId, SYSTEM_ACTOR, { outcome: 'release' });
    const booking = await resolveProviderAbsenceUseCase(
      result.booking.id,
      { resolution: 'withdrawn' },
      actor.uid
    );
    return { ...result, booking };
  }
  return result;
}
