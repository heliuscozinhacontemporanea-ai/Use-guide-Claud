import { guideService } from '../factory';

/**
 * Passa o anúncio de um dono para outro (D35 "Sou o dono"): do Use Guide para quem teve o pedido
 * aprovado, ou de volta. Só troca se o dono atual for o esperado.
 */
export function transferGuideItemOwnerUseCase(
  itemId: string,
  expectedOwnerId: string,
  ownerId: string
): Promise<boolean> {
  return guideService.transferOwner(itemId, expectedOwnerId, ownerId);
}
