import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { PromoCodesPort } from '../ports/promoCodesPort';
import type {
  PartnerPromoCode,
  PromoCodeInput,
  PromoCodeLimitsEdit,
  PromoCodesData,
} from '../types/promoCode';

const OPTIONS = { requireAuth: true, requireAppCheck: true } as const;

/** Lança Error com o `code` estável do backend (§10.2); a tela traduz pelo código. */
async function call<T>(path: string, init: RequestInit): Promise<T> {
  const response = await firebaseApiFetch(`/api/promo-codes${path}`, init, OPTIONS);
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof body?.error?.code === 'string' ? body.error.code : 'INTERNAL_ERROR');
  }
  return (body as { data: T }).data;
}

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export class ApiPromoCodesAdapter implements PromoCodesPort {
  list(): Promise<PromoCodesData> {
    return call('', { method: 'GET' });
  }

  create(input: PromoCodeInput): Promise<PartnerPromoCode> {
    return call('', json('POST', input));
  }

  replace(id: string, input: PromoCodeInput): Promise<PartnerPromoCode> {
    return call(`/${encodeURIComponent(id)}`, json('PUT', input));
  }

  async updateLimits(id: string, edit: PromoCodeLimitsEdit): Promise<void> {
    await call(`/${encodeURIComponent(id)}`, json('PATCH', edit));
  }

  remove(id: string): Promise<void> {
    return call(`/${encodeURIComponent(id)}`, { method: 'DELETE' });
  }
}
