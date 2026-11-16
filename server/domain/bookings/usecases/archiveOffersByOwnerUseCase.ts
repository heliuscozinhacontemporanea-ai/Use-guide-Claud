import { getOfferService } from '../factory';

/** Conta ou perfil de parceiro encerrado: as ofertas do dono saem do app. */
export async function archiveOffersByOwnerUseCase(ownerId: string): Promise<void> {
  return getOfferService().archiveOffersByOwner(ownerId);
}
