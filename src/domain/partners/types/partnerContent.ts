import type { EventSessionDraft } from '../../events';
export interface PartnerOperationalInfo {
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

export type PartnerContentCategory =
  | 'restaurant'
  | 'sight'
  | 'tour'
  | 'tips'
  | 'hotel'
  | 'transfer'
  | 'rental'
  | 'producer'
  | 'event';
export type EventEntryType = 'pago' | 'gratuito';

export type PartnerContentEditorState = Omit<PartnerContentRecord, 'category'> & {
  category: PartnerContentCategory | '';
  /** Sessões do evento em edição; as já salvas são lidas ao abrir o editor. */
  sessions?: EventSessionDraft[];
};

export interface PartnerContentRecord {
  id: string;
  contentType?: 'item' | 'event';
  name: string;
  description: string;
  category: PartnerContentCategory;
  image: string;
  images?: string[];
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
  ownerId?: string;
  partnerId?: string;
  establishmentId?: string;
  isVerified?: boolean;
  verifiedUntil?: string | null;
  isVerificationSuspended?: boolean;
  verificationType?: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
  operationalInfo?: PartnerOperationalInfo;
  isActive?: boolean;
  date?: string;
  endDate?: string;
  eventCategory?: string;
  customCategory?: string;
  entryType?: EventEntryType;
}

export interface PartnerContentItemInput {
  name: string;
  description: string;
  category: 'sight' | 'hotel' | 'restaurant' | 'tour' | 'transfer' | 'rental' | 'producer';
  image: string;
  images: string[];
  location: string;
  instagramLink?: string;
  websiteLink?: string;
  bookingLink?: string;
  phone?: string;
  googleMapsLink?: string;
  address?: string;
  tags?: string[];
  operationalInfo?: Record<string, unknown>;
  isActive?: boolean;
}

export interface PartnerContentEventInput {
  name: string;
  description: string;
  image: string;
  images: string[];
  location: string;
  date: string;
  endDate: string;
  eventCategory: string;
  customCategory?: string;
  entryType?: EventEntryType;
  establishmentId?: string;
  instagramLink?: string;
  websiteLink?: string;
  bookingLink?: string;
  phone?: string;
  googleMapsLink?: string;
  address?: string;
  tags?: string[];
  operationalInfo?: Record<string, unknown>;
  isActive?: boolean;
  /** Sessões iniciais do evento novo; depois, as sessões são gravadas pelo domínio events. */
  occurrences?: Array<{ startsAt: string; endsAt: string; capacity: number }>;
}
