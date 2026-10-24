import {
  assertListingPlanPurchasableUseCase,
  getListingPlanUntilUseCase,
  getListingVerificationStatusUseCase,
  ListingPlanError,
} from '../../../domain/partners';
import { PaymentDomainError } from '../../../domain/payment';
import { loadPlanListing } from './loadPlanListing';

/**
 * Antes de cobrar o plano: o estabelecimento é do comprador e já foi verificado (D11). Devolve a
 * validade do plano em vigor, para a assinatura não cobrar de novo o período já pago. O erro sai
 * como `PaymentDomainError` porque `payment` é folha e não conhece `partners` (AGENTS.md §5.4).
 */
export async function assertListingPlanPurchasableApplicationUseCase(
  actor: { uid: string; admin?: boolean },
  itemId: string
): Promise<{ currentPlanUntil: string | null }> {
  try {
    const listing = await loadPlanListing(itemId);
    const verification = await getListingVerificationStatusUseCase(itemId);
    await assertListingPlanPurchasableUseCase(actor, listing, verification);
  } catch (error) {
    if (error instanceof ListingPlanError) {
      throw new PaymentDomainError(error.code, error.message, error.statusCode);
    }
    throw error;
  }
  return { currentPlanUntil: await getListingPlanUntilUseCase(itemId) };
}
