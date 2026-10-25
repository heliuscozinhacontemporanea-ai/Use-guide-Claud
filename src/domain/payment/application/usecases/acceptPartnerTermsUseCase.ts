import { paymentApiAdapter } from '../../factory';
import type { PartnerTermsView } from '../../types/payment';

export function acceptPartnerTermsUseCase(version: string): Promise<PartnerTermsView> {
  return paymentApiAdapter.acceptPartnerTerms(version);
}
