import { getBookingPrivacyService } from '../factory';

/** Apaga o endereço de busca das reservas 7 dias depois do serviço (D20, §7.5). */
export async function eraseExpiredPickupAddressesUseCase(limit = 200): Promise<number> {
  return getBookingPrivacyService().eraseExpiredPickupAddresses(limit);
}
