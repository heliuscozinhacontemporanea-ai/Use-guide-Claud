import {
  assertListingPlanPurchasableUseCase,
  getListingPlanUntilUseCase,
  getListingVerificationStatusUseCase,
  ListingPlanError,
} from '../../../domain/partners';
import { PaymentDomainError } from '../../../domain/payment';
import { loadPlanListing } from './loadPlanListing';

/** Garante que o estabelecimento pertence ao parceiro, está ativo e tem documento aprovado (D11). */
export async function assertListingPlanPurchasableApplicationUseCase(
  actorUid: string,
  itemId: string
): Promise<{ currentPaidUntil: string | null }> {
  try {
    const [listing, verification] = await Promise.all([
      loadPlanListing(itemId),
      getListingVerificationStatusUseCase(itemId),
    ]);
    await assertListingPlanPurchasableUseCase({ uid: actorUid }, listing, verification);
    return { currentPaidUntil: await getListingPlanUntilUseCase(itemId) };
  } catch (error) {
    if (error instanceof ListingPlanError) {
      throw new PaymentDomainError(error.code, error.message, error.statusCode);
    }
    throw error;
  }
}
