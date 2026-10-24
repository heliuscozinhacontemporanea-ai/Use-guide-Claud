/** `admin`: selo concedido pela equipe sem plano pago (D8, por estabelecimento na D11). */
export type ListingPlanType = 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin';

/** Cópia pública do selo gravada pelo backend no cadastro e nos eventos dele. */
export interface ListingSeal {
  isVerified: boolean;
  verifiedUntil: string | null;
  verificationType: ListingPlanType | null;
  isVerificationSuspended: boolean;
}

/** Plano de um estabelecimento como o dono o vê (`GET /api/listing-plans/:itemId`). */
export interface ListingPlanView {
  itemId: string;
  planType: ListingPlanType | null;
  planUntil: string | null;
  planActive: boolean;
  sealSuspended: boolean;
  seal: ListingSeal;
  trialAvailable: boolean;
}

export interface PlanListingOption {
  id: string;
  name: string;
}
