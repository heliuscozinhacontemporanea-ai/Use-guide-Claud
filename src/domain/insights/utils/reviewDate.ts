import type { ReviewDateValue } from '../../reviews';

type ReviewDateInput = ReviewDateValue | { toDate?: () => Date };

/** Data de avaliação no fuso do negócio; aceita o Timestamp do Firestore, que expõe `toDate()`. */
export function formatReviewDate(value: ReviewDateInput, locale: string): string {
  let date: Date | null = null;
  if (value instanceof Date) date = value;
  else if (typeof value === 'string' || typeof value === 'number') date = new Date(value);
  else if (value && typeof value.toDate === 'function') date = value.toDate();
  if (!date || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, { timeZone: 'America/Fortaleza' }).format(date);
}
