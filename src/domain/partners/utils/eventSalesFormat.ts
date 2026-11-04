import { formatBusinessDate, formatBusinessWeekday } from '../../../shared/utils/businessDateTime';
import { capitalizeFirst } from '../../../shared/utils/formatters';
import type { StatusTone } from '../../../ui/components/StatusText';
import type { PartnerOrderStatus } from '../types/partnerHome';

export const ORDER_TONE: Record<PartnerOrderStatus, StatusTone> = {
  paid: 'success',
  refund_requested: 'warn',
  partially_refunded: 'info',
  refunded: 'muted',
  disputed: 'danger',
};

/** "Sáb., 20 de dez. · 20:00" no fuso do negócio. */
export function sessionLabel(iso: string, locale: string): string {
  const time = formatBusinessDate(iso, locale, { hour: '2-digit', minute: '2-digit' });
  return `${capitalizeFirst(formatBusinessWeekday(iso, locale), locale)} · ${time}`;
}
