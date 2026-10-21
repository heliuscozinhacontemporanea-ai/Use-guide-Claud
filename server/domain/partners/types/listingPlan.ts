/** `admin`: selo concedido pelo admin sem plano pago (D8, por estabelecimento na D11). */
export type ListingPlanType = 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin';
export type PaidListingPlanType = 'monthly' | 'semi-annual' | 'annual';

/**
 * `listingPlans/{itemId}`: só backend. O plano é do estabelecimento ou do perfil de produtor (D11).
 * `sealActive` guarda o último selo público gravado no item, para o job diário achar os vencidos.
 */
export interface ListingPlanRecord {
  itemId: string;
  ownerId: string;
  planType: ListingPlanType | null;
  planUntil: string | null;
  /** Selo retirado pelo admin sem mexer no plano pago (D8). */
  sealSuspended: boolean;
  sealActive: boolean;
  updatedAt: string;
}

/** Cópia pública do selo em `items` e `events`: os campos que os cards já leem. */
export interface ListingSeal {
  isVerified: boolean;
  verifiedUntil: string | null;
  verificationType: ListingPlanType | null;
  isVerificationSuspended: boolean;
}

/** O que o dono e o admin enxergam do plano de um estabelecimento. */
export interface ListingPlanView {
  itemId: string;
  planType: ListingPlanType | null;
  planUntil: string | null;
  planActive: boolean;
  sealSuspended: boolean;
  seal: ListingSeal;
  trialAvailable: boolean;
}

export interface PlanListing {
  id: string;
  ownerId: string;
}
