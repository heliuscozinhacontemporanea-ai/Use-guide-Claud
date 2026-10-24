// Interface para consolidação de estatísticas administrativas e relatórios (Reports)
export interface AdminStats {
  totalItems: number;
  totalEvents: number;
  totalUsers: number;
  totalReviews: number;
  avgRating: number;
  itemsByCategory: Record<string, number>;
  itemsByLocation: Record<string, number>;
}

export interface SubscriptionPlan {
  id: 'trial' | 'monthly' | 'semi-annual' | 'annual';
  name: string;
  /** Preço total do período, em centavos. */
  priceMinor: number;
  period: string;
  /** Equivalente mensal em centavos (planos de 6 e 12 meses). */
  monthlyEquivalentMinor: number | null;
  savingLabel: string | null;
  description: string;
  badge?: string;
  isActive: boolean;
}

export interface AdminPartnerSummary {
  id: string;
  businessName: string;
  firstName: string;
  lastName: string;
  email: string;
  listingsCount: number;
  status: 'active' | 'suspended';
}
