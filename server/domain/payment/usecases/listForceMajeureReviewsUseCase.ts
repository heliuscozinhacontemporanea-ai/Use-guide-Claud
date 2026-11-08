import { debtService } from '../factory';
import type { ForceMajeureReviewView } from '../types/accountDebt';

/** Quem chama garante o papel de admin. */
export function listForceMajeureReviewsUseCase(limit = 50): Promise<ForceMajeureReviewView[]> {
  return debtService.listForceMajeureReviews(limit);
}
