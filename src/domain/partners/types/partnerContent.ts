import type { EventSalesPolicy, EventSessionDraft } from '../../events';
export interface PartnerOperationalInfo {
  /** Passeio, translado e aluguel (decisão D9). */
  itinerary?: string;
  includes?: string[];
  transferRoutes?: Array<{ from: string; to: string }>;
  vehicleTypes?: string[];
  luggageInfo?: string;
  tags?: string[];
  cuisineType?: string;
  subcategory?: string;
  amenities?: string[] | string;
  /** Gravado pelo editor do admin; a busca do guia lê. */
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

export type DeclinedLink = 'instagram' | 'website' | 'menu';

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
  salesPolicy?: EventSalesPolicy;
  /** Política do evento já publicado: só pode trocar por uma igual ou mais flexível (D14). */
  publishedCancellationPolicy?: string;
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
  /** Estado (UF) e cidade; o fuso (`timeZone`) é calculado pelo servidor (D28). */
  state?: string;
  city?: string;
  timeZone?: string;
  tags?: string[];
  ownerId?: string;
  partnerId?: string;
  establishmentId?: string;
  isVerified?: boolean;
  verifiedUntil?: string | null;
  isVerificationSuspended?: boolean;
  verificationType?: 'trial' | 'monthly' | 'semi-annual' | 'annual' | 'admin' | null;
  operationalInfo?: PartnerOperationalInfo;
  /** Links que o dono declarou não ter ("Não tenho", D34). */
  declinedLinks?: DeclinedLink[];
  /** Rascunho fica fora do guia até ser publicado (D34). */
  publication?: 'draft' | 'published';
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
  /** `tips` só o admin cria (escolhas da F4); o servidor confere o papel. */
  category: 'sight' | 'hotel' | 'restaurant' | 'tour' | 'transfer' | 'rental' | 'producer' | 'tips';
  image: string;
  images: string[];
  location: string;
  instagramLink?: string;
  websiteLink?: string;
  bookingLink?: string;
  phone?: string;
  googleMapsLink?: string;
  address?: string;
  /** Estado (UF) e cidade; o fuso (`timeZone`) é calculado pelo servidor (D28). */
  state?: string;
  city?: string;
  timeZone?: string;
  tags?: string[];
  operationalInfo?: Record<string, unknown>;
  declinedLinks?: DeclinedLink[];
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
  /** Estado (UF) e cidade; o fuso (`timeZone`) é calculado pelo servidor (D28). */
  state?: string;
  city?: string;
  timeZone?: string;
  tags?: string[];
  operationalInfo?: Record<string, unknown>;
  isActive?: boolean;
  salesPolicy?: EventSalesPolicy;
  /** Sessões iniciais do evento novo; depois, as sessões são gravadas pelo domínio events. */
  occurrences?: Array<{ startsAt: string; endsAt: string; capacity: number }>;
}
