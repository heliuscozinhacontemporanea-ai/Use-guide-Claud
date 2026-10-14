import { ticketingAdapter } from '../../factory';

export function getPartnerMerchantStatusUseCase() {
  return ticketingAdapter.getPartnerMerchantStatus();
}
