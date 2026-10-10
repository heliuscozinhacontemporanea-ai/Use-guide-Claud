import type {
  PartnerBusiness,
  PartnerProfileDocument,
  PartnerRegistrationData,
  PartnerStatus,
  PartnerTrialState,
  PartnerVerificationData,
  RegisterPartnerResult,
} from '../types/partnerTypes';

export interface PartnerPort {
  registerPartner(uid: string, data: PartnerRegistrationData): Promise<RegisterPartnerResult>;
  getPartnerProfile(partnerId: string): Promise<PartnerProfileDocument | null>;
  updatePartnerVerificationProfile(
    partnerId: string,
    verification: PartnerVerificationData
  ): Promise<void>;
  updatePartnerStatus(partnerId: string, status: PartnerStatus): Promise<void>;
  activateTrialAtomically(partnerId: string, verifiedUntil: string): Promise<void>;
  restoreTrialStateAtomically(partnerId: string, state: PartnerTrialState): Promise<void>;
  linkBusiness(partnerId: string, business: PartnerBusiness): Promise<void>;
  updateBusiness(partnerId: string, business: PartnerBusiness): Promise<void>;
  unlinkBusiness(partnerId: string, businessId: string): Promise<void>;
  getAllPartnerIds(): Promise<string[]>;
  getAllPartners(): Promise<PartnerProfileDocument[]>;
  deletePartnerProfile(partnerId: string): Promise<void>;
}
