import type {
  CreatePaymentIntentResponse,
  PaidPlanId,
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
  confirmPlanPaymentReturn(params: { paymentIntentId: string }): Promise<{ status: string }>;
  getPartnerConnectStatus(): Promise<PartnerConnectStatusResponse>;
  createPartnerConnectAccount(): Promise<PartnerConnectStatusResponse>;
  createPartnerConnectAccountSession(): Promise<{ clientSecret: string }>;
  startPlanSubscription(
    payload: StartPlanSubscriptionPayload
  ): Promise<StartPlanSubscriptionResponse>;
  getPlanSubscription(itemId: string): Promise<PlanSubscription | null>;
  setPlanSubscriptionRenewal(itemId: string, renew: boolean): Promise<PlanSubscription | null>;
  changePlanSubscription(params: {
    itemId: string;
    planId: PaidPlanId;
    idempotencyKey: string;
  }): Promise<PlanSubscription | null>;
  createBillingPortalSession(locale: PaymentLocale): Promise<{ url: string }>;
}
