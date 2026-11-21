import { isBrState } from '../../../shared/utils/timeZones';
import { buildOperationalInfo } from '../application/mappers/partnerSubmissionToGuide';
import type {
  DeclinedLink,
  PartnerContentItemInput,
  PartnerContentRecord,
  PartnerOperationalInfo,
} from '../types/partnerContent';
import type { FormState } from '../types/partsForm';

/** "@perfil" vira o link do Instagram: o anúncio grava links completos. */
function instagramLink(value: string): string {
  const text = value.trim();
  const handle = /^@?([A-Za-z0-9._]{1,30})$/.exec(text)?.[1];
  return handle ? `https://instagram.com/${handle}` : text;
}

// Campos que o servidor aceita no `operationalInfo` (allowlist, AGENTS.md §7.3): o anúncio lido do
// Firestore pode trazer campos que saíram do cadastro (F3, D34), e o servidor recusaria a gravação.
const OPERATIONAL_INFO_FIELDS: Record<keyof PartnerOperationalInfo, true> = {
  itinerary: true,
  includes: true,
  transferRoutes: true,
  vehicleTypes: true,
  luggageInfo: true,
  tags: true,
  cuisineType: true,
  subcategory: true,
  amenities: true,
  amenitiesRestaurant: true,
  additionalServices: true,
  mealTypes: true,
  activities: true,
  services: true,
  languages: true,
  menuLink: true,
  access: true,
  breakfast: true,
  checkIn: true,
  checkOut: true,
  childrenAllowed: true,
  petsPolicy: true,
  petsExtraCost: true,
  operatingHours: true,
};

function knownFields(info: PartnerOperationalInfo | undefined): PartnerOperationalInfo {
  return Object.fromEntries(
    Object.entries(info ?? {}).filter(([key]) => key in OPERATIONAL_INFO_FIELDS)
  ) as PartnerOperationalInfo;
}

/** Páginas do guia de passos que gravam algo no anúncio (D34). */
export type ListingStepEdit =
  | 'name'
  | 'photos'
  | 'about'
  | 'where'
  | 'details'
  | 'contacts'
  | 'phone';

/** Listas de múltipla escolha que aceitam "Nenhuma destas" (D34). */
const NONE_LISTS = [
  'amenities',
  'mealTypes',
  'additionalServices',
  'services',
  'activities',
] as const;

export interface ListingStepExtras {
  /** Fotos já enviadas, na ordem (a primeira é a capa). */
  images?: string[];
  /** Listas em que a pessoa marcou "Nenhuma destas". */
  none?: ReadonlySet<string>;
  /** Links que a pessoa declarou não ter. */
  declined?: ReadonlySet<DeclinedLink>;
  /** WhatsApp do negócio em E.164 (bloco só do editor, F2). */
  phone?: string;
}

function withDeclined(
  item: PartnerContentRecord,
  touched: DeclinedLink[],
  declined: ReadonlySet<DeclinedLink> | undefined
): DeclinedLink[] {
  const kept = (item.declinedLinks ?? []).filter((link) => !touched.includes(link));
  return [...kept, ...touched.filter((link) => declined?.has(link))];
}

/**
 * Lista vazia sem "Nenhuma destas" ainda não foi respondida: não vai para o anúncio, para o passo
 * continuar aberto (a regra do servidor conta lista vazia como respondida).
 */
function dropUnanswered(info: Record<string, unknown>, none: ReadonlySet<string> | undefined) {
  for (const key of NONE_LISTS) {
    const value = info[key];
    if (Array.isArray(value) && value.length === 0 && !none?.has(key)) delete info[key];
  }
  return info;
}

/**
 * O que a página de um passo grava: só os campos dela, sobre o que o anúncio já tem (o servidor troca
 * o `operationalInfo` inteiro a cada salvamento).
 */
export function listingStepUpdate(
  step: ListingStepEdit,
  item: PartnerContentRecord,
  form: FormState,
  extras: ListingStepExtras = {}
): Partial<PartnerContentItemInput> {
  const current = knownFields(item.operationalInfo);
  switch (step) {
    case 'name':
      return {
        name: form.businessName.trim(),
        ...(isBrState(form.state) && form.city?.trim()
          ? { state: form.state, city: form.city.trim() }
          : {}),
      };
    case 'phone':
      return extras.phone ? { phone: extras.phone } : {};
    case 'photos': {
      const images = extras.images ?? item.images ?? [];
      return { images, image: images[0] ?? '' };
    }
    case 'about':
      return {
        description: form.description.trim(),
        operationalInfo: { ...current, languages: form.languages ?? [] },
      };
    case 'where':
      return {
        address: form.address?.trim() ?? '',
        googleMapsLink: form.googleMaps?.trim() ?? '',
        location: form.region?.trim() ?? '',
        ...(isBrState(form.state) && form.city?.trim()
          ? { state: form.state, city: form.city.trim() }
          : {}),
      };
    case 'details': {
      const details = dropUnanswered(
        { ...(buildOperationalInfo({ ...form, region: form.region ?? '' }) ?? {}) },
        extras.none
      );
      const operationalInfo = { ...current, ...details, languages: current.languages };
      for (const key of NONE_LISTS) {
        if (!(key in details)) delete (operationalInfo as Record<string, unknown>)[key];
      }
      if (item.category === 'hotel') {
        return { operationalInfo, bookingLink: form.bookingLinks?.trim() ?? '' };
      }
      if (item.category === 'restaurant') {
        const declinedLinks = withDeclined(item, ['menu'], extras.declined);
        const menuLink = declinedLinks.includes('menu') ? '' : (operationalInfo.menuLink ?? '');
        return { operationalInfo: { ...operationalInfo, menuLink }, declinedLinks };
      }
      return { operationalInfo };
    }
    case 'contacts': {
      const declinedLinks = withDeclined(item, ['instagram', 'website'], extras.declined);
      return {
        instagramLink: declinedLinks.includes('instagram')
          ? ''
          : instagramLink(form.instagram ?? ''),
        websiteLink: declinedLinks.includes('website') ? '' : (form.website?.trim() ?? ''),
        declinedLinks,
      };
    }
  }
}
