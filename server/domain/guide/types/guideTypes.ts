import type { BrState } from '../../../shared/kernel/timeZones';
export type GuideVerificationType = 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;

/** `producer`: perfil de produtor de eventos, sem endereço fixo; não aparece nas listagens do guia. */
export type GuideItemCategory =
  | 'restaurant'
  | 'sight'
  | 'tour'
  | 'tips'
  | 'hotel'
  | 'transfer'
  | 'rental'
  | 'producer';

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
  breakfast?: {
    serves?: boolean;
    types?: string[];
    included?: boolean;
    price?: string;
  };
  /** Passeio, translado e aluguel (decisão D9). */
  itinerary?: string;
  includes?: string[];
  transferRoutes?: Array<{ from: string; to: string }>;
  vehicleTypes?: string[];
  luggageInfo?: string;
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

/** Anúncio novo nasce como rascunho, fora do guia, até o dono publicar (D34). */
export type GuidePublication = 'draft' | 'published';

/** Link que o dono declarou não ter ("Não tenho"), para o passo do guia poder ser concluído (D34). */
export const GUIDE_DECLINED_LINKS = ['instagram', 'website', 'menu'] as const;
export type GuideDeclinedLink = (typeof GUIDE_DECLINED_LINKS)[number];

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
  phone?: string;
  googleMapsLink?: string;
  address?: string;
  /** Estado (UF) e cidade do lugar; dão o fuso (D28). */
  state?: BrState;
  city?: string;
  /** Fuso do lugar (IANA), calculado no servidor pelo estado e pela cidade (D28). */
  timeZone?: string;
  tags?: string[];
  operationalInfo?: GuideOperationalInfo;
  declinedLinks?: GuideDeclinedLink[];
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
  publication: GuidePublication;
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
  /** Estado (UF) e cidade do lugar; dão o fuso (D28). */
  state?: BrState;
  city?: string;
  /** Fuso do lugar (IANA), calculado no servidor pelo estado e pela cidade (D28). */
  timeZone?: string;
  tags?: string[];
  operationalInfo?: GuideOperationalInfo;
  declinedLinks?: GuideDeclinedLink[];
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
  phone?: string;
  googleMapsLink?: string;
  address?: string;
  /** Estado (UF) e cidade do lugar; dão o fuso (D28). */
  state?: BrState;
  city?: string;
  /** Fuso do lugar (IANA), calculado no servidor pelo estado e pela cidade (D28). */
  timeZone?: string;
  tags?: string[];
  operationalInfo?: GuideOperationalInfo;
  declinedLinks?: GuideDeclinedLink[];
  isActive?: boolean;
}
