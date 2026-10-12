export interface PartnerBusiness {
  businessId: string;
  businessName: string;
  type: 'item' | 'event';
}

export type PartnerCategory = 'sight' | 'hotel' | 'restaurant' | 'event';

export interface PublicPartnerProfile {
  id: string;
  businesses: PartnerBusiness[];
  category: PartnerCategory | null;
  isVerified: boolean;
  verifiedUntil: string | null;
  isVerificationSuspended: boolean;
  status: 'active' | 'pending' | 'suspended';
}

export interface PartnerRegistrationPayload {
  category: PartnerCategory;
  cpfCnpj: string;
  termsAccepted: true;
}

export interface PartnerSubmissionData {
  businessName: string;
  description: string;
  category: PartnerCategory;
  region: string;
  instagram: string;
  website: string;
  bookingLinks: string;
  phone: string;
  googleMaps: string;
  address: string;
  firstName: string;
  lastName: string;
  email: string;
  cpfCnpj: string;
  childrenAllowed?: boolean | null;
  petsPolicy?: string;
  petsExtraCost?: string;
  checkInFrom?: string;
  checkInTo?: string;
  checkOutFrom?: string;
  checkOutTo?: string;
  languages?: string[];
  amenities?: string[];
  servesBreakfast?: boolean | null;
  breakfastIncluded?: boolean | null;
  breakfastPrice?: string;
  breakfastTypes?: string[];
  subcategory?: string;
  cuisineType?: string;
  mealTypes?: string[];
  additionalServices?: string[];
  amenitiesRestaurant?: string[];
  operatingHours?: Record<string, { open: string; close: string; closed: boolean }>;
  menuLink?: string;
  sightActivities?: string[];
  sightServices?: string[];
  sightAmenities?: string[];
  sightAccessType?: string;
  sightPrice?: string;
}

export type PartnerVerificationType =
  | 'trial'
  | 'monthly'
  | 'semi-annual'
  | 'annual'
  | 'admin'
  | null;

export interface PartnerProfile {
  id: string;
  businessId?: string | null;
  businessName: string;
  category: PartnerCategory;
  businesses?: PartnerBusiness[];
  cpfCnpj?: string;
  phone?: string;
  phoneDdi?: string;
  instagram?: string;
  website?: string;
  bookingLinks?: string;
  googleMaps?: string;
  address?: string;
  region?: string;
  images?: string[];
  isVerified?: boolean;
  isVerificationSuspended?: boolean;
  verifiedUntil?: string | null;
  verificationType?: PartnerVerificationType;
  hasUsedTrial?: boolean;
  status?: 'active' | 'pending' | 'suspended';
  firstName?: string;
  lastName?: string;
  email?: string;
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
