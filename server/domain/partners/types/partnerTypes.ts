/** A verificação é por estabelecimento (D12); o status da conta só serve para suspensão. */
export type PartnerStatus = 'active' | 'suspended';

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

export interface PartnerPersistenceDocument {
  id: string;
  status: PartnerStatus;
  businesses: PartnerBusiness[];
  /** Um trial por conta (D11); o plano e o selo são de cada estabelecimento (`listingPlans`). */
  hasUsedTrial: boolean;
  termsAccepted: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PartnerProfileDTO {
  id: string;
  status: PartnerStatus;
  businesses: PartnerBusiness[];
  /** Um trial por conta (D11); o plano e o selo são de cada estabelecimento (`listingPlans`). */
  hasUsedTrial: boolean;
  termsAccepted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicPartnerProfileDTO {
  id: string;
  businesses: PartnerBusiness[];
  status: PartnerStatus;
}

export type PartnerProfileDocument = PartnerProfileDTO;
