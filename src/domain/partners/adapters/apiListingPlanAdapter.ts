import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { ListingPlanPort } from '../ports/listingPlanPort';
import type { ListingPlanView } from '../types/listingPlan';

const OPTIONS = { requireAuth: true, requireAppCheck: true } as const;

const planPath = (itemId: string) => `/api/listing-plans/${encodeURIComponent(itemId)}`;

/** Lança Error com o `code` estável do backend (AGENTS.md §10.2); a UI traduz pelo código. */
async function call(path: string, init: RequestInit): Promise<ListingPlanView> {
  const response = await firebaseApiFetch(path, init, OPTIONS);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof body?.error?.code === 'string' ? body.error.code : 'INTERNAL_ERROR');
  }
  return (body as { data: ListingPlanView }).data;
}

export class ApiListingPlanAdapter implements ListingPlanPort {
  get(itemId: string): Promise<ListingPlanView> {
    return call(planPath(itemId), { method: 'GET' });
  }

  activateTrial(itemId: string): Promise<ListingPlanView> {
    return call(`${planPath(itemId)}/trial`, { method: 'POST' });
  }

  setSeal(itemId: string, grant: boolean): Promise<ListingPlanView> {
    return call(`${planPath(itemId)}/seal`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant }),
    });
  }
}
