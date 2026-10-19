export interface PartnerBusiness {
  businessId: string;
  businessName: string;
  type: 'item' | 'event';
}

/** Categoria do primeiro cadastro na inscrição; `producer` cria o perfil de produtor de eventos. */
export type PartnerSignupCategory =
  | 'sight'
  | 'hotel'
  | 'restaurant'
  | 'tour'
  | 'transfer'
  | 'rental'
  | 'producer';

/** Status da conta só serve para suspensão; a verificação é por estabelecimento (D12). */
export type PartnerAccountStatus = 'active' | 'suspended';

export interface PublicPartnerProfile {
  id: string;
  businesses: PartnerBusiness[];
  isVerified: boolean;
  verifiedUntil: string | null;
  isVerificationSuspended: boolean;
  status: PartnerAccountStatus;
}

/** A conta não tem documento: CPF/CNPJ é de cada estabelecimento, na verificação (D12). */
export interface PartnerRegistrationPayload {
  termsAccepted: true;
}

export interface PartnerSubmissionData {
  businessName: string;
  description: string;
  /** Categoria do cadastro (validada na conversão para item do guia). */
  category: string;
  region: string;
  instagram: string;
  website: string;
  bookingLinks: string;
  phone: string;
  phoneDdi: string;
  googleMaps: string;
  address: string;
  firstName: string;
  lastName: string;
  email: string;
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
  tourDurationHours?: string;
  meetingPoint?: string;
  itinerary?: string;
  tourIncludes?: string[];
  transferRoutes?: Array<{ from: string; to: string }>;
  transferVehicles?: string[];
  maxPassengers?: string;
  luggageInfo?: string;
  rentalVehicles?: string[];
  minRentalHours?: string;
  depositRequired?: boolean | null;
  driverLicenseRequired?: boolean | null;
  rentalIncludes?: string[];
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
  businesses?: PartnerBusiness[];
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
  status?: PartnerAccountStatus;
  firstName?: string;
  lastName?: string;
  email?: string;
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
