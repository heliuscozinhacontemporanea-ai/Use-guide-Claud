import { ApiPartnerAdapter } from './adapters/apiPartnerAdapter';
import { ApiPartnerContentAdapter } from './adapters/apiPartnerContentAdapter';
import { PartnerPort } from './ports/partnerPort';
import { PartnerContentPort } from './ports/partnerContentPort';

export const partnerAdapter: PartnerPort = new ApiPartnerAdapter();
export const partnerContentAdapter: PartnerContentPort = new ApiPartnerContentAdapter();
import { ApiListingVerificationAdapter } from './adapters/apiListingVerificationAdapter';
import type { ListingVerificationPort } from './ports/listingVerificationPort';

export const listingVerificationAdapter: ListingVerificationPort =
  new ApiListingVerificationAdapter();
