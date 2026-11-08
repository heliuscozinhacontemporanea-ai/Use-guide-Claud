import { promoCodeService } from '../factory';

export function deletePromoCodeUseCase(ownerId: string, id: string): Promise<void> {
  return promoCodeService.delete(ownerId, id);
}
