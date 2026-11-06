import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { CourtesyPort } from '../ports/courtesyPort';
import type { CourtesyLinkCreated, CourtesyLinkPreview, CourtesyRow } from '../types/courtesy';

async function call<T>(
  path: string,
  method: 'GET' | 'POST' | 'DELETE',
  body?: unknown,
  requireAuth = true
): Promise<T> {
  const res = await firebaseApiFetch(
    path,
    {
      method,
      ...(body
        ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
        : {}),
    },
    { requireAuth }
  );
  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error?.code || 'INTERNAL_ERROR');
  return json?.data as T;
}

const link = (id: string, action: 'preview' | 'accept') =>
  `/api/courtesies/links/${encodeURIComponent(id)}/${action}`;

export class HttpCourtesyAdapter implements CourtesyPort {
  listEventCourtesies(eventListingId: string): Promise<CourtesyRow[]> {
    return call(`/api/courtesies?eventListingId=${encodeURIComponent(eventListingId)}`, 'GET');
  }

  inviteCourtesy(occurrenceId: string, username: string): Promise<CourtesyRow> {
    return call('/api/courtesies', 'POST', { occurrenceId, username });
  }

  createCourtesyLink(occurrenceId: string): Promise<CourtesyLinkCreated> {
    return call('/api/courtesies/links', 'POST', { occurrenceId });
  }

  cancelCourtesy(courtesyId: string): Promise<void> {
    return call(`/api/courtesies/${encodeURIComponent(courtesyId)}`, 'DELETE');
  }

  // A página do link abre antes do login (p28).
  previewCourtesyLink(courtesyId: string, token: string): Promise<CourtesyLinkPreview> {
    return call(link(courtesyId, 'preview'), 'POST', { token }, false);
  }

  acceptCourtesyLink(courtesyId: string, token: string): Promise<{ ticketId: string | null }> {
    return call(link(courtesyId, 'accept'), 'POST', { token });
  }
}
