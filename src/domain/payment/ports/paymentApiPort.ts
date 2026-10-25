import type {
  CreatePaymentIntentResponse,
  PaidPlanId,
  CreatePlanPaymentIntentPayload,
  PartnerPaymentAccount,
  PartnerTermsView,
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
  getPartnerTerms(): Promise<PartnerTermsView>;
  acceptPartnerTerms(version: string): Promise<PartnerTermsView>;
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
