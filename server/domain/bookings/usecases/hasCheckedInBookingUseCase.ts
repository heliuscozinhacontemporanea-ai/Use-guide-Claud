import { getBookingCheckInService } from '../factory';

/** Prova do serviço numa contestação de cartão (D16, D20). */
export async function hasCheckedInBookingUseCase(bookingId: string): Promise<boolean> {
  return getBookingCheckInService().hasCheckIn(bookingId);
}
