import { paymentApiAdapter } from '../../factory';

export async function createPartnerConnectAccountSessionUseCase(): Promise<{
  clientSecret: string;
}> {
  return paymentApiAdapter.createPartnerConnectAccountSession();
}
