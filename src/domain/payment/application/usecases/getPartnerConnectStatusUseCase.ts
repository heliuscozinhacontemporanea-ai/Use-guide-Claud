import { paymentApiAdapter } from '../../factory';
import type { PartnerConnectStatusResponse } from '../../types/payment';

export async function getPartnerConnectStatusUseCase(): Promise<PartnerConnectStatusResponse> {
  return paymentApiAdapter.getPartnerConnectStatus();
}
