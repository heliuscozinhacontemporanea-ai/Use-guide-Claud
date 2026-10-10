export type GuideVerificationType = 'trial' | 'monthly' | 'semi-annual' | 'annual' | null;

export type GuideItemCategory = 'restaurant' | 'sight' | 'tour' | 'tips' | 'hotel';

export interface GuideOperationalInfo {
  tags?: string[];
  cuisineType?: string;
  subcategory?: string;
  amenities?: string[] | string;
  amenitiesRestaurant?: string[] | string;
  additionalServices?: string[] | string;
  mealTypes?: string[] | string;
  activities?: string[] | string;
  services?: string[] | string;
  languages?: string[] | string;
  menuLink?: string;
  access?: string;
  price?: string;
  breakfast?: {
    serves?: boolean;
    types?: string[];
    included?: boolean;
    price?: string;
  };
  checkIn?: {
    from: string;
    to: string;
  };
  checkOut?: {
    from: string;
    to: string;
  };
  childrenAllowed?: boolean;
  petsPolicy?: string;
  petsExtraCost?: string;
  operatingHours?: Record<
    string,
    {
      open: string;
      close: string;
      closed: boolean;
    }
  >;
}

export type EventEntryType = 'pago' | 'gratuito';

export interface GuideCatalogFields {
  name: string;
  description: string;
  image: string;
  images: string[];
  location: string;
  googleMapsType?: string;
  mapLink?: string;
  instagramLink?: string;
  websiteLink?: string;
  bookingLink?: string;
  whatsappLink?: string;
  googleMapsLink?: string;
  address?: string;
  tags?: string[];
  operationalInfo?: GuideOperationalInfo;
  isActive: boolean;
  date?: string;
  endDate?: string;
  eventCategory?: string;
  customCategory?: string;
  entryType?: EventEntryType;
}

export interface GuideRatingAggregate {
  rating: number;
  reviewCount: number;
}

export interface GuideVerification {
  isVerified: boolean;
  verifiedUntil: string | null;
  verificationType: GuideVerificationType;
  isVerificationSuspended: boolean;
}

export interface GuideItemRecord
  extends GuideCatalogFields,
    GuideRatingAggregate,
    GuideVerification {
  id: string;
  category: GuideItemCategory;
  ownerId: string;
  partnerId?: string;
}

export interface GuideCreateItemInput {
  name: string;
  description: string;
  category: GuideItemCategory;
  image: string;
  images: string[];
  location: string;
  googleMapsType?: string;
  mapLink?: string;
  instagramLink?: string;
  websiteLink?: string;
  bookingLink?: string;
  whatsappLink?: string;
  googleMapsLink?: string;
  address?: string;
  tags?: string[];
  operationalInfo?: GuideOperationalInfo;
  isActive?: boolean;
}

export interface GuideUpdateItemInput {
  name?: string;
  description?: string;
  category?: GuideItemCategory;
  image?: string;
  images?: string[];
  location?: string;
  googleMapsType?: string;
  mapLink?: string;
  instagramLink?: string;
  websiteLink?: string;
  bookingLink?: string;
  whatsappLink?: string;
  googleMapsLink?: string;
  address?: string;
  tags?: string[];
  operationalInfo?: GuideOperationalInfo;
  isActive?: boolean;
}
