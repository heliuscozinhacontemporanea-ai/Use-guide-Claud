import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { ListingVerificationPort } from '../ports/listingVerificationPort';
import type {
  ListingVerificationQueuePage,
  ListingVerificationStatus,
  ListingVerificationView,
  SubmitListingVerificationPayload,
  VerificationDecision,
  VerificationFileKind,
} from '../types/listingVerification';

const OPTIONS = { requireAuth: true, requireAppCheck: true } as const;
const QUEUE_PAGE_SIZE = 20;

const itemPath = (itemId: string) => `/api/listing-verifications/${encodeURIComponent(itemId)}`;

async function fail(response: Response): Promise<never> {
  const data = await response.json().catch(() => ({}));
  throw new Error(typeof data?.error?.code === 'string' ? data.error.code : 'INTERNAL_ERROR');
}

/** Lança Error com o `code` estável do backend (AGENTS.md §10.2); a UI traduz pelo código. */
async function call<T>(path: string, init: RequestInit = { method: 'GET' }): Promise<T> {
  const response = await firebaseApiFetch(path, init, OPTIONS);
  if (!response.ok) return fail(response);
  return (await response.json()) as T;
}

function json(method: 'PUT' | 'POST', body: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

export class ApiListingVerificationAdapter implements ListingVerificationPort {
  async get(itemId: string): Promise<ListingVerificationView> {
    return (await call<{ data: ListingVerificationView }>(itemPath(itemId))).data;
  }

  async submit(
    itemId: string,
    payload: SubmitListingVerificationPayload
  ): Promise<ListingVerificationView> {
    return (await call<{ data: ListingVerificationView }>(itemPath(itemId), json('PUT', payload)))
      .data;
  }

  async list(
    status: ListingVerificationStatus,
    cursor: string | null
  ): Promise<ListingVerificationQueuePage> {
    const query = new URLSearchParams({ status, limit: String(QUEUE_PAGE_SIZE) });
    if (cursor) query.set('cursor', cursor);
    return call(`/api/listing-verifications?${query.toString()}`);
  }

  async review(
    itemId: string,
    decision: VerificationDecision,
    reason: string | null
  ): Promise<ListingVerificationView> {
    const body = reason ? { decision, reason } : { decision };
    return (
      await call<{ data: ListingVerificationView }>(
        `${itemPath(itemId)}/review`,
        json('POST', body)
      )
    ).data;
  }

  async readFile(itemId: string, kind: VerificationFileKind): Promise<Blob> {
    const response = await firebaseApiFetch(`${itemPath(itemId)}/files/${kind}`, {}, OPTIONS);
    if (!response.ok) return fail(response);
    return response.blob();
  }
}
