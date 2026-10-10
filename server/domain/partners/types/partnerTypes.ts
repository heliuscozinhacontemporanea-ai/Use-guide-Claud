export type PartnerStatus = 'active' | 'pending' | 'suspended';

export type PartnerCategory = 'sight' | 'hotel' | 'restaurant' | 'event';

export type PartnerVerificationType = 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;

export type PartnerBusinessType = 'item' | 'event';

export interface PartnerBusiness {
  businessId: string;
  businessName: string;
  type: PartnerBusinessType;
}

export interface PartnerRegistrationData {
  category: PartnerCategory;
  cpfCnpj: string;
  termsAccepted: true;
}

export interface RegisterPartnerResult {
  created: boolean;
}

export interface PartnerVerificationData {
  isVerified: boolean;
  verifiedUntil: string | null;
  verificationType: PartnerVerificationType;
  isVerificationSuspended: boolean;
}

export interface PartnerTrialState {
  hasUsedTrial: boolean;
  isVerified: boolean;
  verifiedUntil: string | null;
  verificationType: PartnerVerificationType;
  isVerificationSuspended: boolean;
}

export interface PartnerPersistenceDocument {
  id: string;
  category: string;
  cpfCnpj?: string;
  cpfCnpjClean?: string;
  status: PartnerStatus;
  businesses: PartnerBusiness[];
  isVerified: boolean;
  verifiedUntil: string | null;
  verificationType: PartnerVerificationType;
  isVerificationSuspended: boolean;
  hasUsedTrial: boolean;
  termsAccepted: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PartnerProfileDTO {
  id: string;
  category: PartnerCategory;
  cpfCnpj?: string;
  status: PartnerStatus;
  businesses: PartnerBusiness[];
  isVerified: boolean;
  verifiedUntil: string | null;
  verificationType: PartnerVerificationType;
  isVerificationSuspended: boolean;
  hasUsedTrial: boolean;
  termsAccepted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicPartnerProfileDTO {
  id: string;
  businesses: PartnerBusiness[];
  category: PartnerCategory | null;
  isVerified: boolean;
  verifiedUntil: string | null;
  isVerificationSuspended: boolean;
  status: PartnerStatus;
}

export type PartnerProfileDocument = PartnerProfileDTO;
