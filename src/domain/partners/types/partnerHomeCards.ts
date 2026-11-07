/**
 * Cartões do Início (D27). Mesma lista do servidor (`server/domain/partners/types/partnerHomeCards.ts`),
 * conferida por teste. A ordem é a da galeria; os seis primeiros são o padrão.
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

/** Grande ocupa a linha inteira; pequeno, meia linha. */
export const PARTNER_HOME_CARD_SIZE: Record<PartnerHomeCardId, 'small' | 'large'> = {
  today: 'large',
  sales_today: 'small',
  next_payout: 'small',
  next_event: 'large',
  reviews: 'small',
  week_bookings: 'small',
  guests: 'small',
  promoters: 'large',
  plan_seal: 'small',
  week_occupancy: 'large',
  month_sales: 'small',
};

export function isPartnerHomeCardId(value: string): value is PartnerHomeCardId {
  return (PARTNER_HOME_CARD_IDS as readonly string[]).includes(value);
}
