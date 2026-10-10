import {
  PartnerProfile,
  PartnerRegistrationPayload,
  PartnerVerificationType,
} from '../types/partner';

export interface PartnerPort {
  registerPartner(payload: PartnerRegistrationPayload): Promise<void>;
  activateTrial(partnerId: string): Promise<void>;
  getPartnerProfile(partnerId: string): Promise<PartnerProfile | null>;
  getAllPartners(): Promise<PartnerProfile[]>;
  updatePartnerStatus(partnerId: string, status: 'active' | 'pending' | 'suspended'): Promise<void>;
  updatePartnerVerification(
    partnerId: string,
    isVerified: boolean,
    verifiedUntil: string | null,
    verificationType: PartnerVerificationType
  ): Promise<void>;
  deletePartnerProfile(partnerId: string): Promise<void>;
}
