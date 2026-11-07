/**
 * Cartões do Início do painel (D27, seção 6.1 da proposta). Convidados entraram com a etapa 3 e
 * divulgadores com a 4. A ordem do array é a ordem da galeria; os seis primeiros são o padrão.
 */
export const PARTNER_HOME_CARD_IDS = [
  'today',
  'sales_today',
  'next_payout',
  'next_event',
  'reviews',
  'week_bookings',
  'guests',
  'promoters',
  'plan_seal',
  'week_occupancy',
  'month_sales',
] as const;

export type PartnerHomeCardId = (typeof PARTNER_HOME_CARD_IDS)[number];

export const DEFAULT_PARTNER_HOME_CARDS: readonly PartnerHomeCardId[] = PARTNER_HOME_CARD_IDS.slice(
  0,
  6
);

export function isPartnerHomeCardId(value: unknown): value is PartnerHomeCardId {
  return PARTNER_HOME_CARD_IDS.includes(value as PartnerHomeCardId);
}
