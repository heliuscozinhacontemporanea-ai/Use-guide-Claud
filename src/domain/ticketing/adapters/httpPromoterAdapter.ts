import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { PromoterPort } from '../ports/promoterPort';
import type { EventPromotersSummary, MyPromotion, PromoterEarning } from '../types/promoter';

async function call<T>(path: string, method: 'GET' | 'POST', body?: unknown): Promise<T> {
  const res = await firebaseApiFetch(
    path,
    {
      method,
      ...(body
        ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
        : {}),
    },
    { requireAuth: true }
  );
  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error?.code || 'INTERNAL_ERROR');
  return json?.data as T;
}

export class HttpPromoterAdapter implements PromoterPort {
  getEventPromoters(eventListingId: string): Promise<EventPromotersSummary> {
    return call(`/api/promoters?eventListingId=${encodeURIComponent(eventListingId)}`, 'GET');
  }

  async invitePromoter(
    eventListingId: string,
    username: string,
    earning: PromoterEarning
  ): Promise<void> {
    await call('/api/promoters', 'POST', { eventListingId, username, earning });
  }

  endPromoter(promoterId: string): Promise<void> {
    return call(`/api/promoters/${encodeURIComponent(promoterId)}/end`, 'POST');
  }

  listMyPromotions(): Promise<MyPromotion[]> {
    return call('/api/promoters/me', 'GET');
  }

  respondPromoterInvite(promoterId: string, accept: boolean): Promise<void> {
    return call(`/api/promoters/${encodeURIComponent(promoterId)}/response`, 'POST', { accept });
  }
}
