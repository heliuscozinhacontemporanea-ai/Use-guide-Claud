/** A verificação é por estabelecimento (D12); o status da conta só serve para suspensão. */
export type PartnerStatus = 'active' | 'suspended';

/** `admin`: selo concedido pelo admin, sem plano pago. */
export type PartnerVerificationType =
  | 'trial'
  | 'monthly'
  | 'semi-annual'
  | 'annual'
  | 'admin'
  | null;

export type PartnerBusinessType = 'item' | 'event';

export interface PartnerBusiness {
  businessId: string;
  businessName: string;
  type: PartnerBusinessType;
}

export interface PartnerRegistrationData {
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
  isVerified: boolean;
  verifiedUntil: string | null;
  isVerificationSuspended: boolean;
  status: PartnerStatus;
}

export type PartnerProfileDocument = PartnerProfileDTO;
