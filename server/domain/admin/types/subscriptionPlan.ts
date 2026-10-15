export interface SubscriptionPlan {
  id: 'trial' | 'monthly' | 'semi-annual' | 'annual';
  name: string;
  /** Preço total do período, em centavos (AGENTS.md §1). */
  priceMinor: number;
  period: string;
  /** Equivalente mensal em centavos, derivado do preço nos planos de 6 e 12 meses. */
  monthlyEquivalentMinor: number | null;
  savingLabel: string | null;
  description: string;
  badge?: string;
  isActive: boolean;
}

export interface UpdateSubscriptionPlanInput {
  name?: string;
  priceMinor?: number;
  period?: string;
  description?: string;
  isActive?: boolean;
}

export type PersistedSubscriptionPlanUpdate = UpdateSubscriptionPlanInput & {
  monthlyEquivalentMinor?: number | null;
};
