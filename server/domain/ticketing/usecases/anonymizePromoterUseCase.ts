import { promoterService } from '../factory';

/** Exclusão de conta: tira @ e nome das listas de divulgadores (§7.5). */
export function anonymizePromoterUseCase(uid: string): Promise<number> {
  return promoterService.anonymizePromoter(uid);
}
