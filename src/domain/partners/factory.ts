import { ApiListingPlanAdapter } from './adapters/apiListingPlanAdapter';
import { ApiListingVerificationAdapter } from './adapters/apiListingVerificationAdapter';
import { ApiPartnerAdapter } from './adapters/apiPartnerAdapter';
import { ApiPartnerContentAdapter } from './adapters/apiPartnerContentAdapter';
import type { ListingPlanPort } from './ports/listingPlanPort';
import type { ListingVerificationPort } from './ports/listingVerificationPort';
import { PartnerPort } from './ports/partnerPort';
import { PartnerContentPort } from './ports/partnerContentPort';

export const partnerAdapter: PartnerPort = new ApiPartnerAdapter();
export const partnerContentAdapter: PartnerContentPort = new ApiPartnerContentAdapter();
export const listingVerificationAdapter: ListingVerificationPort =
  new ApiListingVerificationAdapter();
export const listingPlanAdapter: ListingPlanPort = new ApiListingPlanAdapter();
