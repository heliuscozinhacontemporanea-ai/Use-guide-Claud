import type { AdminListingView } from '../types/adminListing';

export interface AdminListingPort {
  getListing(itemId: string): Promise<AdminListingView>;
}
