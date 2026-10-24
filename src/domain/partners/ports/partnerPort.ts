import { PartnerAccountStatus, PartnerProfile, PartnerRegistrationPayload } from '../types/partner';

export interface PartnerPort {
  registerPartner(payload: PartnerRegistrationPayload): Promise<void>;
  getPartnerProfile(partnerId: string): Promise<PartnerProfile | null>;
  getAllPartners(): Promise<PartnerProfile[]>;
  updatePartnerStatus(partnerId: string, status: PartnerAccountStatus): Promise<void>;
  updatePartnerVerification(partnerId: string, isVerified: boolean): Promise<void>;
  deletePartnerProfile(partnerId: string): Promise<void>;
}
