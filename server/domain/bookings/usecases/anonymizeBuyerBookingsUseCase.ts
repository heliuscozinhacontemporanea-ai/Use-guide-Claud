import { getBookingPrivacyService } from '../factory';

/** Exclusão de conta: tira endereço e nomes das reservas do comprador e mantém o registro (§7.5). */
export async function anonymizeBuyerBookingsUseCase(buyerUid: string): Promise<number> {
  return getBookingPrivacyService().anonymizeBuyer(buyerUid);
}
