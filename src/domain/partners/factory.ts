import { ApiPartnerAdapter } from './adapters/apiPartnerAdapter';
import { ApiPartnerContentAdapter } from './adapters/apiPartnerContentAdapter';
import { PartnerPort } from './ports/partnerPort';
import { PartnerContentPort } from './ports/partnerContentPort';

export const partnerAdapter: PartnerPort = new ApiPartnerAdapter();
export const partnerContentAdapter: PartnerContentPort = new ApiPartnerContentAdapter();
