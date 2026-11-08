import { promoCodesAdapter } from '../../factory';

export function deletePromoCodeUseCase(id: string): Promise<void> {
  return promoCodesAdapter.remove(id);
}
