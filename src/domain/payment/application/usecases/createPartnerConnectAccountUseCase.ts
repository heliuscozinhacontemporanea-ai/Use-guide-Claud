import { paymentApiAdapter } from '../../factory';
import type { PartnerConnectStatusResponse } from '../../types/payment';

export async function createPartnerConnectAccountUseCase(): Promise<PartnerConnectStatusResponse> {
  return paymentApiAdapter.createPartnerConnectAccount();
}
