export interface SubscriptionPlan {
  id: 'trial' | 'monthly' | 'semi-annual' | 'annual';
  name: string;
  price: number;
  period: string;
  monthlyEquivalent: number | null;
  savingLabel: string | null;
  description: string;
  badge?: string;
  isActive: boolean;
}

export interface UpdateSubscriptionPlanInput {
  name?: string;
  price?: number;
  period?: string;
  description?: string;
  isActive?: boolean;
}

export type PersistedSubscriptionPlanUpdate = UpdateSubscriptionPlanInput & {
  monthlyEquivalent?: number | null;
};
