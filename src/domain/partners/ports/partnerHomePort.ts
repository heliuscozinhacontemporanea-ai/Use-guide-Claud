import type { PartnerHomeView } from '../types/partnerHome';

export interface PartnerHomePort {
  get(): Promise<PartnerHomeView>;
}
