import type {
  CreatePaymentIntentResponse,
  PaidPlanId,
  CreatePlanPaymentIntentPayload,
  PartnerPaymentAccount,
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
  listPaymentAccounts(): Promise<PartnerPaymentAccount[]>;
  createPaymentAccountSession(accountKey: string): Promise<{ clientSecret: string }>;
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
