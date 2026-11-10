import { i18n } from '../../../shared/i18n';

/** Duração curta para o cartão da oferta: "4 h", "1 h 30", "45 min". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return i18n.t('bookings.buyer.durationMinutes', { minutes });
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const label = i18n.t('bookings.buyer.durationHours', { hours });
  return rest ? `${label} ${String(rest).padStart(2, '0')}` : label;
}
