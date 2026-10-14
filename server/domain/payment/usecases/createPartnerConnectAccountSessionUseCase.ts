import { stripePaymentService } from '../factory';

export async function createPartnerConnectAccountSessionUseCase(params: {
  partnerId: string;
  email: string;
}): Promise<{ clientSecret: string }> {
  return stripePaymentService.createAccountSession(params);
}
