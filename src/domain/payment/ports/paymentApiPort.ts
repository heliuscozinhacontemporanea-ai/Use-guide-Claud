import type {
  CreatePaymentIntentResponse,
  CreatePlanPaymentIntentPayload,
  PartnerConnectStatusResponse,
  PaymentLocale,
  PlanSubscription,
  StartPlanSubscriptionPayload,
  StartPlanSubscriptionResponse,
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
  startPlanSubscription(payload: StartPlanSubscriptionPayload): Promise<StartPlanSubscriptionResponse>;
  getPlanSubscription(): Promise<PlanSubscription | null>;
  setPlanSubscriptionRenewal(renew: boolean): Promise<PlanSubscription | null>;
  createBillingPortalSession(locale: PaymentLocale): Promise<{ url: string }>;
}
