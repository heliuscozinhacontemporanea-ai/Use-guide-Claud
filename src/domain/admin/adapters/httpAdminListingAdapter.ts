import { firebaseApiFetch } from '../../../shared/infrastructure/firebase/firebaseApiFetch';
import type { AdminListingPort } from '../ports/adminListingPort';
import type { AdminListingView } from '../types/adminListing';

export class HttpAdminListingAdapter implements AdminListingPort {
  async getListing(itemId: string): Promise<AdminListingView> {
    const response = await firebaseApiFetch(
      `/api/admin/listings/${encodeURIComponent(itemId)}`,
      { method: 'GET' },
      { requireAuth: true, requireAppCheck: true }
    );
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      // A tela traduz pelo código (AGENTS.md §12.5).
      throw new Error(body?.error?.code || 'ADMIN_LISTING_UNAVAILABLE');
    }
    return body.data as AdminListingView;
  }
}
