import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { ReceivablesApiPort } from '../ports/receivablesApiPort';
import type { AccountDebtView, PayoutPage } from '../types/receivables';

const API_OPTIONS = { requireAuth: true, requireAppCheck: true } as const;

/** Lança Error com o `code` estável do backend (AGENTS.md §10.2); a UI traduz pelo código. */
async function readJsonOrThrow<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      typeof data?.error?.code === 'string' ? data.error.code : 'PAYMENT_ACCOUNT_UNAVAILABLE'
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

export class ApiReceivablesAdapter implements ReceivablesApiPort {
  async listPayouts(query: {
    accountKey?: string;
    cursor?: string;
    limit?: number;
  }): Promise<PayoutPage> {
    const params = new URLSearchParams();
    if (query.accountKey) params.set('accountKey', query.accountKey);
    if (query.cursor) params.set('cursor', query.cursor);
    params.set('limit', String(query.limit ?? 30));
    const response = await firebaseApiFetch(
      `/api/payment-accounts/payouts?${params.toString()}`,
      { method: 'GET' },
      API_OPTIONS
    );
    return readJsonOrThrow<PayoutPage>(response);
  }

  async listDebts(): Promise<AccountDebtView[]> {
    const response = await firebaseApiFetch(
      '/api/payment-accounts/debts',
      { method: 'GET' },
      API_OPTIONS
    );
    return (await readJsonOrThrow<{ data: AccountDebtView[] }>(response)).data;
  }

  async startDebtPayment(debtId: string): Promise<{ clientSecret: string }> {
    const response = await postJson(
      `/api/payment-accounts/debts/${encodeURIComponent(debtId)}/payment`,
      {}
    );
    return (await readJsonOrThrow<{ data: { clientSecret: string } }>(response)).data;
  }

  async declareForceMajeure(
    debtId: string,
    declaration: { reason: string; proofPath: string }
  ): Promise<AccountDebtView> {
    const response = await postJson(
      `/api/payment-accounts/debts/${encodeURIComponent(debtId)}/force-majeure`,
      declaration
    );
    return (await readJsonOrThrow<{ data: AccountDebtView }>(response)).data;
  }
}
