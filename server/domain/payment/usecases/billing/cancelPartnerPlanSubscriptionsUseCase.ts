import { getBillingService } from '../../factory';

export async function cancelPartnerPlanSubscriptionsUseCase(partnerId: string): Promise<void> {
  return getBillingService().cancelForPartner(partnerId);
}
