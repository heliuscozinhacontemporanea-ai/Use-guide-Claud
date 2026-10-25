import { paymentApiAdapter } from '../../factory';
import type { PartnerTermsView } from '../../types/payment';

export function getPartnerTermsUseCase(): Promise<PartnerTermsView> {
  return paymentApiAdapter.getPartnerTerms();
}
