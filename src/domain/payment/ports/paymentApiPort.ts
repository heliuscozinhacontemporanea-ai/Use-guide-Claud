import type {
  CreatePaymentIntentResponse,
  CreatePlanPaymentIntentPayload,
  PartnerConnectStatusResponse,
} from '../types/payment';

export interface PaymentApiPort {
  createPlanPaymentIntent(
    payload: CreatePlanPaymentIntentPayload
  ): Promise<CreatePaymentIntentResponse>;
  confirmPlanPaymentReturn(params: {
    paymentIntentId: string;
  }): Promise<{ status: string }>;
  getPartnerConnectStatus(): Promise<PartnerConnectStatusResponse>;
  createPartnerConnectAccount(): Promise<PartnerConnectStatusResponse>;
  createPartnerConnectAccountSession(): Promise<{ clientSecret: string }>;
}
