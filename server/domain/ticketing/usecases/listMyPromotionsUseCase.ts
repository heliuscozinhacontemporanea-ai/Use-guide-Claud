import { promoterService } from '../factory';
import type { PromoterRow } from '../services/promoterService';

/** Eventos que a pessoa divulga ou foi convidada a divulgar (p26). */
export function listMyPromotionsUseCase(uid: string): Promise<PromoterRow[]> {
  return promoterService.mine(uid);
}
