import { getOfferService } from '../factory';

/** Se alguma oferta do dono tem reserva aguardando pagamento ou confirmada. */
export async function hasActiveBookingsForOwnerUseCase(ownerId: string): Promise<boolean> {
  return getOfferService().hasActiveBookingsForOwner(ownerId);
}
