import type { CatalogSegment } from '../components/panel/PartnerCatalogTab';
import type { PartnerPanelTab } from '../components/panel/partnerPanelTabs';
import type { PartnerHomeCardId } from '../types/partnerHomeCards';

/**
 * Segmentos do parceiro (painel por segmento, 2026-11-09): o painel mostra só o que ele vende ou
 * mostra no guia. Saem do que ele cadastrou; outro segmento entra pelo "Também trabalha com…?".
 */
export type PartnerSegment =
  | 'tours'
  | 'rentals'
  | 'transfers'
  | 'attraction'
  | 'events'
  | 'lodging'
  | 'restaurant';

const ORDER: readonly PartnerSegment[] = [
  'tours',
  'rentals',
  'transfers',
  'attraction',
  'events',
  'lodging',
  'restaurant',
];

const BY_CATEGORY: Record<string, PartnerSegment> = {
  tour: 'tours',
  rental: 'rentals',
  transfer: 'transfers',
  sight: 'attraction',
  producer: 'events',
  hotel: 'lodging',
  restaurant: 'restaurant',
};

/** Vendem pelo app (reservas, entradas ou ingressos): têm Agenda e Ganhos. */
const SELLING = new Set<PartnerSegment>(['tours', 'rentals', 'transfers', 'attraction', 'events']);
/** Vendem pelo domínio de reservas: aparecem em "Ofertas" do catálogo. */
const BOOKING = new Set<PartnerSegment>(['tours', 'rentals', 'transfers', 'attraction']);

export function partnerSegments(input: {
  categories: readonly string[];
  hasEvents: boolean;
}): PartnerSegment[] {
  const found = new Set<PartnerSegment>();
  for (const category of input.categories) {
    const segment = BY_CATEGORY[category];
    if (segment) found.add(segment);
  }
  if (input.hasEvents) found.add('events');
  return ORDER.filter((segment) => found.has(segment));
}

export const sellsThroughApp = (segments: readonly PartnerSegment[]) =>
  segments.some((segment) => SELLING.has(segment));

/** Sem cadastro ainda, o painel mostra tudo; só vitrine (hospedagem, restaurante), sem Agenda e Ganhos. */
export function panelTabsFor(segments: readonly PartnerSegment[]): PartnerPanelTab[] {
  if (segments.length === 0 || sellsThroughApp(segments)) {
    return ['home', 'agenda', 'catalog', 'earnings', 'more'];
  }
  return ['home', 'catalog', 'more'];
}

/** Nome da aba do catálogo: o do segmento, "Estabelecimento" na vitrine e "Ofertas" com dois ou mais. */
export function catalogTabLabel(
  segments: readonly PartnerSegment[]
): 'catalog' | 'offers' | 'place' | PartnerSegment {
  if (segments.length === 0) return 'catalog';
  if (!sellsThroughApp(segments)) return 'place';
  const selling = segments.filter((segment) => SELLING.has(segment));
  return selling.length === 1 && segments.length === 1 ? (selling[0] as PartnerSegment) : 'offers';
}

/** Partes do catálogo que fazem sentido para os segmentos. */
export function catalogSegmentsFor(segments: readonly PartnerSegment[]): CatalogSegment[] {
  if (segments.length === 0) return ['places', 'events', 'offers'];
  const parts: CatalogSegment[] = [];
  if (segments.some((segment) => segment !== 'events')) parts.push('places');
  if (segments.includes('events')) parts.push('events');
  if (segments.some((segment) => BOOKING.has(segment))) parts.push('offers');
  return parts;
}

/** Nome da parte "Ofertas" do catálogo: o do segmento de reserva, ou "Serviços" com vários. */
export function offersLabel(segments: readonly PartnerSegment[]): PartnerSegment | 'services' {
  const booking = segments.filter((segment) => BOOKING.has(segment));
  return booking.length === 1 ? (booking[0] as PartnerSegment) : 'services';
}

/** Linha da folha "Também trabalha com…?" (S3): hospedagem e restaurante dividem uma ("vitrine"). */
export type AddSegmentOption =
  | 'tours'
  | 'rentals'
  | 'transfers'
  | 'attraction'
  | 'events'
  | 'showcase';

const ADD_OPTIONS: ReadonlyArray<{
  id: AddSegmentOption;
  covers: readonly PartnerSegment[];
  categories: readonly string[];
}> = [
  { id: 'tours', covers: ['tours'], categories: ['tour'] },
  { id: 'rentals', covers: ['rentals'], categories: ['rental'] },
  { id: 'transfers', covers: ['transfers'], categories: ['transfer'] },
  { id: 'attraction', covers: ['attraction'], categories: ['sight'] },
  { id: 'events', covers: ['events'], categories: ['producer'] },
  { id: 'showcase', covers: ['lodging', 'restaurant'], categories: ['hotel', 'restaurant'] },
];

/**
 * Linhas da folha, com o que o parceiro já tem marcado. A vitrine só conta como "já tem" com
 * hospedagem e restaurante; com uma só, a linha abre o cadastro da outra.
 */
export function addSegmentOptions(segments: readonly PartnerSegment[]) {
  return ADD_OPTIONS.map((option) => {
    const missing = option.categories.filter(
      (category) => !segments.includes(BY_CATEGORY[category] as PartnerSegment)
    );
    return { id: option.id, has: missing.length === 0, categories: missing };
  });
}

/**
 * Cartões do Início que fazem sentido para os segmentos (S4); `null` = todos (sem cadastro ainda).
 * Vitrine (hospedagem, restaurante) fica com avaliações, plano e selo, sem venda nem agenda.
 */
export function homeCardsFor(segments: readonly PartnerSegment[]): PartnerHomeCardId[] | null {
  if (segments.length === 0) return null;
  const cards: PartnerHomeCardId[] = ['reviews', 'plan_seal'];
  if (sellsThroughApp(segments)) {
    cards.push('today', 'sales_today', 'next_payout', 'month_sales', 'promo_codes');
  }
  if (segments.includes('events')) cards.push('next_event', 'guests', 'promoters');
  if (segments.some((segment) => BOOKING.has(segment)))
    cards.push('week_bookings', 'week_occupancy');
  return cards;
}

/** Nome dos cupons no Mais: o do único segmento que vende, ou o genérico com vários (S4). */
export function couponsLabel(
  segments: readonly PartnerSegment[]
): Exclude<PartnerSegment, 'lodging' | 'restaurant'> | null {
  const selling = segments.filter((segment) => SELLING.has(segment));
  return selling.length === 1
    ? (selling[0] as Exclude<PartnerSegment, 'lodging' | 'restaurant'>)
    : null;
}
