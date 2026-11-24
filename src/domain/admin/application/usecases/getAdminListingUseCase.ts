import { adminListingAdapter } from '../../factory';
import type { AdminListingView } from '../../types/adminListing';

/** Passos, publicação e dono do anúncio, para o editor do admin (escolhas da F4). */
export function getAdminListingUseCase(itemId: string): Promise<AdminListingView> {
  return adminListingAdapter.getListing(itemId);
}
