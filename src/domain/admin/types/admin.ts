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
  price: number;
  period: string;
  monthlyEquivalent: number | null;
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
  category: string;
  status: 'active' | 'pending' | 'suspended';
  isVerified: boolean;
  verifiedUntil: string | null;
  verificationType: 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;
}
