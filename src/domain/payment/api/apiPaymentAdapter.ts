import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { PaymentApiPort } from '../ports/paymentApiPort';
import type {
  CreatePaymentIntentResponse,
  CreatePlanPaymentIntentPayload,
  PartnerConnectStatusResponse,
} from '../types/payment';

export class ApiPaymentAdapter implements PaymentApiPort {
  async createPlanPaymentIntent(
    payload: CreatePlanPaymentIntentPayload
  ): Promise<CreatePaymentIntentResponse> {
    const response = await firebaseApiFetch(
      '/api/payment/plan-intent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Erro ao iniciar pagamento do plano.');
    }
    return data;
  }

  async confirmPlanPaymentReturn(params: {
    paymentIntentId: string;
  }): Promise<{ status: string }> {
    const response = await firebaseApiFetch(
      '/api/payment/plan-intent/confirm',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Não foi possível verificar o pagamento.');
    }
    return data;
  }

  async getPartnerConnectStatus(): Promise<PartnerConnectStatusResponse> {
    const response = await firebaseApiFetch(
      '/api/payment/connect/status',
      { method: 'GET' },
      { requireAuth: true, requireAppCheck: true }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Não foi possível carregar o status financeiro.');
    }
    return data;
  }

  async createPartnerConnectAccount(): Promise<PartnerConnectStatusResponse> {
    const response = await firebaseApiFetch(
      '/api/payment/connect/account',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Não foi possível criar a conta conectada.');
    }
    return data;
  }

  async createPartnerConnectAccountSession(): Promise<{ clientSecret: string }> {
    const response = await firebaseApiFetch(
      '/api/payment/connect/account-session',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      },
      { requireAuth: true, requireAppCheck: true }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.clientSecret) {
      throw new Error(data.error || 'Não foi possível iniciar a sessão financeira.');
    }
    return { clientSecret: data.clientSecret };
  }
}
