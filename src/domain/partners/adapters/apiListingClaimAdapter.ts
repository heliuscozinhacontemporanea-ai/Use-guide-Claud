import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { ListingClaimPort } from '../ports/listingClaimPort';
import type {
  AdminListingClaim,
  ListingClaimStatus,
  MyListingClaim,
  SubmitListingClaimPayload,
} from '../types/listingClaim';
import type { VerificationDecision, VerificationFileKind } from '../types/listingVerification';

const OPTIONS = { requireAuth: true, requireAppCheck: true } as const;
const BASE = '/api/listing-claims';
const PAGE_SIZE = 20;

async function ok(response: Response): Promise<Response> {
  if (response.ok) return response;
  const data = await response.json().catch(() => ({}));
  throw new Error(typeof data?.error?.code === 'string' ? data.error.code : 'INTERNAL_ERROR');
}

/** Lança Error com o `code` estável do backend (AGENTS.md §10.2); a UI traduz pelo código. */
async function call(path: string, init: RequestInit = { method: 'GET' }): Promise<Response> {
  return ok(await firebaseApiFetch(path, init, OPTIONS));
}

function post(body: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export class ApiListingClaimAdapter implements ListingClaimPort {
  async submit(itemId: string, payload: SubmitListingClaimPayload): Promise<void> {
    await call(`${BASE}/items/${encodeURIComponent(itemId)}`, post(payload));
  }

  async listMine(): Promise<MyListingClaim[]> {
    return ((await (await call(`${BASE}/mine`)).json()) as { data: MyListingClaim[] }).data;
  }

  async listForReview(
    status: ListingClaimStatus,
    cursor: string | null
  ): Promise<{ data: AdminListingClaim[]; nextCursor: string | null }> {
    const params = new URLSearchParams({ status, limit: String(PAGE_SIZE) });
    if (cursor) params.set('cursor', cursor);
    return (await (await call(`${BASE}?${params}`)).json()) as {
      data: AdminListingClaim[];
      nextCursor: string | null;
    };
  }

  async review(
    claimId: string,
    decision: VerificationDecision,
    reason: string | null
  ): Promise<void> {
    await call(
      `${BASE}/${encodeURIComponent(claimId)}/review`,
      post(reason ? { decision, reason } : { decision })
    );
  }

  async returnToUseGuide(claimId: string): Promise<void> {
    await call(`${BASE}/${encodeURIComponent(claimId)}/return`, post({}));
  }

  async readFile(claimId: string, kind: VerificationFileKind): Promise<Blob> {
    return (await call(`${BASE}/${encodeURIComponent(claimId)}/files/${kind}`)).blob();
  }
}
