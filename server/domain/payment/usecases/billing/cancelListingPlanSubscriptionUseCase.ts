import { getBillingService } from '../../factory';

export async function cancelListingPlanSubscriptionUseCase(itemId: string): Promise<void> {
  return getBillingService().cancelForListing(itemId);
}
