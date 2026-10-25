import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { PaymentApiPort } from '../ports/paymentApiPort';
import type {
  CreatePaymentIntentResponse,
  CreatePlanPaymentIntentPayload,
  PaidPlanId,
  PartnerPaymentAccount,
  PartnerTermsView,
  PaymentLocale,
  PlanSubscription,
  StartPlanSubscriptionPayload,
  StartPlanSubscriptionResponse,
} from '../types/payment';

const API_OPTIONS = { requireAuth: true, requireAppCheck: true } as const;

/** Lança Error com o `code` estável do backend (AGENTS.md §10.2); a UI traduz pelo código. */
async function readJsonOrThrow<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof data?.error?.code === 'string' ? data.error.code : 'BILLING_UNAVAILABLE'
    );
  }
  return data as T;
}

function postJson(path: string, body: unknown) {
  return firebaseApiFetch(
    path,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    API_OPTIONS
  );
}

export class ApiPaymentAdapter implements PaymentApiPort {
  async createPlanPaymentIntent(
    payload: CreatePlanPaymentIntentPayload
  ): Promise<CreatePaymentIntentResponse> {
    const response = await firebaseApiFetch(
      '/api/payment/plans/intents',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      // A rota de Pix devolve o code no topo do corpo; sem code, cai no erro genérico traduzido.
      throw new Error(typeof data?.code === 'string' ? data.code : 'BILLING_UNAVAILABLE');
    }
    return data;
  }

  async confirmPlanPaymentReturn(params: { paymentIntentId: string }): Promise<{ status: string }> {
    const response = await firebaseApiFetch(
      '/api/payment/plans/intents/confirm',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        data.error?.message ?? data.error ?? 'Não foi possível verificar o pagamento.'
      );
    }
    return data;
  }

  async listPaymentAccounts(): Promise<PartnerPaymentAccount[]> {
    const response = await firebaseApiFetch(
      '/api/payment-accounts',
      { method: 'GET' },
      { requireAuth: true, requireAppCheck: true }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error?.code ?? 'PAYMENT_ACCOUNT_UNAVAILABLE');
    }
    return Array.isArray(data.data) ? data.data : [];
  }

  async createPaymentAccountSession(accountKey: string): Promise<{ clientSecret: string }> {
    const response = await firebaseApiFetch(
      '/api/payment-accounts/session',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountKey }),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.data?.clientSecret) {
      throw new Error(data.error?.code ?? 'PAYMENT_ACCOUNT_UNAVAILABLE');
    }
    return { clientSecret: data.data.clientSecret };
  }

  async getPartnerTerms(): Promise<PartnerTermsView> {
    return this.partnerTermsRequest({ method: 'GET' });
  }

  async acceptPartnerTerms(version: string): Promise<PartnerTermsView> {
    return this.partnerTermsRequest({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version }),
    });
  }

  private async partnerTermsRequest(init: RequestInit): Promise<PartnerTermsView> {
    const response = await firebaseApiFetch('/api/payment-accounts/terms', init, {
      requireAuth: true,
      requireAppCheck: true,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.data) {
      throw new Error(data.error?.code ?? 'PAYMENT_ACCOUNT_UNAVAILABLE');
    }
    return data.data as PartnerTermsView;
  }

  async startPlanSubscription(
    payload: StartPlanSubscriptionPayload
  ): Promise<StartPlanSubscriptionResponse> {
    return readJsonOrThrow(await postJson('/api/payment/plans/subscriptions', payload));
  }

  async getPlanSubscription(itemId: string): Promise<PlanSubscription | null> {
    const query = new URLSearchParams({ itemId });
    const response = await firebaseApiFetch(
      `/api/payment/plans/subscription?${query.toString()}`,
      { method: 'GET' },
      API_OPTIONS
    );
    const data = await readJsonOrThrow<{ subscription: PlanSubscription | null }>(response);
    return data.subscription;
  }

  async setPlanSubscriptionRenewal(
    itemId: string,
    renew: boolean
  ): Promise<PlanSubscription | null> {
    const path = renew
      ? '/api/payment/plans/subscription/resume'
      : '/api/payment/plans/subscription/cancel';
    const data = await readJsonOrThrow<{ subscription: PlanSubscription | null }>(
      await postJson(path, { itemId })
    );
    return data.subscription;
  }

  async changePlanSubscription(params: {
    itemId: string;
    planId: PaidPlanId;
    idempotencyKey: string;
  }): Promise<PlanSubscription | null> {
    const data = await readJsonOrThrow<{ subscription: PlanSubscription | null }>(
      await postJson('/api/payment/plans/subscription/change', params)
    );
    return data.subscription;
  }

  async createBillingPortalSession(locale: PaymentLocale): Promise<{ url: string }> {
    return readJsonOrThrow(await postJson('/api/payment/plans/subscription/portal', { locale }));
  }
}
