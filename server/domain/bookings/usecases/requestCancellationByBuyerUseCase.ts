import { getBookingService } from '../factory';
import type { BuyerCancellationResult } from '../services/bookingService';
import type { BookingActor } from '../types/bookingTypes';

/** Cancela e calcula o reembolso pela política; não chama o pagamento (isso é da camada application). */
export async function requestCancellationByBuyerUseCase(
  actor: BookingActor,
  bookingId: string,
  reason: string
): Promise<BuyerCancellationResult> {
  return getBookingService().requestCancellationByBuyer(actor, bookingId, reason);
}
