import { listingPlanService } from '../factory';

/** Validade do plano em vigor, ou `null`: base para somar meses num pagamento avulso. */
export function getListingPlanUntilUseCase(itemId: string): Promise<string | null> {
  return listingPlanService.getPlanUntil(itemId);
}
