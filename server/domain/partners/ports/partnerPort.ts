import type {
  PartnerBusiness,
  PartnerProfileDocument,
  PartnerRegistrationData,
  PartnerStatus,
  RegisterPartnerResult,
} from '../types/partnerTypes';

export interface PartnerPort {
  registerPartner(uid: string, data: PartnerRegistrationData): Promise<RegisterPartnerResult>;
  getPartnerProfile(partnerId: string): Promise<PartnerProfileDocument | null>;
  updatePartnerStatus(partnerId: string, status: PartnerStatus): Promise<void>;
  linkBusiness(partnerId: string, business: PartnerBusiness): Promise<void>;
  updateBusiness(partnerId: string, business: PartnerBusiness): Promise<void>;
  unlinkBusiness(partnerId: string, businessId: string): Promise<void>;
  getAllPartnerIds(): Promise<string[]>;
  getAllPartners(): Promise<PartnerProfileDocument[]>;
  deletePartnerProfile(partnerId: string): Promise<void>;
}
