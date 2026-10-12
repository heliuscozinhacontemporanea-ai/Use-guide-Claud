export interface GuideItemOperationalInfo {
  /** Passeio, translado e aluguel (decisão D9). */
  durationMinutes?: number;
  meetingPoint?: string;
  itinerary?: string;
  includes?: string[];
  transferRoutes?: Array<{ from: string; to: string }>;
  vehicleTypes?: string[];
  maxPassengers?: number;
  luggageInfo?: string;
  minRentalHours?: number;
  depositRequired?: boolean;
  driverLicenseRequired?: boolean;
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

/** `producer`: perfil de produtor de eventos; não aparece nas listagens do guia (decisão D9). */
export type GuideItemCategory =
  | 'restaurant'
  | 'sight'
  | 'tour'
  | 'tips'
  | 'hotel'
  | 'transfer'
  | 'rental'
  | 'producer';

export type GuideContentType = 'item' | 'event';

export type EventEntryType = 'pago' | 'gratuito';

export interface GuideItem {
  id: string;
  contentType?: GuideContentType;
  name: string;
  description: string;
  category: GuideItemCategory | 'event';
  image: string;
  images?: string[];
  location: string;
  rating?: number;
  reviewCount?: number;
  googleMapsType?: string;
  mapLink?: string;
  instagramLink?: string;
  websiteLink?: string;
  bookingLink?: string;
  phone?: string;
  googleMapsLink?: string;
  address?: string;
  tags?: string[];
  partnerId?: string;
  ownerId?: string;
  establishmentId?: string;
  isVerified?: boolean;
  verifiedUntil?: string | null;
  isVerificationSuspended?: boolean;
  verificationType?: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
  operationalInfo?: GuideItemOperationalInfo;
  isActive?: boolean;
  date?: string;
  endDate?: string;
  eventCategory?: string;
  customCategory?: string;
  entryType?: EventEntryType;
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
  phone?: string;
  googleMapsLink?: string;
  address?: string;
  tags?: string[];
  operationalInfo?: GuideItemOperationalInfo;
  isActive?: boolean;
}

export type GuideUpdateItemInput = Partial<GuideCreateItemInput>;
